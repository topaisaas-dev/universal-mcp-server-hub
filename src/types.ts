/**
 * Model Context Protocol (MCP) Standard Type Definitions
 * Spec: 2024-11-05 (Anthropic MCP Standard)
 */

export interface McpToolInputSchema {
  type: "object";
  properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
    default?: any;
    items?: any;
  }>;
  required?: string[];
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: McpToolInputSchema;
}

export interface McpContentItem {
  type: "text" | "image" | "resource";
  text?: string;
  data?: string;
  mimeType?: string;
}

export interface McpCallResult {
  content: McpContentItem[];
  isError?: boolean;
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
