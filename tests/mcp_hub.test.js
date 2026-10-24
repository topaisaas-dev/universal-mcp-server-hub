import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MCP_TOOLS, SERVER_INSTRUCTIONS } from '../bin/cli.js';
import { McpServer } from '../src/mcp_server.ts';

beforeEach(() => {
  McpServer.resetSandboxQuota();
});

test('MCP Tools Catalog - Integrity & Cold-Start Token Compression', async (t) => {
  const expectedTools = [
    "topai_web_to_markdown",
    "topai_b2b_data_leads",
    "topai_company_enrichment",
    "topai_ai_web_search",
    "topai_semantic_cache",
    "topai_invoice_extractor",
    "topai_headless_screenshot",
    "topai_prompt_shield",
    "topai_token_slimmer",
    "topai_agentvision_crop",
    "topai_math_fact_checker",
    "topai_techstack_fingerprint",
    "topai_polymarket_arbitrage",
    "topai_mcp_hub_registry",
    "topai_pharmapatent_watcher",
    "topai_healthcare_validator",
    "topai_google_ai_overview",
    "topai_disposable_email_shield",
    "topai_openapi_flattener"
  ];

  assert.equal(MCP_TOOLS.length, 19, 'Must have exactly 19 native MCP tools');
  expectedTools.forEach((name, idx) => {
    assert.equal(MCP_TOOLS[idx].name, name, `Tool at index ${idx} must be ${name}`);
    assert.ok(MCP_TOOLS[idx].description.length < 120, `Tool ${name} description must be compact (<120 chars)`);
  });

  const serializedBytes = Buffer.byteLength(JSON.stringify(MCP_TOOLS), 'utf8');
  assert.ok(serializedBytes < 11200, `Serialized MCP_TOOLS must be under 11.2 KB to prevent Cold-Start token bloat (got ${serializedBytes} bytes)`);
  assert.ok(SERVER_INSTRUCTIONS.length < 250, 'Server instructions must be concise');

  const listRes = await McpServer.handleJsonRpc({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  assert.equal(listRes.result.tools.length, 19);
  assert.equal(listRes.result.tools[0].outputSchema, undefined, "outputSchema must be omitted from wire tools/list to save Cold-Start tokens");
});

test('MCP Protocol - JSON-RPC 2.0 initialize specification', async (t) => {
  const res = await McpServer.handleJsonRpc({ jsonrpc: "2.0", id: 1, method: "initialize" });
  assert.equal(res.result.protocolVersion, "2024-11-05");
  assert.equal(res.result.serverInfo.name, "topai-mcp-hub");
  assert.equal(res.result.serverInfo.version, "1.0.5");
  assert.ok(res.result.capabilities.tools);
});

test('MCP Tool Execution - Math Fact Checker (VAT & Line-Item Invoice Reconciliation)', async (t) => {
  const res = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "topai_math_fact_checker",
      arguments: {
        operation: "invoice_reconcile",
        rate_percent: 20,
        items: [
          { description: "Cloudflare Enterprise Edge Seat", quantity: 4, unit_price: 250.00 },
          { description: "DORA Audit Trail Add-on", quantity: 2, unit_price: 175.50 }
        ]
      }
    }
  });
  const payload = JSON.parse(res.result.content[0].text);
  assert.equal(payload.status, "RECONCILED");
  assert.equal(payload.subtotal_ht, 1351.00);
  assert.equal(payload.vat_amount, 270.20);
  assert.equal(payload.total_ttc, 1621.20);
});

test('MCP Tool Execution - Token Slimmer Lossless TSV Compression (96 Quotes Benchmark)', async (t) => {
  const quotes = Array.from({ length: 96 }, (_, i) => ({
    quote_id: `Q-${1000 + i}`,
    product_sku: `SKU-${(i % 24) + 1}`,
    vendor: `Supplier ${(i % 6) + 1}`,
    unit_price_eur: 45.5 + (i % 15),
    lead_time_days: 3 + (i % 10),
    in_stock: i % 2 === 0
  }));
  const rawJson = JSON.stringify(quotes, null, 2);

  const res = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "topai_token_slimmer",
      arguments: { content: rawJson, format: "json" }
    }
  });
  const payload = JSON.parse(res.result.content[0].text);
  assert.ok(payload.compressed_length > 2500, "Must NOT truncate at 1,000 characters");
  assert.ok(payload.reduction_percent > 50, `Expected >50% reduction, got ${payload.reduction_percent}%`);
  assert.equal(payload.compressed_content.trim().split("\n").length, 98, "Must preserve TSV table marker + header + all 96 quote rows");
});

