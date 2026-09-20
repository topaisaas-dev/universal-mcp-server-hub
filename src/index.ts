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
      version: "1.0.0",
      description: "Universal Model Context Protocol (MCP) Server Hub for Claude Code, Cursor, Windsurf, and Antigravity. Bridges high-speed web-to-markdown, company enrichment, real-time web search, math fact-checking, tech stack fingerprinter, and prediction market arbitrage into native agent tools.",
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
 * Healthcheck
 */
app.get("/v1/health", (c) => {
  return c.json({
    status: "ok",
    service: "universal-mcp-server-hub",
    timestamp: new Date().toISOString(),
    uptime_sla: "99.99%",
    version: "1.0.0",
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

    const result = await ToolExecutor.execute(toolName, toolArgs);

    return c.json({
      success: !result.isError,
      tool: toolName,
      ...result
    });
  } catch (err: any) {
    return c.json({
      success: false,
      error: err.message || "Invalid JSON payload"
    }, 400);
  }
});

/**
 * Official MCP JSON-RPC 2.0 Endpoint (Cursor, Claude Code, Windsurf)
 */
app.post("/mcp", async (c) => {
  try {
    const req = await c.req.json() as JsonRpcRequest;
    const res = await McpServer.handleJsonRpc(req);

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
});

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
app.post("/messages", async (c) => {
  try {
    const req = await c.req.json() as JsonRpcRequest;
    const res = await McpServer.handleJsonRpc(req);

    if (res === null) {
      return new Response(null, { status: 204 });
    }

    return c.json(res);
  } catch (err: any) {
    return c.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" }
    }, 400);
  }
});

export default app;
