import { Hono } from "hono";
import { cors } from "hono/cors";
import { MCP_TOOLS, ToolExecutor } from "./tools_registry";
import { McpServer } from "./mcp_server";
import { OPENAPI_SPEC } from "./openapi_spec";
import { renderLandingPage } from "./landing";
import { JsonRpcRequest } from "./types";

const app = new Hono();

// Permissive CORS for AI agent integrations
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "X-RapidAPI-Key", "X-RapidAPI-Host", "Authorization"],
  exposeHeaders: ["Content-Length", "X-Response-Time"]
}));

// Timing middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header("X-Response-Time", `${ms}ms`);
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

app.get("/.well-known/mcp.json", (c) => {
  return c.json({
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
});

/**
 * Universal A2A / ERC-8004 / Agenstry / BrickBlue / AgentProbe Discovery Card
 */
const AGENT_DISCOVERY_CARD = () => ({
  schema_version: "1.0",
  protocol: "mcp+a2a",
  mcp_version: "2024-11-05",
  name: "TopAI Sovereign Gateway & Universal MCP Hub",
  id: "universal-mcp-server-hub",
  version: "1.0.2",
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
    tools_count: MCP_TOOLS.length
  },
  endpoints: {
    mcp_jsonrpc: "https://mcp-server-hub.topaisaas.workers.dev/mcp",
    mcp_sse: "https://mcp-server-hub.topaisaas.workers.dev/sse",
    mcp_messages: "https://mcp-server-hub.topaisaas.workers.dev/messages",
    tools_list: "https://mcp-server-hub.topaisaas.workers.dev/v1/mcp/tools",
    health: "https://mcp-server-hub.topaisaas.workers.dev/v1/health"
  },
  authentication: {
    schemes: ["Bearer", "X-RapidAPI-Key", "None (Free Tier Sandbox)"],
    required: false,
    signup_url: "https://topaigateway.com"
  },
  pricing: {
    currency: "EUR",
    free_tier: { requests_per_month: 100, price: 0 },
    packs: [
      { name: "Pack 1 - DevEx & FinOps (100 APIs)", price_eur_month: 14, quota: 10000 },
      { name: "Pack 2 - Squad Velocity (210 APIs)", price_eur_month: 29, quota: 50000 },
      { name: "Pack 3 - High-Scale & Infra (310 APIs)", price_eur_month: 79, quota: 250000 },
      { name: "Pack 4 - Sovereign Enterprise (400 APIs + DORA)", price_eur_month: 99, quota: 1000000 }
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
  "/discovery/resources"
]) {
  app.get(discoveryPath, (c) => c.json(AGENT_DISCOVERY_CARD()));
}

app.get("/llms.txt", (c) => {
  return c.text(
    `# TopAI Sovereign Gateway — Universal Native MCP Server Hub\n` +
    `> Official Gateway: https://topaigateway.com | Docs: https://topaigateway.com/docs\n` +
    `> MCP JSON-RPC Endpoint: https://mcp-server-hub.topaisaas.workers.dev/mcp\n` +
    `> MCP SSE Endpoint: https://mcp-server-hub.topaisaas.workers.dev/sse\n` +
    `> OpenAPI 3.0 Spec: https://topaigateway.com/openapi.json\n\n` +
    `## Pricing & Cumulative Packs\n` +
    `- Free Sandbox: €0/mo (100 req/mo) at https://topaigateway.com\n` +
    `- Pack 1 (DevEx & FinOps - 100 APIs): €14/mo (10,000 req/mo)\n` +
    `- Pack 2 (Squad Velocity - 210 APIs): €29/mo (50,000 req/mo)\n` +
    `- Pack 3 (High-Scale & Infra - 310 APIs): €79/mo (250,000 req/mo)\n` +
    `- Pack 4 (Sovereign Enterprise - 400 APIs + DORA): €99/mo (1,000,000 req/mo)\n\n` +
    `## Lifetime Digital Toolkits (Perpetual Licenses · Zero Recurring Fees)\n` +
    `- Make.com & n8n Enterprise Connector Superpack: $39 one-time (https://topaigateway.com/checkout?pack=bundle_n8n_make&direct=true)\n` +
    `- Cursor AI & Claude Code Agentic Harness Kit (19 MCP Tools): $49 one-time (https://topaigateway.com/checkout?pack=bundle_cursor_harness&direct=true)\n` +
    `- Runaway Token Breaker & AST Circuit Optimizer: $49 one-time (https://topaigateway.com/checkout?pack=runaway_token_breaker&direct=true)\n` +
    `- Apex WASM Fast-Path & Quantized Edge Distillation Kit: $99 one-time (https://topaigateway.com/checkout?pack=bundle_apex_wasm&direct=true)\n` +
    `- DORA Article 30 Audit & Sovereign Compliance Kit: $149 one-time (https://topaigateway.com/checkout?pack=bundle_dora_audit&direct=true)\n\n` +
    `## 19 Native Pre-Bundled MCP Tools\n` +
    MCP_TOOLS.map((t) => `- ${t.name}: ${t.description}`).join("\n") + "\n"
  );
});

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
 * Healthcheck
 */
app.get("/v1/health", (c) => {
  return c.json({
    status: "ok",
    service: "universal-mcp-server-hub",
    timestamp: new Date().toISOString(),
    uptime_sla: "99.99%",
    version: "1.0.2",
    tools_registered: MCP_TOOLS.length,
    edge_runtime: "cloudflare_workers"
  });
});

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
  const bearerKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  const apiKey = bearerKey || c.req.header("X-TopAI-Key") || c.req.header("X-RapidAPI-Key") || "";
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

    return c.json({
      success: !result.isError,
      tool: toolName,
      ...result
    }, result._meta?.quota_mode === "EXHAUSTED_402" ? 402 : 200);
  } catch (err: any) {
    return c.json({
      success: false,
      error: err.message || "Invalid JSON payload"
    }, 400);
  }
});

/**
 * Official MCP JSON-RPC 2.0 Handler (supports POST /mcp, POST /sse, POST /, POST /messages)
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

app.post("/mcp", handleMcpJsonRpcPost);
app.post("/sse", handleMcpJsonRpcPost);
app.post("/", handleMcpJsonRpcPost);

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