test('MCP Tool Execution - Healthcare NPI ISO/CMS Luhn 80840 Checksum', async (t) => {
  const validRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "topai_healthcare_validator", arguments: { npi_number: "1234567893" } }
  });
  const validData = JSON.parse(validRes.result.content[0].text);
  assert.equal(validData.luhn_80840_checksum, true);

  const invalidRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: { name: "topai_healthcare_validator", arguments: { npi_number: "1234567890" } }
  });
  const invalidData = JSON.parse(invalidRes.result.content[0].text);
  assert.equal(invalidData.luhn_80840_checksum, false);
  assert.equal(invalidData.is_valid, false);
});

test('MCP Tool Execution - OpenAPI Recursive $ref Dereferencing', async (t) => {
  const spec = {
    openapi: "3.0.3",
    paths: {
      "/invoices": {
        post: {
          requestBody: { $ref: "#/components/schemas/Invoice" }
        }
      }
    },
    components: {
      schemas: {
        Invoice: {
          type: "object",
          properties: {
            line: { $ref: "#/components/schemas/LineItem" }
          }
        },
        LineItem: {
          type: "object",
          properties: { amount: { type: "number" } }
        }
      }
    }
  };

  const res = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: { name: "topai_openapi_flattener", arguments: { spec_json: JSON.stringify(spec) } }
  });
  const payload = JSON.parse(res.result.content[0].text);
  assert.equal(payload.refs_resolved, 2);
  assert.equal(payload.circular_detected, false);
  assert.equal(payload.endpoints_count, 1);
  assert.equal(payload.flattened_spec.paths["/invoices"].post.requestBody.properties.line.properties.amount.type, "number");
});

test('MCP Tool Execution - Token Slimmer 64-Bit Integer Precision & Null Field Preservation (Feedback #2)', async (t) => {
  const rawOrdersJson = `[
    { "order_id": 9007199254740993, "customer_id": 9007199254740995, "optional": null, "status": "PAID" },
    { "order_id": 9007199254740997, "customer_id": 9007199254740999, "optional": null, "status": "PENDING" }
  ]`;

  // 1. Test JSON mode with default strip_nulls: false
  const jsonModeRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "topai_token_slimmer",
      arguments: { content: rawOrdersJson, format: "json", output_mode: "json" }
    }
  });
  const jsonPayload = JSON.parse(jsonModeRes.result.content[0].text);
  assert.equal(jsonPayload.nulls_preserved, true);
  assert.equal(jsonPayload.bigints_preserved_count, 4);
  assert.ok(jsonPayload.compressed_content.includes("9007199254740993"), "Must preserve 9007199254740993 without IEEE-754 float drift to 9007199254740992");
  assert.ok(jsonPayload.compressed_content.includes("9007199254740995"), "Must preserve 9007199254740995");
  assert.ok(jsonPayload.compressed_content.includes('"optional":null'), 'Must preserve "optional":null by default');

  // 2. Test TSV mode (auto) with default strip_nulls: false
  const tsvModeRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "topai_token_slimmer",
      arguments: { content: rawOrdersJson, format: "json", output_mode: "auto" }
    }
  });
  const tsvPayload = JSON.parse(tsvModeRes.result.content[0].text);
  assert.ok(tsvPayload.compressed_content.includes("9007199254740993"), "TSV mode must preserve 9007199254740993");
  assert.ok(tsvPayload.compressed_content.includes("optional"), "TSV header must include optional column");
  assert.ok(tsvPayload.compressed_content.includes("\tnull\t"), "TSV rows must explicitly encode null as 'null'");

  // 3. Test opt-in strip_nulls: true
  const strippedRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "topai_token_slimmer",
      arguments: { content: rawOrdersJson, format: "json", output_mode: "json", strip_nulls: true }
    }
  });
  const strippedPayload = JSON.parse(strippedRes.result.content[0].text);
  assert.equal(strippedPayload.nulls_preserved, false);
  assert.ok(!strippedPayload.compressed_content.includes('"optional"'), "Opt-in strip_nulls:true must omit null fields");
});

