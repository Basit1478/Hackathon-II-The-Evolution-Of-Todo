from mcp import Client
from typing import Dict, Any, List
from mcp.types import TextContent


class MCPClientWrapper:
    """
    Wrapper for MCP client to interact with TaskMaster tools.
    """

    def __init__(self, server_params):
        self.client = Client(server_params)

    async def list_tools(self) -> List[Dict[str, Any]]:
        """List available tools from the MCP server."""
        async with self.client:
            tools = await self.client.list_tools()
            return [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "inputSchema": tool.inputSchema
                }
                for tool in tools
            ]

    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> List[TextContent]:
        """Call a specific tool with arguments."""
        async with self.client:
            return await self.client.call_tool(name, arguments)
