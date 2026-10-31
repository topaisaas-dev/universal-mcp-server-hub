import { Hono } from "hono";
import { cors } from "hono/cors";
import { MCP_TOOLS, ToolExecutor } from "./tools_registry";
import { McpServer } from "./mcp_server";
import { OPENAPI_SPEC } from "./openapi_spec";
import { renderLandingPage } from "./landing";
import { JsonRpcRequest } from "./types";

const app = new Hono();

// Permissive CORS for AI agent integrations & x402 / MPP machine payment rails
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "X-RapidAPI-Key", "X-RapidAPI-Host", "X-TopAI-Key", "Authorization", "Payment"],
  exposeHeaders: ["Content-Length", "X-Response-Time", "WWW-Authenticate", "X-MPP-Quote-ID", "Link"]
}));

// Timing & Discovery Link middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header("X-Response-Time", `${ms}ms`);
  c.header("Link", '</llms.txt>; rel="describedby", </.well-known/x402.json>; rel="payment", </.well-known/mcp.json>; rel="mcp"');
});

/**
 * Root: HTML Interactive Playground or JSON descriptor
 */
app.get("/", (c) => {
  const accept = c.req.header("Accept") || "";
  const format = c.req.query("format");

  if (format === "json" || accept.includes("application/json")) {
    return c.json({
      name: "Universal Native MCP Server Hub",
      version: "1.0.2",
      description: "Universal Model Context Protocol (MCP) Server Hub for Claude Code, Cursor, Windsurf, and Antigravity. Bridges 19 production AI agent tools including web-to-markdown, B2B intelligence, real-time search, semantic caching, financial math, techstack fingerprinter, and prediction market arbitrage.",
      mcp_version: "2024-11-05",
      documentation: "https://mcp-server-hub.topaisaas.workers.dev/openapi.json",
      rapidapi: "https://rapidapi.com/user/topaisaasdev",
      tools_count: MCP_TOOLS.length,
      endpoints: {
        tools_list: "GET /v1/mcp/tools",
        tool_call_rest: "POST /v1/mcp/call",
        json_rpc_endpoint: "POST /mcp",
        sse_endpoint: "GET /sse",
        health: "GET /v1/health",
        openapi: "GET /openapi.json"
      }
    });
  }

  return c.html(renderLandingPage());
});

/**
 * OpenAPI 3.0.3 Specification
 */
app.get("/openapi.json", (c) => {
  return c.json(OPENAPI_SPEC);
});

/**
 * Smithery.ai Static Discovery Manifest (Server Card)
 * Allows Smithery scanner to discover all tools without triggering Cloudflare bot protection.
 */
app.get("/.well-known/mcp/server-card.json", (c) => {
  const metadata = {
    name: "universal-mcp-server-hub",
    title: "Universal Native MCP Server Hub",
    version: "1.0.2",
    description: "High-performance Model Context Protocol (MCP) server hub providing 19 production-grade AI agent tools: Web-to-Markdown, B2B leads, company deep-enrichment, real-time web search grounding, semantic cache, invoice OCR, headless screenshot, prompt shield firewall, token compression, AgentVision crop, deterministic financial & VAT math, 70+ CMS/techstack fingerprinter, Polymarket prediction odds & Kelly arbitrage, MCP registry, PharmaPatent Orange Book watcher, healthcare NPI validator, Google AI Overview extractor, disposable email shield, and OpenAPI spec flattener.",
    homepage: "https://mcp-server-hub.topaisaas.workers.dev",
    icon: "https://raw.githubusercontent.com/topaisaas-dev/universal-mcp-server-hub/main/logo.jpg",
    iconUrl: "https://raw.githubusercontent.com/topaisaas-dev/universal-mcp-server-hub/main/logo.jpg",
    repository: "https://github.com/topaisaas-dev/universal-mcp-server-hub",
    license: "MIT"
  };

  return c.json({
    serverInfo: metadata,
    ...metadata,
    authentication: {
      required: false
    },
    configSchema: {
      type: "object",
      properties: {
        rapidApiKey: {
          type: "string",
          description: "Optional RapidAPI Key for higher rate limits and quota. Leave blank for public free tier.",
          secret: true
        }
      }
    },
    tools: MCP_TOOLS,
    resources: [],
    prompts: []
  });
});

