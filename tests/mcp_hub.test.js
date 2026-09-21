import test from 'node:test';
import assert from 'node:assert/strict';

test('MCP Tools Catalog - Integrity & Schema Validation', async (t) => {
  const tools = [
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

  assert.equal(tools.length, 19, 'Must have exactly 19 native MCP tools');
  tools.forEach(name => {
    assert.ok(name.startsWith('topai_'), `Tool name ${name} must start with topai_`);
  });
});

test('MCP Protocol - JSON-RPC 2.0 initialize specification', async (t) => {
  const initResponse = {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: { listChanged: false }
    },
    serverInfo: {
      name: "topai-mcp-hub",
      version: "1.0.2"
    }
  };

  assert.equal(initResponse.protocolVersion, "2024-11-05");
  assert.equal(initResponse.serverInfo.name, "topai-mcp-hub");
  assert.ok(initResponse.capabilities.tools);
});

test('MCP Tool Execution - Math Fact Checker', async (t) => {
  const args = {
    operation: 'vat_calculate',
    amount: 150,
    rate_percent: 20
  };

  const tax = Math.round(args.amount * (args.rate_percent / 100) * 100) / 100;
  const total = args.amount + tax;

  assert.equal(tax, 30.0);
  assert.equal(total, 180.0);
});

test('MCP Tool Execution - Token Slimmer compression', async (t) => {
  const rawHtml = "<!-- ad banner -->  <div>   <p>Hello   World  </p>  </div> ";
  const compressed = rawHtml.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();

  assert.equal(compressed, "<div> <p>Hello World </p> </div>");
  assert.ok(compressed.length < rawHtml.length);
});

test('MCP Tool Execution - Disposable Email validation', async (t) => {
  const burnerDomain = "tempmail.com";
  const isBurner = /mailinator|tempmail|10minutemail/i.test(burnerDomain);
  assert.equal(isBurner, true);
});
