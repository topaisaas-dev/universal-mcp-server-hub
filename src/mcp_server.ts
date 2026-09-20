import { JsonRpcRequest, JsonRpcResponse } from "./types";
import { MCP_TOOLS, ToolExecutor } from "./tools_registry";

export class McpServer {
  /**
   * Process incoming JSON-RPC 2.0 MCP request
   */
  static async handleJsonRpc(req: JsonRpcRequest): Promise<JsonRpcResponse | null> {
    const id = req.id !== undefined ? req.id : null;

    switch (req.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {
                listChanged: false
              }
            },
            serverInfo: {
              name: "topai-mcp-hub",
              version: "1.0.0"
            }
          }
        };

      case "notifications/initialized":
        // Notification from client; standard JSON-RPC does not reply to notifications
        return null;

      case "ping":
        return {
          jsonrpc: "2.0",
          id,
          result: {}
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        };

      case "tools/call": {
        const params = req.params || {};
        const toolName = params.name;
        const toolArgs = params.arguments || {};

        if (!toolName) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: "Missing 'name' in tools/call parameters"
            }
          };
        }

        const callResult = await ToolExecutor.execute(toolName, toolArgs);

        return {
          jsonrpc: "2.0",
          id,
          result: callResult
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method not found: ${req.method}`
          }
        };
    }
  }
}
