from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.mcp_server.tools.add_task import add_task_tool, AddTaskInput, TOOL_DEFINITION as ADD_TASK_DEF
from app.mcp_server.tools.list_tasks import list_tasks_tool, ListTasksInput, TOOL_DEFINITION as LIST_TASKS_DEF
from app.mcp_server.tools.complete_task import complete_task_tool, CompleteTaskInput, TOOL_DEFINITION as COMPLETE_TASK_DEF
from app.mcp_server.tools.delete_task import delete_task_tool, DeleteTaskInput, TOOL_DEFINITION as DELETE_TASK_DEF
from app.mcp_server.tools.update_task import update_task_tool, UpdateTaskInput, TOOL_DEFINITION as UPDATE_TASK_DEF

class MCPToolServer:
    def __init__(self):
        self.tools = {
            "add_task": {"definition": ADD_TASK_DEF, "handler": add_task_tool, "input_model": AddTaskInput},
            "list_tasks": {"definition": LIST_TASKS_DEF, "handler": list_tasks_tool, "input_model": ListTasksInput},
            "complete_task": {"definition": COMPLETE_TASK_DEF, "handler": complete_task_tool, "input_model": CompleteTaskInput},
            "delete_task": {"definition": DELETE_TASK_DEF, "handler": delete_task_tool, "input_model": DeleteTaskInput},
            "update_task": {"definition": UPDATE_TASK_DEF, "handler": update_task_tool, "input_model": UpdateTaskInput},
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        return [tool["definition"] for tool in self.tools.values()]

    async def call_tool(self, session: AsyncSession, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if tool_name not in self.tools: raise ValueError(f"Unknown tool: {tool_name}")
        tool = self.tools[tool_name]
        input_data = tool["input_model"](**arguments)
        result = await tool["handler"](session, input_data)
        return result.model_dump()
