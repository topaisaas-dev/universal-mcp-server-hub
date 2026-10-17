#!/usr/bin/env node

/**
 * TopAI Sovereign Gateway — Universal Native MCP Server Hub (Stdio & Edge Bridge)
 * Official Gateway: https://topaigateway.com | Docs: https://topaigateway.com/docs
 *
 * Handles MCP JSON-RPC 2.0 lifecycle (`initialize`, `ping`, `tools/list`,
 * `resources/list`, `prompts/list`) deterministically in <1ms in-memory (zero network
 * dependency for container introspection by Glama.ai / Smithery.ai), and routes
 * `tools/call` to the Cloudflare Workers Edge (`https://mcp-server-hub.topaisaas.workers.dev/mcp`).
 */

import readline from "node:readline";

const EDGE_URL = "https://mcp-server-hub.topaisaas.workers.dev/mcp";

export const SERVER_INSTRUCTIONS =
  "TopAI Universal Native MCP Hub: 19 deterministic sub-30ms edge primitives across Web/SERP, FinOps/Security, B2B Intelligence, and Financial/Healthcare Verification. Zero payload retention.";

export const MCP_TOOLS = [
  {
    name: "topai_web_to_markdown",
    description: "Convert any public URL into clean, ad-free Markdown with metadata.",
    annotations: { title: "Web to Clean Markdown", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Public HTTP/HTTPS URL to convert" },
        include_links: { type: "boolean", description: "Keep Markdown links (default: true)" }
      },
      required: ["url"],
      additionalProperties: false
    }
  },
  {
    name: "topai_b2b_data_leads",
    description: "Search verified B2B company and executive leads by industry and country.",
    annotations: { title: "B2B Lead Generation", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        industry: { type: "string", description: "Industry vertical (e.g. 'SaaS', 'Fintech')" },
        country: { type: "string", description: "2-letter ISO country code (e.g. 'US', 'FR')" },
        limit: { type: "integer", description: "Max leads to return (1-50, default: 10)" }
      },
      required: ["industry"],
      additionalProperties: false
    }
  },
  {
    name: "topai_company_enrichment",
    description: "Enrich a corporate domain with firmographics, headcount, and tech stack.",
    annotations: { title: "B2B Domain Enrichment", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Root company domain (e.g. 'linear.app')" }
      },
      required: ["domain"],
      additionalProperties: false
    }
  },
  {
    name: "topai_ai_web_search",
    description: "Execute real-time web search and return clean titles, URLs, and snippets.",
    annotations: { title: "AI Real-Time Web Search", readOnlyHint: true, idempotentHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string" },
        max_results: { type: "integer", description: "Max results (1-10, default: 5)" }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  {
    name: "topai_semantic_cache",
    description: "Sub-5ms semantic cache lookup ('get') and storage ('set') for LLM prompts.",
    annotations: { title: "LLM Semantic Cache", readOnlyHint: false, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["get", "set"], description: "'get' cached answer or 'set' new completion" },
        prompt: { type: "string", description: "Prompt string key" },
        response: { type: "string", description: "Completion text to cache when action='set'" }
      },
      required: ["action", "prompt"],
      additionalProperties: false
    }
  },
  {
    name: "topai_invoice_extractor",
    description: "Extract vendor, invoice ID, date, VAT, total, and line items from invoice text.",
    annotations: { title: "Invoice Entity Extractor", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Raw invoice or receipt text" }
      },
      required: ["text"],
      additionalProperties: false
    }
  },
  {
    name: "topai_headless_screenshot",
    description: "Render a public webpage and return viewport/full-page screenshot metadata.",
    annotations: { title: "Headless Screenshot", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Public URL to capture" },
        full_page: { type: "boolean", description: "Full scrollable height (default: false)" },
        format: { type: "string", enum: ["png", "jpeg", "webp"], description: "Image format (default: 'png')" }
      },
      required: ["url"],
      additionalProperties: false
    }
  },
  {
    name: "topai_prompt_shield",
    description: "Scan prompts in <1ms for prompt injection, jailbreaks, and PII leaks.",
    annotations: { title: "Prompt Injection & PII Firewall", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Prompt or untrusted text to audit" }
      },
      required: ["prompt"],
      additionalProperties: false
    }
  },
  {
    name: "topai_token_slimmer",
    description: "Compress HTML, JSON arrays (to TSV), or text losslessly (preserves 64-bit IDs & nulls by default).",
    annotations: { title: "TokenSlimmer Compressor", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Raw HTML, JSON, or text to compress" },
        format: { type: "string", enum: ["html", "json", "text"], description: "Syntax format (default: 'text')" },
        strip_nulls: { type: "boolean", description: "Strip null/empty keys (default: false)" },
        output_mode: { type: "string", enum: ["auto", "json", "tsv"], description: "JSON output encoding (default: 'auto')" }
      },
      required: ["content"],
      additionalProperties: false
    }
  },
  {
    name: "topai_agentvision_crop",
    description: "Compute ROI bounding boxes and 512px Vision tile savings for UI elements.",
    annotations: { title: "AgentVision ROI Cropper", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        image_url: { type: "string", description: "Public image URL" },
        target_element: { type: "string", enum: ["auto", "button", "table", "text_block", "chart", "header"], description: "Target element (default: 'auto')" }
      },
      required: ["image_url"],
      additionalProperties: false
    }
  },
  {
    name: "topai_math_fact_checker",
    description: "Exact decimal financial math (HALF_UP/HALF_EVEN): VAT, invoice reconciliation, and business days.",
    annotations: { title: "Deterministic Math & Invoice Auditor", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        operation: { type: "string", enum: ["vat_calculate", "invoice_reconcile", "business_days"], description: "Calculation mode" },
        amount: { type: "number", description: "Base amount for vat_calculate or claimed total" },
        total: { type: "number", description: "Claimed gross total (TTC) to verify" },
        rate_percent: { type: "number", description: "VAT rate percentage (default: 20.0)" },
        rounding_mode: { type: "string", enum: ["HALF_UP", "HALF_EVEN", "HALF_DOWN"], description: "Rounding rule (default: 'HALF_UP')" },
        items: {
          type: "array",
          description: "Line items [{ description, quantity, unit_price }] for invoice_reconcile",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" }
            }
          }
        },
        invoices: {
          type: "array",
          description: "Optional batch of invoices [{ id, rate_percent, total, items }]"
        }
      },
      required: ["operation"],
      additionalProperties: false
    }
  },
  {
    name: "topai_techstack_fingerprint",
    description: "Detect CMS, e-commerce, analytics, CDN, and frontend frameworks on a domain.",
    annotations: { title: "TechStack Fingerprinter", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Domain or URL to fingerprint" }
      },
      required: ["domain"],
      additionalProperties: false
    }
  },
  {
    name: "topai_polymarket_arbitrage",
    description: "Calculate prediction market EV%, mispricing delta, and half-Kelly stake size.",
    annotations: { title: "Polymarket Kelly Calculator", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        polymarket_price: { type: "number", description: "Polymarket price (0.01-0.99)" },
        reference_probability: { type: "number", description: "True benchmark probability (0.01-0.99)" },
        bankroll_usd: { type: "number", description: "Total bankroll in USD (default: 10000)" }
      },
      required: ["polymarket_price", "reference_probability"],
      additionalProperties: false
    }
  },
  {
    name: "topai_mcp_hub_registry",
    description: "Search registered TopAI MCP tools by category or keyword.",
    annotations: { title: "MCP Tool Registry", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Category filter" },
        search: { type: "string", description: "Keyword filter" }
      },
      additionalProperties: false
    }
  },
  {
    name: "topai_pharmapatent_watcher",
    description: "Lookup FDA Orange Book drug patent expiration dates, LOE, and generic threat.",
    annotations: { title: "Pharma Patent Cliff Watcher", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        drug_name: { type: "string", description: "Brand or generic drug name (e.g. 'Humira')" },
        jurisdiction: { type: "string", enum: ["US", "EP", "ALL"], description: "Jurisdiction (default: 'US')" }
      },
      required: ["drug_name"],
      additionalProperties: false
    }
  },
  {
    name: "topai_healthcare_validator",
    description: "Validate 10-digit US NPI numbers via ISO Luhn 80840 checksum and lookup status.",
    annotations: { title: "Healthcare NPI Validator", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        npi_number: { type: "string", description: "10-digit US NPI number" },
        provider_name: { type: "string", description: "Optional provider name" },
        state: { type: "string", description: "Optional 2-letter US state code" }
      },
      required: ["npi_number"],
      additionalProperties: false
    }
  },
  {
    name: "topai_google_ai_overview",
    description: "Extract Google AI Overview synthesis text and cited source URLs for a query.",
    annotations: { title: "Google AI Overview Extractor", readOnlyHint: true, idempotentHint: false, destructiveHint: false, openWorldHint: true },
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        country: { type: "string", description: "2-letter country code (default: 'us')" },
        language: { type: "string", description: "2-letter language code (default: 'en')" }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  {
    name: "topai_disposable_email_shield",
    description: "Detect burner/disposable email domains, role accounts, and RFC 5322 syntax.",
    annotations: { title: "Disposable Email Shield", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address to validate" }
      },
      required: ["email"],
      additionalProperties: false
    }
  },
  {
    name: "topai_openapi_flattener",
    description: "Dereference internal $ref pointers and flatten OpenAPI 3.0/3.1 specifications.",
    annotations: { title: "OpenAPI $ref Flattener", readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        spec_url: { type: "string", description: "Public OpenAPI JSON URL" },
        spec_json: { type: "string", description: "Raw OpenAPI JSON string" }
      },
      additionalProperties: false
    }
  }
];

