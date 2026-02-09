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
async def chat(
    user_id: str,
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Send a message to TaskMaster AI and receive a response.

    - Creates a new conversation if conversation_id is not provided
    - Fetches conversation history
    - Processes message through AI agent
    - Saves messages to database
    - Returns AI response
    """
    conversation_service = ConversationService(session)

    # Get or create conversation
    if request.conversation_id:
        conversation = await conversation_service.get_conversation(request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied to this conversation")
    else:
        conversation = await conversation_service.create_conversation(user_id)

    # Get conversation history
    history = await conversation_service.get_conversation_history(conversation.id)
    messages = [{"role": msg.role, "content": msg.content} for msg in history]

    # Save user message
    await conversation_service.add_message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="user",
        content=request.message,
    )

    # Run AI agent
    try:
        agent = TaskMasterAgent(user_id=user_id)
        response_text = await agent.run_conversation(
            session=session,
            messages=messages,
            user_message=request.message,
        )
    except Exception as e:
        # Log the error and return a user-friendly message
        print(f"AI agent error: {e}")
        response_text = "I'm having trouble processing your request right now. Please try again."

    # Save assistant response
    await conversation_service.add_message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="assistant",
        content=response_text,
    )

    return ChatResponse(
        conversation_id=conversation.id,
        response=response_text,
    )


@router.get("/{user_id}/conversations")
async def get_conversations(
    user_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get all conversations for a user."""
    conversation_service = ConversationService(session)
    conversations = await conversation_service.get_user_conversations(user_id)
    return [
        {
            "id": conv.id,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
        }
        for conv in conversations
    ]


@router.get("/{user_id}/conversations/{conversation_id}/messages")
async def get_messages(
    user_id: str,
    conversation_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get all messages in a conversation."""
    conversation_service = ConversationService(session)

    conversation = await conversation_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to this conversation")

    messages = await conversation_service.get_conversation_history(conversation_id)
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
