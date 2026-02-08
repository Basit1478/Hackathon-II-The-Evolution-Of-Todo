import os
from pydantic import BaseModel, Field
from agents import (
    Agent,
    Runner,
    OpenAIChatCompletionsModel,
    AsyncOpenAI,
    RunContextWrapper,
    ModelSettings,
    set_tracing_disabled,
)
from app.config import get_settings
from app.mcp_server.agent_tools import get_mcp_tools

set_tracing_disabled(True)
settings = get_settings()

if not settings.groq_api_key:
    raise ValueError("GROQ_API_KEY not set in environment")

client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1"
)

model = OpenAIChatCompletionsModel(
    model="openai/gpt-oss-20b",
    openai_client=client
)

class TaskMasterContext(BaseModel):
    user_id: str
    user_name: str = "User"

def dynamic_instructions(ctx: RunContextWrapper[TaskMasterContext], agent: Agent) -> str:
    return f"""
    You are TaskMaster AI, a professional task management assistant.
    User: {ctx.context.user_name} (ID: {ctx.context.user_id})
    Use the available tools to manage tasks in the database.
    """

task_master_agent = Agent(
    name="TaskMasterAgent",
    instructions=dynamic_instructions,
    tools=get_mcp_tools(),
    model_settings=ModelSettings(temperature=0.3, tool_choice="auto", max_tokens=1000),
    model=model
)

async def run_task_agent(user_id: str, message: str, conversation_history: list[dict], user_name: str = "User") -> str:
    from agents.exceptions import InputGuardrailTripwireTriggered
    context = TaskMasterContext(user_id=user_id, user_name=user_name)
    try:
        result = await Runner.run(task_master_agent, input=message, context=context)
        return result.final_output
    except InputGuardrailTripwireTriggered:
        return "I'm TaskMaster AI, focused on helping you manage tasks and todos."
    except Exception as e:
        print(f"Agent error: {type(e).__name__}: {e}")
        raise

class TaskMasterAgent:
    def __init__(self, user_id: str):
        self.user_id = user_id
    async def run_conversation(self, session, messages: list[dict], user_message: str) -> str:
        return await run_task_agent(user_id=self.user_id, message=user_message, conversation_history=messages)