const MCP_REGISTRY_MANIFEST = () => ({
  version: "1.0",
  owner: {
    name: "TopAI Sovereign Gateway",
    url: "https://topaigateway.com"
  },
  servers: [
    {
      name: "universal-mcp-server-hub",
      transport: "stdio",
      command: "npx",
      args: ["-y", "@topaisaas/mcp-server"],
      description: "Universal Native Model Context Protocol (MCP) Server Hub"
    },
    {
      name: "universal-mcp-server-hub-remote",
      transport: "sse",
      url: "https://mcp-server-hub.topaisaas.workers.dev/sse",
      endpoint: "https://mcp-server-hub.topaisaas.workers.dev/mcp",
      description: "Remote Streamable HTTP & SSE MCP Hub (19 Native Tools + 400 Edge APIs)"
    }
  ]
});

for (const mcpManifestPath of ["/.well-known/mcp.json", "/.well-known/mcp", "/mcp.json"]) {
  app.get(mcpManifestPath, (c) => c.json(MCP_REGISTRY_MANIFEST()));
}

/**
 * Coinbase x402 / ERC-8004 / Tempo MPP Native Machine Payment Discovery Manifests
 * Ensures US Agent Harvesters (TaifoonHarvester, SolvedEarthPriceBot, mcpspectrum, AgentKit) index 200 OK payability.
 */
const X402_HUB_MANIFEST = () => ({
  version: "x402-v1",
  service: "TopAI Universal Native MCP Server Hub",
  payment_required_code: 402,
  default_token: "USDC",
  default_network: "base",
  chain_id: 8453,
  recipient_address: "0x1994e098487e5bE11566373b57222384976d8b2e",
  base_usdc_contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  quote_endpoint: "https://topaigateway.com/v1/mpp/quote",
  settle_endpoint: "https://topaigateway.com/v1/mpp/settle",
  pricing: {
    standard_tool_call_usdc: 0.001,
    streaming_batch_10k_usdc: 0.0008,
    sovereign_kyc_call_usdc: 1.5,
    pack_1_7day_free_trial_url: "https://topaigateway.com/checkout?pack=pack_1_devex&direct=true",
    tripwire_n8n_make_19usd_url: "https://topaigateway.com/checkout?pack=bundle_n8n_make&direct=true",
    perpetual_mcp_harness_49usd_url: "https://topaigateway.com/checkout?pack=bundle_cursor_harness&direct=true"
  }
});

for (const x402Path of ["/.well-known/x402.json", "/.well-known/x402", "/x402.json", "/.well-known/payment-manifest"]) {
  app.get(x402Path, (c) => c.json(X402_HUB_MANIFEST()));
}

const MPP_HUB_MANIFEST = () => ({
  mpp_version: "1.0",
  protocols_supported: ["x402-v1", "mpp-v1", "erc-8004"],
  settlement: {
    default_asset: "USDC",
    default_chain: "base",
    chain_id: 8453,
    usdc_contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    recipient_address: {
      base: "0x1994e098487e5bE11566373b57222384976d8b2e"
    },
    quote_url: "https://topaigateway.com/v1/mpp/quote",
    settle_url: "https://topaigateway.com/v1/mpp/settle"
  },
  fiat_checkout: {
    pack_1_trial_0_today: "https://topaigateway.com/checkout?pack=pack_1_devex&direct=true",
    n8n_superpack_19usd: "https://topaigateway.com/checkout?pack=bundle_n8n_make&direct=true",
    cursor_harness_49usd: "https://topaigateway.com/checkout?pack=bundle_cursor_harness&direct=true"
  }
});

for (const mppPath of ["/.well-known/mpp.json", "/.well-known/mpp", "/mpp.json"]) {
  app.get(mppPath, (c) => c.json(MPP_HUB_MANIFEST()));
}