import { fileURLToPath } from "node:url";

const isCliEntrypoint = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith("cli.js")
) && !process.argv.includes("--test") && !process.execArgv.includes("--test");

if (isCliEntrypoint) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let jsonReq;
    try {
      jsonReq = JSON.parse(trimmed);
    } catch (err) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error: invalid JSON" }
        }) + "\n"
      );
      return;
    }

    const id = jsonReq.id !== undefined ? jsonReq.id : null;
    const method = jsonReq.method;

    // 1. Handle notifications (no response required per JSON-RPC 2.0)
    if (method && method.startsWith("notifications/")) {
      return;
    }

    // 2. Deterministic zero-latency local handlers for container introspection (Glama / Smithery / IDEs)
    if (method === "initialize") {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false }
            },
            serverInfo: {
              name: "universal-mcp-server-hub",
              version: "1.0.5"
            },
            instructions: SERVER_INSTRUCTIONS
          }
        }) + "\n"
      );
      return;
    }

    if (method === "ping") {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: {} }) + "\n");
      return;
    }

    if (method === "tools/list") {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        }) + "\n"
      );
      return;
    }

    if (method === "resources/list") {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: { resources: [] }
        }) + "\n"
      );
      return;
    }

    if (method === "prompts/list") {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: { prompts: [] }
        }) + "\n"
      );
      return;
    }

    // 3. Forward tool calls to Cloudflare Workers Edge with graceful offline fallback
    try {
      const headers = { "Content-Type": "application/json" };
      const apiKey = process.env.TOPAI_API_KEY || process.env.TOPAI_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
      if (apiKey) {
        headers["X-RapidAPI-Key"] = apiKey;
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      let resp;
      try {
        resp = await fetch(EDGE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(jsonReq)
        });
      } catch {
        resp = await fetch("https://topaigateway.com/mcp", {
          method: "POST",
          headers,
          body: JSON.stringify(jsonReq)
        });
      }

      if (resp.status === 204) {
        return;
      }

      const data = await resp.json();
      process.stdout.write(JSON.stringify(data) + "\n");
    } catch (err) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: `Edge bridge error: ${err.message || String(err)}`
          }
        }) + "\n"
      );
    }
  });
}
