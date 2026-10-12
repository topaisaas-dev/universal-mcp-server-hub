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
  "TopAI Universal Native MCP Server Hub provides a coherent suite of 19 deterministic, stateless sub-30ms edge primitives organized into 4 functional domains: " +
  "(1) Web & SERP Ingestion (`topai_web_to_markdown`, `topai_ai_web_search`, `topai_google_ai_overview`, `topai_headless_screenshot`), " +
  "(2) LLM FinOps & Security Guardrails (`topai_semantic_cache`, `topai_token_slimmer`, `topai_prompt_shield`, `topai_agentvision_crop`, `topai_openapi_flattener`, `topai_mcp_hub_registry`), " +
  "(3) B2B & Technographic Intelligence (`topai_b2b_data_leads`, `topai_company_enrichment`, `topai_techstack_fingerprint`, `topai_disposable_email_shield`), and " +
  "(4) Deterministic Financial, Healthcare & Regulatory Verification (`topai_invoice_extractor`, `topai_math_fact_checker`, `topai_polymarket_arbitrage`, `topai_pharmapatent_watcher`, `topai_healthcare_validator`). " +
  "All tools execute statelessly without storing user payloads.";

export const MCP_TOOLS = [
  {
    name: "topai_web_to_markdown",
    description:
      "Converts any public HTTP/HTTPS webpage into clean, ad-free, token-optimized Markdown with document metadata. " +
      "Use when an agent needs to read article text, documentation, or web pages without HTML/DOM clutter before RAG indexing or summarization. " +
      "Do not use for capturing visual pixel screenshots (use `topai_headless_screenshot` instead) or running multi-site keyword searches (use `topai_ai_web_search` instead). " +
      "Stateless, read-only, idempotent execution in <30ms.",
    annotations: {
      title: "Web to Clean Markdown Converter",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Full public HTTP or HTTPS URL of the target webpage to convert into Markdown (e.g., 'https://stripe.com/docs'). Must not point to private/loopback IP ranges."
        },
        include_links: {
          type: "boolean",
          description: "Set to true to preserve Markdown hyperlinks `[text](url)` in the extracted output, or false to strip all links for maximum token compression (default: true)."
        }
      },
      required: ["url"],
      additionalProperties: false
    }
  },
  {
    name: "topai_b2b_data_leads",
    description:
      "Queries verified B2B company and executive lead records filtered by industry vertical, ISO country code, and result limit. " +
      "Use when building prospect lists, sales pipelines, or market landscapes across specific sectors. " +
      "Do not use when you already have a specific company domain and want deep technographic profiling on that single domain (use `topai_company_enrichment` instead). " +
      "Stateless, read-only, idempotent query.",
    annotations: {
      title: "B2B Lead Generation & Directory Search",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        industry: {
          type: "string",
          description: "Target B2B industry vertical or market segment to filter leads by (e.g., 'SaaS', 'Fintech', 'Healthcare', 'E-commerce')."
        },
        country: {
          type: "string",
          description: "Optional two-letter ISO 3166-1 alpha-2 country code to restrict geographic scope (e.g., 'US', 'FR', 'DE', 'GB')."
        },
        limit: {
          type: "integer",
          description: "Maximum number of verified B2B lead records to return, bounded between 1 and 50 (default: 10)."
        }
      },
      required: ["industry"],
      additionalProperties: false
    }
  },
  {
    name: "topai_company_enrichment",
    description:
      "Enriches a single corporate domain name with firmographic metadata including legal entity name, industry sector, workforce size range, detected software stack, and social links. " +
      "Use when you have a known company domain (such as 'linear.app') and need firmographic context. " +
      "Do not use for discovering lists of unknown companies by industry (use `topai_b2b_data_leads` instead) or for exhaustive 70-signature CMS/CDN fingerprinting (use `topai_techstack_fingerprint` instead). " +
      "Stateless, read-only, idempotent lookup.",
    annotations: {
      title: "B2B Company Domain Firmographic Enrichment",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Root corporate domain name without protocol or path (e.g., 'linear.app', 'figma.com')."
        }
      },
      required: ["domain"],
      additionalProperties: false
    }
  },
  {
    name: "topai_ai_web_search",
    description:
      "Executes a real-time web search query and returns noise-free organic results with page titles, canonical URLs, and factual snippets for LLM grounding. " +
      "Use when an agent needs up-to-date external facts, news, or URL discovery across the open web. " +
      "Do not use when you already have the exact URL to read (use `topai_web_to_markdown` instead) or when you specifically need Google SGE AI Overview citations (use `topai_google_ai_overview` instead). " +
      "Stateless, read-only execution.",
    annotations: {
      title: "AI Real-Time Web Search & Grounding",
      readOnlyHint: true,
      idempotentHint: false,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural-language or keyword search query string (e.g., 'EU DORA regulation technical standards 2026')."
        },
        max_results: {
          type: "integer",
          description: "Maximum number of search result items to return, bounded between 1 and 10 (default: 5)."
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  {
    name: "topai_semantic_cache",
    description:
      "Performs sub-5ms semantic vector cache lookups ('get') and completions storage ('set') for LLM prompts to eliminate redundant inference latency and token spend. " +
      "Use before invoking an expensive upstream LLM to check if an equivalent prompt was already answered, or right after generation to cache the completion. " +
      "Do not use for compressing raw text length within a single uncached prompt (use `topai_token_slimmer` instead). " +
      "Idempotent, non-destructive edge cache operation.",
    annotations: {
      title: "LLM Semantic Vector Cache",
      readOnlyHint: false,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get", "set"],
          description: "Operation mode: 'get' to retrieve a semantically matching cached response, or 'set' to store a new prompt-response pair."
        },
        prompt: {
          type: "string",
          description: "The user prompt or query string used as the semantic lookup key."
        },
        response: {
          type: "string",
          description: "The LLM completion text to persist in cache (required when `action` is 'set', omitted when `action` is 'get')."
        }
      },
      required: ["action", "prompt"],
      additionalProperties: false
    }
  },
  {
    name: "topai_invoice_extractor",
    description:
      "Parses unstructured invoice or receipt text into structured accounting fields including vendor name, invoice number, ISO date, currency, VAT amount, gross total, and line items. " +
      "Use when extracting structured financial data from OCR output or raw invoice text. " +
      "Do not use for verifying mathematical VAT calculations or reconciling line-item arithmetic (use `topai_math_fact_checker` instead). " +
      "Stateless, read-only, idempotent parser.",
    annotations: {
      title: "Invoice & Receipt Entity Extractor",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Raw unstructured text extracted from an invoice, receipt, or billing PDF."
        }
      },
      required: ["text"],
      additionalProperties: false
    }
  },
  {
    name: "topai_headless_screenshot",
    description:
      "Renders a public webpage in a serverless headless browser and returns viewport or full-page screenshot metadata and dimensions. " +
      "Use when visual layout inspection, UI verification, or image capture of a live URL is required. " +
      "Do not use when you only need the textual content of a webpage (use `topai_web_to_markdown` instead to save 90% bandwidth and tokens). " +
      "Stateless, read-only, idempotent rendering.",
    annotations: {
      title: "Headless Webpage Visual Screenshot Capture",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Public HTTP/HTTPS URL of the webpage to render and capture (e.g., 'https://github.com')."
        },
        full_page: {
          type: "boolean",
          description: "Set to true to capture the entire scrollable document height, or false for the above-the-fold viewport only (default: false)."
        },
        format: {
          type: "string",
          enum: ["png", "jpeg", "webp"],
          description: "Output image encoding format: 'png', 'jpeg', or 'webp' (default: 'png')."
        }
      },
      required: ["url"],
      additionalProperties: false
    }
  },
  {
    name: "topai_prompt_shield",
    description:
      "Scans user prompts or untrusted external text in <1ms to detect adversarial prompt injections, jailbreak attempts, toxic payloads, and PII leakage. " +
      "Use as a pre-inference security guardrail before passing untrusted user input or scraped web content to an LLM. " +
      "Do not use for compressing safe prompts (use `topai_token_slimmer` instead). " +
      "Stateless, read-only, idempotent security evaluation returning a boolean safety verdict and threat score (0.0 to 1.0).",
    annotations: {
      title: "LLM Prompt Injection & PII Firewall",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Raw user input, system prompt fragment, or untrusted external document text to audit for injection and PII risks."
        }
      },
      required: ["prompt"],
      additionalProperties: false
    }
  },
  {
    name: "topai_token_slimmer",
    description:
      "Compresses bloated HTML, JSON, or plain-text payloads losslessly to reduce LLM input token consumption by 30% to 70% without losing semantic meaning. " +
      "Use before sending large JSON API responses, logs, or RAG chunks into an LLM context window. " +
      "Do not use for converting a live URL directly into Markdown (use `topai_web_to_markdown` instead) or for caching full prompt completions (use `topai_semantic_cache` instead). " +
      "Stateless, read-only, idempotent compression.",
    annotations: {
      title: "TokenSlimmer Lossless Context Compressor",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "Raw HTML, JSON, or text payload string to compress for LLM context optimization."
        },
        format: {
          type: "string",
          enum: ["html", "json", "text"],
          description: "Payload syntax format: 'html', 'json', or 'text' (default: 'text')."
        }
      },
      required: ["content"],
      additionalProperties: false
    }
  },
  {
    name: "topai_agentvision_crop",
    description:
      "Computes optimal Region-of-Interest (ROI) bounding boxes for UI buttons, tables, charts, or text blocks in an image to reduce multimodal vision token consumption by up to 75%. " +
      "Use when preparing screenshots or document images for vision-capable LLMs so only the relevant region is sent. " +
      "Do not use for taking the initial webpage screenshot (use `topai_headless_screenshot` first). " +
      "Stateless, read-only, idempotent visual ROI analysis.",
    annotations: {
      title: "AgentVision Multimodal ROI Smart Cropper",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        image_url: {
          type: "string",
          description: "Public HTTP/HTTPS URL of the source image to analyze for Region-of-Interest cropping."
        },
        target_element: {
          type: "string",
          enum: ["auto", "button", "table", "text_block", "chart", "header"],
          description: "Specific visual element category to isolate: 'auto', 'button', 'table', 'text_block', 'chart', or 'header' (default: 'auto')."
        }
      },
      required: ["image_url"],
      additionalProperties: false
    }
  },
  {
    name: "topai_math_fact_checker",
    description:
      "Executes deterministic IEEE/decimal financial arithmetic for VAT calculation, multi-line invoice reconciliation, and working business-day counts with an explicit step-by-step audit trail. " +
      "Use whenever an agent must compute or verify taxes, invoice totals, or date intervals without risking LLM arithmetic hallucinations. " +
      "Do not use for parsing raw unstructured invoice text (use `topai_invoice_extractor` first, then pass extracted numbers here). " +
      "Stateless, read-only, idempotent calculation.",
    annotations: {
      title: "Deterministic Financial Math & VAT Fact-Checker",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["vat_calculate", "invoice_reconcile", "business_days"],
          description: "Deterministic calculation type: 'vat_calculate' (net/gross tax math), 'invoice_reconcile' (sum of quantity * unit_price), or 'business_days'."
        },
        amount: {
          type: "number",
          description: "Base monetary amount for 'vat_calculate' (e.g., 250.00)."
        },
        rate_percent: {
          type: "number",
          description: "VAT or tax percentage rate for 'vat_calculate' (e.g., 20.0 for 20% VAT)."
        },
        items: {
          type: "array",
          description: "Line items array `[{ description, quantity, unit_price }]` used when `operation` is 'invoice_reconcile'.",
          items: {
            type: "object",
            properties: {
              description: { type: "string", description: "Line item label" },
              quantity: { type: "number", description: "Item count" },
              unit_price: { type: "number", description: "Unit price" }
            }
          }
        }
      },
      required: ["operation"],
      additionalProperties: false
    }
  },
  {
    name: "topai_techstack_fingerprint",
    description:
      "Fingerprints a web domain in <50ms across 70+ technology signatures to identify its CMS, e-commerce engine, analytics stack, CDN, and frontend frameworks. " +
      "Use when qualifying technical architecture or detecting whether a site runs Shopify, Stripe, HubSpot, Next.js, or Cloudflare. " +
      "Do not use when you need general workforce size or executive firmographics (use `topai_company_enrichment` instead). " +
      "Stateless, read-only, idempotent inspection.",
    annotations: {
      title: "TechStack Technographic Domain Fingerprinter",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Target website hostname or root domain to fingerprint (e.g., 'gymshark.com', 'vercel.com')."
        }
      },
      required: ["domain"],
      additionalProperties: false
    }
  },
  {
    name: "topai_polymarket_arbitrage",
    description:
      "Computes prediction market implied probability, mispricing delta, expected value (EV%), and fractional Kelly criterion position sizing between a Polymarket contract price and a reference benchmark probability. " +
      "Use for quantitative prediction market analysis, odds comparison, and risk-adjusted bankroll allocation. " +
      "Do not use for standard VAT or invoice accounting (use `topai_math_fact_checker` instead). " +
      "Stateless, read-only, idempotent quantitative calculator.",
    annotations: {
      title: "Polymarket Arbitrage & Kelly Criterion Calculator",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        polymarket_price: {
          type: "number",
          description: "Current Polymarket YES share price expressed as a decimal between 0.01 and 0.99 (e.g., 0.58 for 58 cents)."
        },
        reference_probability: {
          type: "number",
          description: "Estimated true probability or sportsbook consensus probability (0.01 to 0.99, or 1 to 99)."
        },
        bankroll_usd: {
          type: "number",
          description: "Optional total capital bankroll in USD to compute exact dollar stake allocation (e.g., 10000)."
        }
      },
      required: ["polymarket_price", "reference_probability"],
      additionalProperties: false
    }
  },
  {
    name: "topai_mcp_hub_registry",
    description:
      "Introspects and searches the TopAI Sovereign Gateway catalog of MCP tools by functional category or keyword. " +
      "Use when an autonomous agent wants to discover which specialized tools are available on this hub before selecting one. " +
      "Do not use to execute a domain tool directly—call the specific `topai_*` tool once identified. " +
      "Stateless, read-only, idempotent registry lookup.",
    annotations: {
      title: "TopAI MCP Tool Registry & Capability Discovery",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional functional category filter (e.g., 'scraping', 'finance', 'healthcare', 'security', 'intelligence')."
        },
        search: {
          type: "string",
          description: "Optional keyword substring to match against registered tool names and descriptions."
        }
      },
      additionalProperties: false
    }
  },
  {
    name: "topai_pharmapatent_watcher",
    description:
      "Retrieves pharmaceutical patent cliff dates, active ingredient metadata, FDA Orange Book / European exclusivity expirations, and generic entry threat levels for a given drug name. " +
      "Use for life-sciences competitive intelligence, LOE (Loss of Exclusivity) forecasting, and pharmaceutical IP analysis. " +
      "Do not use for verifying individual physician NPI medical licenses (use `topai_healthcare_validator` instead). " +
      "Stateless, read-only, idempotent lookup.",
    annotations: {
      title: "Pharma Patent Cliff & Orange Book Exclusivity Watcher",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        drug_name: {
          type: "string",
          description: "Commercial brand name or generic molecule name of the pharmaceutical product (e.g., 'Humira', 'Keytruda', 'Ozempic', 'Eliquis')."
        },
        jurisdiction: {
          type: "string",
          enum: ["US", "EP", "ALL"],
          description: "Regulatory patent jurisdiction to query: 'US' (FDA Orange Book), 'EP' (European Patent Office), or 'ALL' (default: 'US')."
        }
      },
      required: ["drug_name"],
      additionalProperties: false
    }
  },
  {
    name: "topai_healthcare_validator",
    description:
      "Validates 10-digit US National Provider Identifiers (NPI) using the ISO Luhn 80840 prefix checksum algorithm and returns provider license status and specialty metadata. " +
      "Use when verifying healthcare practitioners, medical facilities, or compliance onboarding records. " +
      "Do not use for looking up drug patent expiration dates (use `topai_pharmapatent_watcher` instead). " +
      "Stateless, read-only, idempotent verification.",
    annotations: {
      title: "Healthcare Provider NPI & Medical License Validator",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        npi_number: {
          type: "string",
          description: "10-digit US National Provider Identifier string to validate via Luhn 80840 check (e.g., '1234567893')."
        },
        provider_name: {
          type: "string",
          description: "Optional physician surname or healthcare organization name for cross-matching."
        },
        state: {
          type: "string",
          description: "Optional two-letter US state postal code (e.g., 'CA', 'NY', 'TX')."
        }
      },
      required: ["npi_number"],
      additionalProperties: false
    }
  },
  {
    name: "topai_google_ai_overview",
    description:
      "Extracts Google Search Generative Experience (AI Overview) synthesis text, explicitly cited source URLs, and organic SERP count for a search query. " +
      "Use for GEO (Generative Engine Optimization) audits, citation tracking, and analyzing how Google AI summarizes a topic. " +
      "Do not use for general fast web search when AI Overview citation tracking is unnecessary (use `topai_ai_web_search` instead). " +
      "Stateless, read-only execution.",
    annotations: {
      title: "Google AI Overview & Generative Citation Extractor",
      readOnlyHint: true,
      idempotentHint: false,
      destructiveHint: false,
      openWorldHint: true
    },
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to inspect for Google AI Overview generation and cited links (e.g., 'best lightweight vector database 2026')."
        },
        country: {
          type: "string",
          description: "Two-letter country code for localized SERP context (default: 'us')."
        },
        language: {
          type: "string",
          description: "Two-letter ISO language code for SERP results (default: 'en')."
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  {
    name: "topai_disposable_email_shield",
    description:
      "Detects disposable, burner, or temporary email addresses using RFC 5322 syntax parsing, throwaway domain blocklists, and DNS MX heuristics, returning a fraud risk score (0.0 to 1.0). " +
      "Use during user signup, B2B lead cleaning, or KYC fraud prevention to block fake accounts. " +
      "Do not use for enriching corporate firmographics when you already know the domain is legitimate (use `topai_company_enrichment` instead). " +
      "Stateless, read-only, idempotent verification.",
    annotations: {
      title: "Disposable Burner Email & MX Fraud Shield",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Full email address string to inspect for burner/disposable domain status and RFC 5322 validity (e.g., 'user@tempmail.com')."
        }
      },
      required: ["email"],
      additionalProperties: false
    }
  },
  {
    name: "topai_openapi_flattener",
    description:
      "Dereferences internal and external `$ref` pointers, neutralizes circular schema references, and flattens OpenAPI 3.0/3.1 specifications into a self-contained JSON document. " +
      "Use before importing complex OpenAPI specs into RapidAPI, Postman, or LLM function-calling compilers that reject nested `$ref` pointers. " +
      "Do not use for general JSON token minification (use `topai_token_slimmer` instead). " +
      "Stateless, read-only, idempotent schema transformation.",
    annotations: {
      title: "OpenAPI 3.0/3.1 $ref Flattener & Schema Sanitizer",
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
      openWorldHint: false
    },
    inputSchema: {
      type: "object",
      properties: {
        spec_url: {
          type: "string",
          description: "Optional public HTTP/HTTPS URL pointing to an OpenAPI JSON specification to fetch and flatten."
        },
        spec_json: {
          type: "string",
          description: "Optional raw OpenAPI JSON string passed inline for immediate local dereferencing."
        }
      },
      additionalProperties: false
    }
  }
];

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
            version: "1.0.2"
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

    const resp = await fetch(EDGE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(jsonReq)
    });

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