test('MCP Tool Execution - Math Fact Checker Exact Decimal HALF_UP vs HALF_EVEN Rounding (1.005 -> 1.01 & 4.43 €)', async (t) => {
  // Boundary case: 3.42 HT + 1.005 (e.g. item or tax boundary) -> 1.01 under HALF_UP -> 4.43 €
  const halfUpRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "topai_math_fact_checker",
      arguments: {
        operation: "invoice_reconcile",
        rounding_mode: "HALF_UP",
        rate_percent: 0,
        items: [
          { description: "Base Item", quantity: 1, unit_price: 3.42 },
          { description: "Half-Cent Boundary Item", quantity: 1, unit_price: 1.005 }
        ]
      }
    }
  });
  const halfUpData = JSON.parse(halfUpRes.result.content[0].text);
  assert.equal(halfUpData.rounding_mode, "HALF_UP");
  assert.equal(halfUpData.line_items[1].calculated_total, 1.01, "1.005 must round to 1.01 under HALF_UP");
  assert.equal(halfUpData.total_ttc, 4.43, "3.42 + 1.005 (rounded to 1.01) must equal 4.43 € under HALF_UP");

  // Same boundary under HALF_EVEN (Banker's rounding): 1.005 -> 1.00 -> 4.42 €
  const halfEvenRes = await McpServer.handleJsonRpc({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "topai_math_fact_checker",
      arguments: {
        operation: "invoice_reconcile",
        rounding_mode: "HALF_EVEN",
        rate_percent: 0,
        items: [
          { description: "Base Item", quantity: 1, unit_price: 3.42 },
          { description: "Half-Cent Boundary Item", quantity: 1, unit_price: 1.005 }
        ]
      }
    }
  });
  const halfEvenData = JSON.parse(halfEvenRes.result.content[0].text);
  assert.equal(halfEvenData.rounding_mode, "HALF_EVEN");
  assert.equal(halfEvenData.line_items[1].calculated_total, 1.00, "1.005 must round to 1.00 under HALF_EVEN (even cent 0)");
  assert.equal(halfEvenData.total_ttc, 4.42, "3.42 + 1.005 (rounded to 1.00) must equal 4.42 € under HALF_EVEN");
});

test('MCP In-Flow Paywall & Sandbox Quota Enforcement (402 Agent Directive vs Commercial Key)', async (t) => {
  McpServer.resetSandboxQuota("test-paywall-client");

  // 1. Simulated quota exhaustion triggers In-Flow Paywall with AI Agent directive
  const blockedRes = await McpServer.handleJsonRpc(
    {
      jsonrpc: "2.0",
      id: 99,
      method: "tools/call",
      params: {
        name: "topai_token_slimmer",
        arguments: { content: "hello world", _simulate_quota_exceeded: true }
      }
    },
    { clientId: "test-paywall-client" }
  );
  assert.equal(blockedRes.result.isError, true);
  assert.equal(blockedRes.result._meta.quota_mode, "EXHAUSTED_402");
  const paywallJson = JSON.parse(blockedRes.result.content[0].text);
  assert.equal(paywallJson.status, 402);
  assert.ok(paywallJson.agent_system_directive.includes("https://topaigateway.com/claim?code=VIP30"));
  assert.ok(paywallJson.agent_system_directive.includes("https://topaigateway.com/checkout?pack=pack_1_devex"));

  // 2. Commercial key bypasses sandbox quota unconditionally
  const paidRes = await McpServer.handleJsonRpc(
    {
      jsonrpc: "2.0",
      id: 100,
      method: "tools/call",
      params: {
        name: "topai_token_slimmer",
        arguments: { content: "hello world", _simulate_quota_exceeded: true }
      }
    },
    { clientId: "test-paywall-client", apiKey: "topai_live_pack_1_verified999" }
  );
  assert.ok(!paidRes.result.isError);
  assert.equal(paidRes.result._meta.quota_mode, "COMMERCIAL_UNLIMITED");

  // 3. Zero-Browser In-IDE VIP Pass Claim via topai_mcp_hub_registry unlocks session & returns live key
  const claimRes = await McpServer.handleJsonRpc(
    {
      jsonrpc: "2.0",
      id: 101,
      method: "tools/call",
      params: {
        name: "topai_mcp_hub_registry",
        arguments: { claim_vip_email: "architect@enterprise-fintech.com" }
      }
    },
    { clientId: "test-paywall-client" }
  );
  assert.ok(!claimRes.result.isError);
  const claimData = JSON.parse(claimRes.result.content[0].text);
  assert.equal(claimData.status, "VIP_PASS_PROVISIONED");
  assert.ok(claimData.api_key.startsWith("topai_vip_pack_1_"));
  assert.equal(claimData.session_unlocked, true);
});




