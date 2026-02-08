import inspect
from typing import Callable, Any, Dict, List, Optional
from contextlib import asynccontextmanager
from mcp.server import Server
from mcp.server.lowlevel.server import InitializationOptions
from mcp.types import (
    Tool as MCPTool,
    TextContent,
    ImageContent,
    EmbeddedResource
)
from ..ai.agent import AIAgent
from ..ai.prompts import SYSTEM_PROMPT
from ..config import settings


class TaskMasterMCPServer:
    """
    MCP (Model Context Protocol) server for TaskMaster AI.
    Provides AI-powered task management capabilities.
    """

    def __init__(self, name: str = "taskmaster"):
        self.server = Server(name)
        self.ai_agent = AIAgent(system_prompt=SYSTEM_PROMPT)
        self._setup_handlers()

    def _setup_handlers(self):
        """
        Set up MCP protocol handlers for list_tools, call_tool, etc.
        """

        @self.server.list_tools()
        async def handle_list_tools() -> List[MCPTool]:
            """List available MCP tools."""
            return [
                MCPTool(
                    name="chat"
                    description="Chat with TaskMaster AI assistant",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "description": "User message or question"
                            }
                        },
                        "required": ["message"]
                    }
                ),
                MCPTool(
                    name="create_task",
                    description="Create a new task with title, description, and optional due date",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Task title"
                            },
                            "description": {
                                "type": "string",
                                "description": "Task description (optional)"
                            },
                            "due_date": {
                                "type": "string",
                                "description": "Due date in ISO format (optional)"
                            }
                        },
                        "required": ["title"]
                    }
                ),
                MCPTool(
                    name="list_tasks",
                    description="List all tasks, optionally filtered by status",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "status": {
                                "type": "string",
                                "enum": ["pending", "in_progress", "done"],
                                "description": "Filter by task status"
                            }
                        }
                    }
                ),
                MCPTool(
                    name="update_task_status",
                    description="Update a task's status (pending, in_progress, done)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "string",
                                "description": "Task ID to update"
                            },
                            "status": {
                                "type": "string",
                                "enum": ["pending", "in_progress", "done"],
                                "description": "New status"
                            }
                        },
                        "required": ["task_id", "status"]
                    }
                )
            ]

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
            """Handle tool invocations from MCP clients."""
            try:
                if name == "chat":
                    message = arguments.get("message")
                    if not message:
                        return [TextContent(type="text", text="Error: 'message' argument is required")]
                    response = await self.ai_agent.chat(message)
                    return [TextContent(type="text", text=response)]

                elif name == "create_task":
                    title = arguments.get("title")
                    if not title:
                        return [TextContent(type="text", text="Error: 'title' argument is required")]
                    description = arguments.get("description")
                    due_date = arguments.get("due_date")
                    # This would call the task service
                    result = f"Created task: {title}" + (f"\nDescription: {description}" if description else "") + (f"\nDue: {due_date}" if due_date else "")
                    return [TextContent(type="text", text=result)]

                elif name == "list_tasks":
                    status = arguments.get("status")
                    # This would call the task service
                    result = "Here are your tasks:\n"
                    if status:
                        result += f"(Filtered by status: {status})"
                    return [TextContent(type="text", text=result)]

                elif name == "update_task_status":
                    task_id = arguments.get("task_id")
                    new_status = arguments.get("status")
                    if not task_id or not new_status:
                        return [TextContent(type="text", text="Error: 'task_id' and 'status' arguments are required")]
                    result = f"Updated task {task_id} status to '{new_status}'"
                    return [TextContent(type="text", text=result)]

                else:
                    return [TextContent(type="text", text=f"Unknown tool: {name}")]

            except Exception as e:
                return [TextContent(type="text", text=f"Error: {str(e)}")]

    async def run(self):
        """
        Run the MCP server.
        """
        async with self.server.run_stdio() as read_stream, write_stream:
            await self.server.run(
                read_stream=read_stream,
                write_stream=write_stream,
                initialization_options=InitializationOptions(
                    server_name="taskmaster",
                    server_version="0.1.0",
                    capabilities=self.server.get_capabilities(
                        read_stream, write_stream
                    ),
                ),
            )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.server.shutdown()