/**
 * MCP OAuth 2.1 Protected Resource & Authorization Discovery (RFC 9728 / MCP Spec 2025-03-26)
 * Prevents 404 failures during automated MCP registry auth-discovery scans.
 */
app.get("/.well-known/oauth-protected-resource", (c) => c.json({
  resource: "https://mcp-server-hub.topaisaas.workers.dev",
  authorization_servers: ["https://topaigateway.com"],
  bearer_methods_supported: ["header"],
  resource_documentation: "https://topaigateway.com/docs",
  sandbox_anonymous_allowance: { daily_tool_calls: 5, auth_required_for_discovery: false },
  upgrade_url: "https://topaigateway.com/checkout?pack=pack_1_devex&direct=true"
}));

app.get("/.well-known/oauth-authorization-server", (c) => c.json({
  issuer: "https://topaigateway.com",
  authorization_endpoint: "https://topaigateway.com/?signin=1",
  registration_endpoint: "https://topaigateway.com/api/free-tier",
  service_documentation: "https://topaigateway.com/docs",
  grant_types_supported: ["urn:ietf:params:oauth:grant-type:token-exchange", "api_key", "x402"]
}));

/**
 * Universal A2A / ERC-8004 / Agenstry / BrickBlue / AgentProbe Discovery Card
 */
const AGENT_DISCOVERY_CARD = () => ({
  schema_version: "1.0",
  protocol: "mcp+a2a+x402",
  mcp_version: "2024-11-05",
  name: "TopAI Sovereign Gateway & Universal MCP Hub",
  id: "universal-mcp-server-hub",
  version: "1.0.3",
  description: "Sub-30ms Deterministic AI Edge Gateway & Universal MCP Server Hub bundling 19 native MCP tools and 400+ deterministic APIs (Web-to-Markdown, TokenSlimmer -70% LLM cost cutter, Prompt Shield, SEPA IBAN VoP, EU AI Act & DORA compliance).",
  url: "https://topaigateway.com",
  homepage: "https://topaigateway.com",
  documentationUrl: "https://topaigateway.com/docs",
  pricingUrl: "https://topaigateway.com/#pricing",
  openapiUrl: "https://topaigateway.com/openapi.json",
  provider: {
    organization: "TopAI Sovereign Gateway",
    url: "https://topaigateway.com"
  },
  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: false,
    mcp: true,
    x402_payments: true,
    mpp_streaming: true,
    tools_count: MCP_TOOLS.length
  },
  endpoints: {
    mcp_jsonrpc: "https://mcp-server-hub.topaisaas.workers.dev/mcp",
    mcp_sse: "https://mcp-server-hub.topaisaas.workers.dev/sse",
    mcp_messages: "https://mcp-server-hub.topaisaas.workers.dev/messages",
    tools_list: "https://mcp-server-hub.topaisaas.workers.dev/v1/mcp/tools",
    x402_manifest: "https://mcp-server-hub.topaisaas.workers.dev/.well-known/x402.json",
    mpp_manifest: "https://mcp-server-hub.topaisaas.workers.dev/.well-known/mpp.json",
    health: "https://mcp-server-hub.topaisaas.workers.dev/v1/health"
  },
  authentication: {
    schemes: ["Bearer", "X-TopAI-Key", "X-RapidAPI-Key", "Payment (x402 Base USDC)", "None (5 Free Daily Calls)"],
    required: false,
    signup_url: "https://topaigateway.com/checkout?pack=pack_1_devex&direct=true"
  },
  payment: {
    x402_version: "x402-v1",
    network: "base",
    chain_id: 8453,
    token: "USDC",
    recipient: "0x1994e098487e5bE11566373b57222384976d8b2e",
    price_per_call_usdc: 0.001,
    quote_url: "https://topaigateway.com/v1/mpp/quote",
    settle_url: "https://topaigateway.com/v1/mpp/settle"
  },
  pricing: {
    currency: "USD",
    free_tier: { requests_per_day: 5, price_usd: 0, trial_7_days_0_today_url: "https://topaigateway.com/checkout?pack=pack_1_devex&direct=true" },
    packs: [
      { name: "Pack 1 - DevEx & FinOps (101 APIs · 7-Day Free Trial $0 Today)", price_usd_month: 14, quota: 10000, checkout_url: "https://topaigateway.com/checkout?pack=pack_1_devex&direct=true" },
      { name: "Pack 2 - Squad Velocity (210 APIs)", price_usd_month: 29, quota: 50000, checkout_url: "https://topaigateway.com/checkout?pack=pack_2_squad&direct=true" },
      { name: "Pack 3 - High-Scale & Infra (280 APIs)", price_usd_month: 79, quota: 250000, checkout_url: "https://topaigateway.com/checkout?pack=pack_3_highscale&direct=true" },
      { name: "Pack 4 - Sovereign Enterprise (400 APIs + DORA)", price_usd_month: 99, quota: 1000000, checkout_url: "https://topaigateway.com/checkout?pack=pack_4_sovereign&direct=true" }
    ],
    lifetime_toolkits: [
      { name: "n8n & Make Sovereign Workflow Super-Pack (Tripwire)", price_usd_onetime: 19, checkout_url: "https://topaigateway.com/checkout?pack=bundle_n8n_make&direct=true" },
      { name: "Runaway Token Breaker Insurance Shield", price_usd_onetime: 29, checkout_url: "https://topaigateway.com/checkout?pack=runaway_token_breaker&direct=true" },
      { name: "Cursor & Claude Code Sovereign Harness Kit", price_usd_onetime: 49, checkout_url: "https://topaigateway.com/checkout?pack=bundle_cursor_harness&direct=true" },
      { name: "Apex Kernel Standalone Local Wasm Bundle", price_usd_onetime: 99, checkout_url: "https://topaigateway.com/checkout?pack=bundle_apex_wasm&direct=true" },
      { name: "The DORA Article 30 & ISO 42001 Toolkit", price_usd_onetime: 149, checkout_url: "https://topaigateway.com/checkout?pack=bundle_dora_audit&direct=true" }
    ]
  },
  tools: MCP_TOOLS
});

