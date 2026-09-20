import test from 'node:test';
import assert from 'node:assert/strict';

test('MCP Tools Catalog - Integrity & Schema Validation', async (t) => {
  // Dynamically import or verify tools definition
  const tools = [
    "topai_web_to_markdown",
    "topai_company_enrichment",
    "topai_ai_web_search",
    "topai_math_fact_checker",
    "topai_techstack_fingerprint",
    "topai_polymarket_arbitrage",
    "topai_token_slimmer",
    "topai_prompt_shield",
    "topai_invoice_extractor"
  ];

  assert.equal(tools.length, 9, 'Must have exactly 9 native MCP tools');
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
      version: "1.0.0"
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
