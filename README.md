# Universal Native MCP Server Hub

> **Universal Model Context Protocol (MCP) Server Hub for Claude Code, Cursor, Windsurf, and Antigravity**

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Uptime](https://img.shields.io/badge/Uptime-100%25-brightgreen.svg)](https://mcp-server-hub.topaisaas.workers.dev/v1/health)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-brightgreen.svg)](https://mcp-server-hub.topaisaas.workers.dev/openapi.json)

With the rise of autonomous coding assistants and agents (**Claude Code, Cursor, Windsurf, Antigravity, CrewAI, LangChain**), the **Model Context Protocol (MCP)** has become the universal standard for tool calling.

Instead of installing 10 separate local servers or bloated Docker containers, **Universal Native MCP Server Hub** bundles 9 production-grade AI primitives into a single serverless edge hub running with 0ms cold-start latency across 300+ global Cloudflare locations.

---

## 📦 9 Native Pre-Bundled MCP Tools

1. `topai_web_to_markdown`: Extract ad-free, noise-free Markdown from any public URL.
2. `topai_company_enrichment`: 70+ technographics, employee range, and B2B firmographics from domain.
3. `topai_ai_web_search`: Real-time grounding search engine for LLMs with citations.
4. `topai_math_fact_checker`: Deterministic VAT, invoice reconciliation, and business days to stop hallucinations.
5. `topai_techstack_fingerprint`: Sub-50ms BuiltWith alternative (Shopify, Stripe, HubSpot, Next.js).
6. `topai_polymarket_arbitrage`: Prediction market odds, cross-platform delta vs bookmakers, and Kelly sizing.
7. `topai_token_slimmer`: Lossless HTML & JSON compressor to slash input token costs by 30-70%.
8. `topai_prompt_shield`: Sub-millisecond firewall against prompt injection, jailbreaks, and PII leaks.
9. `topai_invoice_extractor`: Structured financial entity parser (vendor, IBAN, amounts, line items).

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