for (const discoveryPath of [
  "/.well-known/agent-card.json",
  "/.well-known/agent.json",
  "/.well-known/agent",
  "/.well-known/agent-registration.json",
  "/.well-known/a2a.json",
  "/.well-known/ai-catalog.json",
  "/.well-known/ard.json",
  "/agent.json",
  "/agent",
  "/agent/authenticatedExtendedCard",
  "/a2a/agent-card.json",
  "/a2a/.well-known/agent.json",
  "/mcp/agent-card.json",
  "/mcp/.well-known/agent-card.json",
  "/agents/.well-known/agent-card.json",
  "/discovery/resources",
  "/api/pricing"
]) {
  app.get(discoveryPath, (c) => c.json(AGENT_DISCOVERY_CARD()));
}

for (const modelsPath of ["/v1/models", "/api/v1/models"]) {
  app.get(modelsPath, (c) => c.json({
    object: "list",
    data: MCP_TOOLS.map((t) => ({
      id: t.name,
      object: "model",
      owned_by: "topai-sovereign-edge",
      description: t.description,
      pricing: { prompt: "0.00", completion: "0.00", request_usdc: "0.001" }
    }))
  }));
}

app.get("/.well-known/security.txt", (c) => c.text(
  `Contact: mailto:security@topaigateway.com\nPreferred-Languages: en\nCanonical: https://mcp-server-hub.topaisaas.workers.dev/.well-known/security.txt\nPolicy: https://topaigateway.com/terms\n`
));

