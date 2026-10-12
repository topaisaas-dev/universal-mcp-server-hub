# Universal Native MCP Server Hub — TopAI Sovereign Gateway

> **Universal Model Context Protocol (MCP) Server Hub for Claude Code, Cursor, Windsurf, and Antigravity**
> 🌐 **Official Gateway & Free Sandbox Key (100 req/mo)**: **[https://topaigateway.com](https://topaigateway.com)** · 📚 **Docs (400+ APIs & 201 Tools)**: **[https://topaigateway.com/docs](https://topaigateway.com/docs)**

[![Glama MCP](https://glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub/badge)](https://glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub)
[![M8ven Trust](https://m8ven.ai/badge/mcp/topaisaas-dev/universal-mcp-server-hub)](https://m8ven.ai/mcp/topaisaas-dev/universal-mcp-server-hub)
[![smithery badge](https://smithery.ai/badge/top-ai-saas/mcp-server)](https://smithery.ai/servers/top-ai-saas/mcp-server)
[![npm version](https://img.shields.io/npm/v/@topaisaas/mcp-server?style=flat&color=FFD600)](https://www.npmjs.com/package/@topaisaas/mcp-server)
[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)](https://topaigateway.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Uptime](https://img.shields.io/badge/Uptime-100%25-brightgreen.svg)](https://topaigateway.com/v1/health)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-brightgreen.svg)](https://topaigateway.com/openapi.json)
[![RapidAPI](https://img.shields.io/badge/RapidAPI-Subscribe%20Free-blue.svg)](https://rapidapi.com/topaisaasdev/api/universal-native-mcp-server-hub/pricing)

With the rise of autonomous coding assistants and agents (**Claude Code, Cursor, Windsurf, Antigravity, CrewAI, LangChain**), the **Model Context Protocol (MCP)** has become the universal standard for tool calling.

Instead of installing 19 separate local servers or bloated Docker containers, **Universal Native MCP Server Hub** bundles 19 production-grade AI primitives (and routes to **400+ deterministic edge APIs** at **[topaigateway.com](https://topaigateway.com)**) into a single serverless edge hub running with 0ms cold-start latency across 330+ global Cloudflare locations.

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
9. `topai_token_slimmer`: Lossless HTML & JSON compressor to slash input token costs by 30-70%.
10. `topai_agentvision_crop`: Multimodal ROI cropper to isolate UI buttons/tables and slash vision tokens by 75%.
11. `topai_math_fact_checker`: Deterministic VAT, invoice reconciliation, and business days to stop hallucinations.
12. `topai_techstack_fingerprint`: Sub-50ms BuiltWith alternative (Shopify, Stripe, HubSpot, Next.js).
13. `topai_polymarket_arbitrage`: Prediction market odds, cross-platform delta vs bookmakers, and Kelly sizing.
14. `topai_mcp_hub_registry`: MCP tool registry introspector & capability discovery.
15. `topai_pharmapatent_watcher`: FDA Orange Book patent cliffs, exclusivity expirations & generic challenge tracker.
16. `topai_healthcare_validator`: Instant NPI (Luhn 80840), EU RPPS/ADELI credentials & medical license verification.
17. `topai_google_ai_overview`: Extract Google AI Overviews, cited sources, and SERP organic snippets.
18. `topai_disposable_email_shield`: Real-time burner email detection, DoH MX live check & B2B lead audit.
19. `topai_openapi_flattener`: OpenAPI 3.0/3.1 recursive $ref dereferencer & RapidAPI schema sanitizer.

---

## 🚀 Quick Setup in Your IDE

### 1. Cursor (`.cursor/mcp.json`)
Add to your project's `.cursor/mcp.json` or global Cursor settings:

```json
{
  "mcpServers": {
    "topai-hub": {
      "url": "https://mcp-server-hub.topaisaas.workers.dev/sse"
    }
  }
}
```

### 2. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "topai-hub": {
      "url": "https://mcp-server-hub.topaisaas.workers.dev/sse"
    }
  }
}
```

### 3. Windsurf (`mcp_config.json`)
```json
{
  "mcpServers": {
    "topai-hub": {
      "serverUrl": "https://mcp-server-hub.topaisaas.workers.dev/sse"
    }
  }
}
```

### 4. Antigravity (`mcp_servers.json`)
```json
{
  "topai-hub": {
    "url": "https://mcp-server-hub.topaisaas.workers.dev/sse",
    "description": "TopAI SaaS Universal MCP Hub with 9 production tools"
  }
}
```

---

## 🛠️ Direct REST & JSON-RPC Usage

### List Available Tools (GET)
```bash
curl "https://mcp-server-hub.topaisaas.workers.dev/v1/mcp/tools"
```

### Execute a Tool via REST (POST)
```bash
curl -X POST https://mcp-server-hub.topaisaas.workers.dev/v1/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "topai_techstack_fingerprint",
    "arguments": {
      "domain": "gymshark.com"
    }
  }'
```

**Response (Standard MCP Content Block):**
```json
{
  "success": true,
  "tool": "topai_techstack_fingerprint",
  "content": [
    {
      "type": "text",
      "text": "{\n  \"domain\": \"gymshark.com\",\n  \"technologies\": [\"Shopify\", \"Klaviyo\", \"Stripe\", \"Cloudflare\"],\n  \"detected_count\": 4,\n  \"sub_50ms\": true\n}"
    }
  ]
}
```

### Standard MCP JSON-RPC 2.0 (POST /mcp)
```bash
curl -X POST https://mcp-server-hub.topaisaas.workers.dev/mcp \
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

---

## 🛡️ Edge Security & SLAs

- **0ms Cold-Start**: Powered by Cloudflare Workers V8 isolates worldwide.
- **100% Stateless**: No user prompts, code, or arguments are logged or stored.
- **Spec Compliance**: Fully compliant with the Anthropic Model Context Protocol (2024-11-05).

---

## 📬 Official Gateway, 4 Cumulative Packs & Marketplaces

- **Official Sovereign Gateway (400+ APIs & Free Sandbox Key)**: **[https://topaigateway.com](https://topaigateway.com)**
  - 🟢 **Pack 1 — DevEx & FinOps** (`100 APIs` · `10,000 req/mo` · **€14/mo**)
  - 🔵 **Pack 2 — Squad Velocity** (`210 APIs` · `50,000 req/mo` · **€29/mo**)
  - 🟣 **Pack 3 — High-Scale & Infra** (`310 APIs` · `250,000 req/mo` · **€79/mo**)
  - 🔴 **Pack 4 — Sovereign Enterprise** (`400 APIs + DORA Audit` · `1,000,000 req/mo` · **€199/mo**)
- **Interactive Documentation**: **[https://topaigateway.com/docs](https://topaigateway.com/docs)**
- **Glama MCP Directory**: **[glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub](https://glama.ai/mcp/servers/topaisaas-dev/universal-mcp-server-hub)**
- **RapidAPI Publisher Profile**: [rapidapi.com/user/topaisaasdev](https://rapidapi.com/user/topaisaasdev)
- **TopAI Master Organization**: [github.com/topaisaas-dev](https://github.com/topaisaas-dev)
- **M8ven Trust Index**: [m8ven.ai/mcp/topaisaas-dev/universal-mcp-server-hub](https://m8ven.ai/mcp/topaisaas-dev/universal-mcp-server-hub)
