# `@topaisaas/mcp-server` — Universal Native MCP Server Hub (TopAI Sovereign Gateway)

> **19 Production-Grade Deterministic MCP Tools + 400+ Sub-30ms Edge APIs for Claude Code, Cursor, Windsurf, Claude Desktop, and Antigravity.**
> 🌐 **Official Gateway & Free Sandbox**: **[https://topaigateway.com](https://topaigateway.com?utm_source=npm&utm_medium=readme)** · 📚 **Interactive Docs**: **[https://topaigateway.com/docs](https://topaigateway.com/docs?utm_source=npm&utm_medium=readme)** · ⚡ **0ms Cold Start · Zero Token Tax · 100% USD**

[![npm version](https://img.shields.io/npm/v/@topaisaas/mcp-server?style=flat&color=FFD600)](https://www.npmjs.com/package/@topaisaas/mcp-server)
[![Glama MCP](https://glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub/badge)](https://glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub)
[![M8ven Trust](https://m8ven.ai/badge/mcp/topaisaas-dev/universal-mcp-server-hub)](https://m8ven.ai/mcp/topaisaas-dev/universal-mcp-server-hub)
[![smithery badge](https://smithery.ai/badge/top-ai-saas/mcp-server)](https://smithery.ai/servers/top-ai-saas/mcp-server)
[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)](https://topaigateway.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Uptime](https://img.shields.io/badge/Uptime-100%25-brightgreen.svg)](https://topaigateway.com/v1/health)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-brightgreen.svg)](https://topaigateway.com/openapi.json)

Stop installing 19 fragile local MCP servers, managing heavy Docker containers, or burning LLM tokens on tasks deterministic code solves in **<30ms**.

**`@topaisaas/mcp-server`** ships **19 native pre-bundled MCP primitives** (Web-to-Markdown, TokenSlimmer lossless compressor, Prompt Shield firewall, deterministic VAT/financial math, B2B firmographics, SEPA/healthcare validators, OpenAPI `$ref` flattener, and more) backed by **400+ deterministic edge APIs** running on Cloudflare Workers across 330+ global PoPs.

---

## ⚡ 1-Line Setup (`npx -y @topaisaas/mcp-server`)

### 1. Claude Code (CLI — 1 Command)
```bash
claude mcp add topai-hub -- npx -y @topaisaas/mcp-server
```

### 2. Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "topai-hub": {
      "command": "npx",
      "args": ["-y", "@topaisaas/mcp-server"]
    }
  }
}
```

### 3. Windsurf (`~/.codeium/windsurf/mcp_config.json`)
```json
{
  "mcpServers": {
    "topai-hub": {
      "command": "npx",
      "args": ["-y", "@topaisaas/mcp-server"]
    }
  }
}
```

### 4. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "topai-hub": {
      "command": "npx",
      "args": ["-y", "@topaisaas/mcp-server"]
    }
  }
}
```

### Remote Zero-Install SSE & Streamable HTTP Endpoints (Cloudflare Anycast)
- **Streamable HTTP / JSON-RPC 2.0**: `https://mcp-server-hub.topaisaas.workers.dev/mcp`
- **SSE Endpoint**: `https://mcp-server-hub.topaisaas.workers.dev/sse`

*(Optional: pass `TOPAI_API_KEY` in `env` to unlock unlimited commercial throughput.)*

---

## 🧪 5-Second Live Edge Verification (`curl` — Zero Signup Required)

Test our live deterministic edge endpoints directly from your terminal right now:

### 1. Clean Web-to-Markdown Extractor (`/v1/extract`)
```bash
curl -s -X POST https://topaigateway.com/v1/extract \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com","include_links":true}'
```

### 2. TokenSlimmer Prompt & JSON Compressor (`/v1/compress`)
```bash
curl -s -X POST https://topaigateway.com/v1/compress \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Please kindly analyze this payload carefully and summarize the key architecture details for our engineering team."}'
```

### 3. Deterministic Financial Math Checker (`/v1/math/check`)
```bash
curl -s -X POST https://topaigateway.com/v1/math/check \
  -H "Content-Type: application/json" \
  -d '{"expression":"(1250 * 0.20) + 1250"}'
```

---

## 🎯 Free Interactive Sample Preview Hubs (Try Before You Buy)

Inspect real production templates and starter configs immediately in your browser — no login required:

- **Cursor & Claude Code Sovereign Rules Starter (`.cursorrules` / `CLAUDE.md`)**:
  👉 [Download & Preview `topai-cursor-rules.txt`](https://topaigateway.com/download/samples/topai-cursor-rules.txt?utm_source=npm&utm_medium=readme)
- **n8n & Make Sovereign Workflow Starter JSON (Importable Node Flow)**:
  👉 [Download & Preview `topai-n8n-starter.json`](https://topaigateway.com/samples/topai-n8n-starter.json?utm_source=npm&utm_medium=readme)

---

## 💎 Hero Quartet — Instant USD Direct Checkout

> **100% USD Pricing · Zero Recurring Lock-In on Lifetime Kits · Backed by our 14-Day No-Questions-Asked Money-Back Guarantee.**

| Offer | Price (USD) | What You Unlock Immediately | Instant Checkout |
| :--- | :--- | :--- | :--- |
| 🟢 **Pack 1: DevEx & FinOps** *(7-Day Free Trial)* | **$0 today** *(then $14/mo)* | 101 deterministic edge APIs · 10,000 req/mo · Instant API key | **[Start $0 7-Day Free Trial →](https://topaigateway.com/checkout?pack=pack_1_devex&direct=true&utm_source=npm&utm_medium=readme)** |
| ⚡ **n8n & Make Super-Pack** *(Lifetime License)* | **$19 one-time** | Production n8n & Make.com JSON workflows + edge connectors · Zero recurring fees | **[Get n8n Super-Pack ($19) →](https://topaigateway.com/checkout?pack=bundle_n8n_make&direct=true&utm_source=npm&utm_medium=readme)** |
| 🛡️ **Runaway Token Breaker** *(Lifetime License)* | **$29 one-time** | Hard AST circuit breaker, loop-burn firewall & lossless TokenSlimmer middleware | **[Get Token Breaker ($29) →](https://topaigateway.com/checkout?pack=runaway_token_breaker&direct=true&utm_source=npm&utm_medium=readme)** |
| 🚀 **Cursor & Claude Code Harness Kit** *(Lifetime License)* | **$49 one-time** | Full 19-tool sovereign MCP harness, `.cursorrules` blueprint & production configs | **[Get Harness Kit ($49) →](https://topaigateway.com/checkout?pack=bundle_cursor_harness&direct=true&utm_source=npm&utm_medium=readme)** |

### High-Throughput Cumulative API Packs (Monthly USD)
- **Pack 1 — DevEx & FinOps**: `$0` 7-Day Free Trial, then **$14/mo** (`101 APIs` · `10,000 req/mo`) — [Checkout](https://topaigateway.com/checkout?pack=pack_1_devex&direct=true&utm_source=npm&utm_medium=readme)
- **Pack 2 — Squad Velocity**: **$29/mo** (`210 APIs` · `50,000 req/mo`) — [Checkout](https://topaigateway.com/checkout?pack=pack_2_squad&direct=true&utm_source=npm&utm_medium=readme)
- **Pack 3 — High-Scale & Infra**: **$79/mo** (`280 APIs` · `250,000 req/mo`) — [Checkout](https://topaigateway.com/checkout?pack=pack_3_highscale&direct=true&utm_source=npm&utm_medium=readme)
- **Pack 4 — Sovereign Enterprise**: **$99/mo** (`400 APIs + DORA Compliance` · `1,000,000 req/mo`) — [Checkout](https://topaigateway.com/checkout?pack=pack_4_sovereign&direct=true&utm_source=npm&utm_medium=readme)

---

## 📦 19 Native Pre-Bundled MCP Tools

1. `topai_web_to_markdown`: Extract ad-free, noise-free Markdown from any public URL.
2. `topai_b2b_data_leads`: Instant verified B2B lead generation by industry, country, and job role.
3. `topai_company_enrichment`: 70+ technographics, employee range, and B2B firmographics from domain.
4. `topai_ai_web_search`: Real-time grounding search engine for LLMs with citations.
5. `topai_semantic_cache`: Sub-5ms vector cache for LLM prompts to eliminate redundant generation bills.
6. `topai_invoice_extractor`: Structured financial entity parser (vendor, IBAN, amounts, line items).
7. `topai_headless_screenshot`: High-fidelity web screenshot renderer & DOM metadata.
8. `topai_prompt_shield`: Sub-millisecond firewall against prompt injection, jailbreaks, and PII leaks.
9. `topai_token_slimmer`: Lossless HTML & JSON compressor (preserves 64-bit integer IDs & nulls) to cut input token costs by 30-70%.
10. `topai_agentvision_crop`: Multimodal ROI cropper to isolate UI buttons/tables and slash vision tokens by 75%.
11. `topai_math_fact_checker`: Exact decimal VAT (`HALF_UP`/`HALF_EVEN`), invoice reconciliation, and business days to eliminate math hallucinations.
12. `topai_techstack_fingerprint`: Sub-50ms BuiltWith alternative (Shopify, Stripe, HubSpot, Next.js).
13. `topai_polymarket_arbitrage`: Prediction market odds, cross-platform delta vs bookmakers, and half-Kelly sizing.
14. `topai_mcp_hub_registry`: MCP tool registry introspector & capability discovery.
15. `topai_pharmapatent_watcher`: FDA Orange Book patent cliffs, exclusivity expirations & generic challenge tracker.
16. `topai_healthcare_validator`: Instant 10-digit US NPI (ISO Luhn 80840), EU RPPS/ADELI credentials & medical license verification.
17. `topai_google_ai_overview`: Extract Google AI Overviews, cited sources, and SERP organic snippets.
18. `topai_disposable_email_shield`: Real-time burner email detection, DoH MX live check & B2B lead audit.
19. `topai_openapi_flattener`: OpenAPI 3.0/3.1 recursive `$ref` dereferencer & schema sanitizer.

---

## 🛠️ Direct MCP JSON-RPC 2.0 & REST Usage

### MCP JSON-RPC 2.0 (`POST /mcp`)
```bash
curl -s -X POST https://mcp-server-hub.topaisaas.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "topai_math_fact_checker",
      "arguments": {
        "operation": "vat_calculate",
        "amount": 250,
        "rate_percent": 20
      }
    }
  }'
```

### List All Tools (`GET /v1/mcp/tools`)
```bash
curl -s "https://mcp-server-hub.topaisaas.workers.dev/v1/mcp/tools"
```

---

## 🛡️ Edge Security, Zero Retention & Spec Compliance

- **0ms Cold-Start**: Powered by Cloudflare Workers V8 isolates across 330+ global locations.
- **100% Stateless & Zero Payload Retention**: No user prompts, source code, or arguments are logged or stored.
- **Native Protocol Compliance**: Full Anthropic MCP (`2024-11-05`), OpenAPI 3.0.3, A2A Agent Card, and x402 Base USDC machine micropayments (`$0.001/call`).
- **14-Day Money-Back Guarantee**: Risk-free checkout on every kit and subscription pack.

---

## 📬 Links & Registries

- **Official Sovereign Gateway**: [https://topaigateway.com](https://topaigateway.com?utm_source=npm&utm_medium=readme)
- **Interactive API Docs**: [https://topaigateway.com/docs](https://topaigateway.com/docs?utm_source=npm&utm_medium=readme)
- **npm Package**: [https://www.npmjs.com/package/@topaisaas/mcp-server](https://www.npmjs.com/package/@topaisaas/mcp-server)
- **GitHub Repository**: [https://github.com/topaisaas-dev/universal-mcp-server-hub](https://github.com/topaisaas-dev/universal-mcp-server-hub)
- **Glama MCP Directory**: [glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub](https://glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub)
- **M8ven Trust Index**: [m8ven.ai/mcp/topaisaas-dev/universal-mcp-server-hub](https://m8ven.ai/mcp/topaisaas-dev/universal-mcp-server-hub)
- **RapidAPI Publisher Profile**: [rapidapi.com/user/topaisaasdev](https://rapidapi.com/user/topaisaasdev)