for (const llmsPath of ["/llms.txt", "/agents.txt"]) {
  app.get(llmsPath, (c) => {
    return c.text(
      `# TopAI Sovereign Gateway — Universal Native MCP Server Hub\n` +
      `> Official Gateway: https://topaigateway.com | Docs: https://topaigateway.com/docs\n` +
      `> MCP JSON-RPC Endpoint: https://mcp-server-hub.topaisaas.workers.dev/mcp\n` +
      `> MCP SSE Endpoint: https://mcp-server-hub.topaisaas.workers.dev/sse\n` +
      `> x402 Base USDC Manifest: https://mcp-server-hub.topaisaas.workers.dev/.well-known/x402.json\n` +
      `> OpenAPI 3.0 Spec: https://topaigateway.com/openapi.json\n\n` +
      `## Pricing & Cumulative Packs (100% USD)\n` +
      `- Anonymous Evaluation Allowance: $0 (5 daily tool calls) — Instant 7-Day Free Trial ($0.00 due today) on Pack 1!\n` +
      `- Pack 1 (DevEx & FinOps - 101 APIs): $14/mo with 7-Day Free Trial ($0.00 today) (https://topaigateway.com/checkout?pack=pack_1_devex&direct=true)\n` +
      `- Pack 2 (Squad Velocity - 210 APIs): $29/mo (50,000 req/mo)\n` +
      `- Pack 3 (High-Scale & Infra - 280 APIs): $79/mo (250,000 req/mo)\n` +
      `- Pack 4 (Sovereign Enterprise - 400 APIs + DORA): $99/mo (1,000,000 req/mo)\n` +
      `- x402 Machine Micropayments: $0.001 USDC/call on Base L2 (0x1994e098487e5bE11566373b57222384976d8b2e)\n\n` +
      `## Lifetime Digital Toolkits (Perpetual Licenses · Zero Recurring Fees)\n` +
      `- n8n & Make Sovereign Workflow Super-Pack (Tripwire): $19 one-time (https://topaigateway.com/checkout?pack=bundle_n8n_make&direct=true)\n` +
      `- Runaway Token Breaker Insurance Shield: $29 one-time (https://topaigateway.com/checkout?pack=runaway_token_breaker&direct=true)\n` +
      `- Cursor AI & Claude Code Agentic Harness Kit (19 MCP Tools): $49 one-time (https://topaigateway.com/checkout?pack=bundle_cursor_harness&direct=true)\n` +
      `- Apex WASM Fast-Path & Quantized Edge Distillation Kit: $99 one-time (https://topaigateway.com/checkout?pack=bundle_apex_wasm&direct=true)\n` +
      `- DORA Article 30 Audit & Sovereign Compliance Kit: $149 one-time (https://topaigateway.com/checkout?pack=bundle_dora_audit&direct=true)\n\n` +
      `## 19 Native Pre-Bundled MCP Tools\n` +
      MCP_TOOLS.map((t) => `- ${t.name}: ${t.description}`).join("\n") + "\n"
    );
  });
}

app.get("/pricing", (c) => c.redirect("https://topaigateway.com/#pricing", 301));

app.get("/robots.txt", (c) => {
  return c.text(
    `User-agent: *\nAllow: /\nSitemap: https://mcp-server-hub.topaisaas.workers.dev/sitemap.xml\n`
  );
});

app.get("/sitemap.xml", (c) => {
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url><loc>https://topaigateway.com/</loc><priority>1.0</priority></url>\n` +
    `  <url><loc>https://topaigateway.com/docs</loc><priority>0.9</priority></url>\n` +
    `  <url><loc>https://mcp-server-hub.topaisaas.workers.dev/</loc><priority>0.9</priority></url>\n` +
    `  <url><loc>https://mcp-server-hub.topaisaas.workers.dev/openapi.json</loc><priority>0.8</priority></url>\n` +
    `  <url><loc>https://mcp-server-hub.topaisaas.workers.dev/llms.txt</loc><priority>0.8</priority></url>\n` +
    `</urlset>`,
    200,
    { "Content-Type": "application/xml; charset=utf-8" }
  );
});

/**
 * Healthcheck & Status
 */
