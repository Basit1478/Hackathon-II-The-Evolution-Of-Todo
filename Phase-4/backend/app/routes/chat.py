from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session
from app.services.conversation_service import ConversationService
from app.ai.agent import TaskMasterAgent

router = APIRouter(prefix="/api", tags=["chat"])

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(min_length=1, max_length=10000)

class ChatResponse(BaseModel):
    conversation_id: int
    response: str

@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(user_id: str, request: ChatRequest, session: AsyncSession = Depends(get_session)):
    conversation_service = ConversationService(session)
    if request.conversation_id:
        conversation = await conversation_service.get_conversation(request.conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = await conversation_service.create_conversation(user_id)
    
    history = await conversation_service.get_conversation_history(conversation.id)
    messages = [{"role": msg.role, "content": msg.content} for msg in history]
    await conversation_service.add_message(conversation.id, user_id, "user", request.message)
    
    try:
        agent = TaskMasterAgent(user_id=user_id)
        response_text = await agent.run_conversation(session, messages, request.message)
    except Exception as e:
        response_text = "I'm having trouble processing your request. Please try again."
    
    await conversation_service.add_message(conversation.id, user_id, "assistant", response_text)
    return ChatResponse(conversation_id=conversation.id, response=response_text)
