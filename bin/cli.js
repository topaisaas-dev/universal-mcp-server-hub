#!/usr/bin/env node

/**
 * TopAI SaaS Universal MCP Server - Stdio Proxy
 * Reads JSON-RPC from stdin, proxies to Cloudflare Workers edge (or executes locally), and writes to stdout.
 */

import readline from "node:readline";

const EDGE_URL = "https://mcp-server-hub.topaisaas.workers.dev/mcp";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const jsonReq = JSON.parse(trimmed);

    // Call Cloudflare Edge
    const resp = await fetch(EDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonReq)
    });

    if (resp.status === 204) {
      return; // Notification, no response
    }

    const data = await resp.json();
    process.stdout.write(JSON.stringify(data) + "\n");
  } catch (err) {
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: `Internal error in MCP Stdio Bridge: ${err.message || String(err)}`
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + "\n");
  }
});