for (const healthPath of ["/v1/health", "/api/status", "/status"]) {
  app.get(healthPath, (c) => {
    return c.json({
      status: "ok",
      service: "universal-mcp-server-hub",
      timestamp: new Date().toISOString(),
      uptime_sla: "99.99%",
      version: "1.0.3",
      tools_registered: MCP_TOOLS.length,
      x402_supported: true,
      edge_runtime: "cloudflare_workers"
    });
  });
}

/**
 * REST: List all MCP Tools
 */
app.get("/v1/mcp/tools", (c) => {
  return c.json({
    success: true,
    count: MCP_TOOLS.length,
    mcp_specification: "2024-11-05",
    tools: MCP_TOOLS
  });
});

const extractAuthCtx = (c: any) => {
  const authHeader = c.req.header("Authorization") || "";
  const paymentHeader = c.req.header("Payment") || "";
  const bearerKey = authHeader.replace(/^(Bearer|x402)\s+/i, "").trim();
  const x402Token = paymentHeader.startsWith("x402") ? `topai_live_x402_${paymentHeader.slice(0, 24)}` : "";
  const apiKey = bearerKey || x402Token || c.req.header("X-TopAI-Key") || c.req.header("X-RapidAPI-Key") || c.req.query("api_key") || "";
  const clientId = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "edge-anon";
  return { clientId, apiKey };
};

/**
 * REST: Direct Tool Execution
 */
app.post("/v1/mcp/call", async (c) => {
  try {
    const body = await c.req.json();
    const toolName = body.name;
    const toolArgs = body.arguments || {};

    if (!toolName) {
      return c.json({
        success: false,
        error: "Missing required parameter 'name'. Example: { name: 'topai_techstack_fingerprint', arguments: { domain: 'gymshark.com' } }"
      }, 400);
    }

    const rpcRes = await McpServer.handleJsonRpc(
      { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: toolName, arguments: toolArgs } },
      extractAuthCtx(c)
    );
    const result = (rpcRes?.result as any) || { isError: true, content: [] };
    const is402 = result._meta?.quota_mode === "EXHAUSTED_402";
    if (is402) {
      c.header(
        "WWW-Authenticate",
        'x402 realm="TopAI MCP Hub", network="base", token="USDC", price="0.001", recipient="0x1994e098487e5bE11566373b57222384976d8b2e", quote_url="https://topaigateway.com/v1/mpp/quote", direct_checkout="https://topaigateway.com/checkout?pack=pack_1_devex&direct=true"'
      );
    }

    return c.json({
      success: !result.isError,
      tool: toolName,
      ...result
    }, is402 ? 402 : 200);
  } catch (err: any) {
    return c.json({
      success: false,
      error: err.message || "Invalid JSON payload"
    }, 400);
  }
});

/**
 * Official MCP JSON-RPC 2.0 Handler (supports POST /mcp, POST /sse, POST /, POST /messages, POST /v1/mcp, POST /api/mcp, POST /rpc)
 */
const handleMcpJsonRpcPost = async (c: any) => {
  try {
    const req = await c.req.json() as JsonRpcRequest;
    const res = await McpServer.handleJsonRpc(req, extractAuthCtx(c));

    if (res === null) {
      return new Response(null, { status: 204 });
    }

    return c.json(res);
  } catch (err: any) {
    return c.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error: invalid JSON"
      }
    }, 400);
  }
};

for (const rpcPostPath of ["/mcp", "/sse", "/", "/v1/mcp", "/api/mcp", "/rpc"]) {
  app.post(rpcPostPath, handleMcpJsonRpcPost);
}

/**
 * Server-Sent Events (SSE) Endpoint for MCP Streaming Clients
 */
app.get("/sse", (c) => {
  const sessionId = crypto.randomUUID();
  const endpointUrl = `/messages?sessionId=${sessionId}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      // Send initial endpoint announcement per Anthropic MCP SSE spec
      const initMessage = `event: endpoint\ndata: ${endpointUrl}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // Keepalive ping comment every 15s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 15000);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
});

/**
 * SSE Message Handler
 */
app.post("/messages", handleMcpJsonRpcPost);

export default app;
