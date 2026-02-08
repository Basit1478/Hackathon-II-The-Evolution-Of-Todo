# Implementation Plan: Natural Language Task Management

**Branch**: `001-natural-language-task-management` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-natural-language-task-management/spec.md`

## Summary

Build a natural language chat interface for task management using OpenAI Agents SDK with 5 MCP tools (add, list, complete, delete, update tasks). The system follows stateless architecture with Neon PostgreSQL for persistence, FastAPI backend, and Next.js 15 frontend with Tailwind/shadcn/ui.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP SDK, Next.js 15, Tailwind CSS 3.4+, shadcn/ui
**Storage**: Neon PostgreSQL (serverless)
**Testing**: pytest (backend), Vitest (frontend)
**Target Platform**: Web (Vercel + Render)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <500ms p95 chat response, 100 concurrent sessions
**Constraints**: Stateless backend, mobile-first responsive UI, dark mode required
**Scale/Scope**: Single user focus for Phase III, conversation persistence required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Spec created before plan |
| II. Stateless Architecture | ✅ PASS | All state in PostgreSQL |
| III. AI-Native Design | ✅ PASS | NL chat + MCP tools + OpenAI Agents |
| IV. Modern UI Standards | ✅ PASS | Tailwind 3.4+, shadcn/ui, Lucide, mobile-first |
| V. Quality & Testing | ✅ PASS | pytest + Vitest, acceptance criteria defined |
| VI. Security & Performance | ✅ PASS | Better Auth, parameterized queries, <500ms target |

## Project Structure

### Documentation (this feature)

```text
specs/001-natural-language-task-management/
├── spec.md              # Feature specification
├── plan.md              # This file
└── tasks.md             # Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry
│   ├── config.py                  # Environment config
│   ├── database.py                # Neon PostgreSQL connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── conversation.py        # Conversation model
│   │   ├── message.py             # Message model
│   │   └── task.py                # Task model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── conversation_service.py # Conversation CRUD
│   │   └── task_service.py        # Task CRUD
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py              # MCP server setup
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── taskmaster_agent.py    # OpenAI Agent class
│   │   └── prompts.py             # System prompts
│   └── api/
│       ├── __init__.py
│       ├── router.py              # API router
│       └── chat.py                # POST /api/{user_id}/chat
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_mcp_tools.py
│   ├── test_conversation_service.py
│   └── test_chat_endpoint.py
├── requirements.txt
└── pyproject.toml

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Home/redirect
│   │   └── chat/
│   │       └── page.tsx           # Chat page
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   └── avatar.tsx
│   │   └── chat/
│   │       ├── chat-header.tsx
│   │       ├── message-list.tsx
│   │       ├── message-bubble.tsx
│   │       └── message-input.tsx
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── utils.ts               # Utilities
│   └── types/
│       └── chat.ts                # TypeScript types
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Structure Decision**: Web application structure with separate `backend/` (FastAPI) and `frontend/` (Next.js 15) directories. This aligns with the constitution's tech stack mandate and enables independent deployment to Render (backend) and Vercel (frontend).

## Complexity Tracking

> No constitution violations. Structure is minimal viable for the requirements.

---

## Phase 1: Backend Foundation

**Goal**: Establish database models, MCP tools, and conversation utilities.

### 1.1 Database Models & Migration

| Task | Description | Output |
|------|-------------|--------|
| Create Conversation model | SQLAlchemy model with id, user_id, created_at, updated_at | `backend/app/models/conversation.py` |
| Create Message model | SQLAlchemy model with id, conversation_id, user_id, role, content, created_at | `backend/app/models/message.py` |
| Create Task model | SQLAlchemy model with id, user_id, title, description, status, created_at, updated_at | `backend/app/models/task.py` |
| Add indexes | Index on user_id for all tables, conversation_id for messages | Migration file |
| Database connection | Async PostgreSQL connection pool to Neon | `backend/app/database.py` |

**Acceptance**: Models can be imported, migrations run successfully, connection pool works.

### 1.2 MCP Tools Implementation

| Tool | Input | Output | File |
|------|-------|--------|------|
| `add_task` | `{ user_id, title, description? }` | `{ task_id, status: "created", title }` | `backend/app/mcp/tools/add_task.py` |
| `list_tasks` | `{ user_id, status?: "all\|pending\|completed" }` | `{ tasks: [], total: number }` | `backend/app/mcp/tools/list_tasks.py` |
| `complete_task` | `{ user_id, task_id }` | `{ task_id, status: "completed", title }` | `backend/app/mcp/tools/complete_task.py` |
| `delete_task` | `{ user_id, task_id }` | `{ task_id, status: "deleted", title }` | `backend/app/mcp/tools/delete_task.py` |
| `update_task` | `{ user_id, task_id, title?, description? }` | `{ task_id, status: "updated" }` | `backend/app/mcp/tools/update_task.py` |

**Acceptance**: Each tool can be invoked standalone and returns expected schema.

### 1.3 MCP Server Registration

| Task | Description | Output |
|------|-------------|--------|
| Create MCP server | Initialize MCP server with tool registry | `backend/app/mcp/server.py` |
| Register tools | Register all 5 tools with proper schemas | Same file |
| Test tool invocation | Verify tools can be called via MCP protocol | `backend/tests/test_mcp_tools.py` |

**Acceptance**: MCP server starts, tools are discoverable and invocable.

### 1.4 Conversation Utilities

| Function | Description | File |
|----------|-------------|------|
| `create_conversation(user_id)` | Create new conversation, return ID | `backend/app/services/conversation_service.py` |
| `add_message(conversation_id, user_id, role, content)` | Append message to conversation | Same file |
| `get_conversation_history(conversation_id)` | Retrieve all messages for conversation | Same file |

**Acceptance**: Conversation CRUD operations work correctly.

---

## Phase 2: AI Agent + API

**Goal**: Create the AI agent with tool access and expose the chat endpoint.

### 2.1 Agent Setup

| Task | Description | Output |
|------|-------------|--------|
| Create system prompt | TaskMaster AI personality and instructions | `backend/app/agent/prompts.py` |
| Build TaskMasterAgent class | OpenAI Agents SDK wrapper with tool registration | `backend/app/agent/taskmaster_agent.py` |
| Register MCP tools | Connect 5 tools to agent | Same file |

**System Prompt**:
```
You are TaskMaster AI, a friendly and efficient task management assistant.

Your capabilities:
- Add new tasks to the user's list
- List all tasks or filter by status (pending/completed)
- Mark tasks as complete
- Delete tasks
- Update task titles or descriptions

Guidelines:
- Be concise and helpful
- Confirm actions after completing them
- Ask for clarification when the user's intent is unclear
- Use the user's exact wording for task titles when possible
- Format task lists clearly with IDs and statuses
```

**Acceptance**: Agent can be instantiated and responds to messages with tool calls.

### 2.2 Chat Endpoint

| Task | Description | Output |
|------|-------------|--------|
| Create router | API router for chat endpoints | `backend/app/api/router.py` |
| Implement `POST /api/{user_id}/chat` | Accept message, process via agent, return response | `backend/app/api/chat.py` |
| Add request validation | Validate user_id, message content | Same file |
| Implement stateless handling | No server-side session state | Same file |

**Request Schema**:
```json
{
  "conversation_id": 123,  // optional, creates new if omitted
  "message": "Add buy groceries to my list"
}
```

**Response Schema**:
```json
{
  "conversation_id": 123,
  "response": "I've added 'Buy groceries' to your task list (ID: 5)."
}
```

**Acceptance**: Endpoint responds correctly, creates conversations, persists messages.

### 2.3 Integration Testing

| Task | Description | Output |
|------|-------------|--------|
| Connect agent to MCP tools | Verify tool invocation from agent | Integration test |
| Test natural language flows | "Add X", "Show tasks", "Complete X" | `backend/tests/test_chat_endpoint.py` |
| Multi-turn conversation test | Verify context preservation | Same file |

**Acceptance**: End-to-end chat flow works with tool execution.

---

## Phase 3: Modern UI

**Goal**: Build responsive chat interface with Tailwind/shadcn/ui.

### 3.1 Design System Setup

| Task | Description | Output |
|------|-------------|--------|
| Configure Tailwind | Custom colors (indigo-500, slate-700, emerald-500, rose-500) | `frontend/tailwind.config.ts` |
| Setup shadcn/ui | Initialize component library | `frontend/components.json` |
| Add Inter font | Configure Next.js font loading | `frontend/src/app/layout.tsx` |

**Acceptance**: Tailwind classes work, shadcn/ui components available.

### 3.2 Base Components

| Component | Description | File |
|-----------|-------------|------|
| Button | Primary/secondary variants | `frontend/src/components/ui/button.tsx` |
| Input | Text input with focus states | `frontend/src/components/ui/input.tsx` |
| Textarea | Multi-line input | `frontend/src/components/ui/textarea.tsx` |
| Card | Container with shadow | `frontend/src/components/ui/card.tsx` |
| Avatar | User/assistant avatars | `frontend/src/components/ui/avatar.tsx` |

**Acceptance**: All base components render correctly.

### 3.3 Chat Components

| Component | Description | File |
|-----------|-------------|------|
| ChatHeader | Title "TaskMaster AI" + subtitle | `frontend/src/components/chat/chat-header.tsx` |
| MessageList | Scrollable container with auto-scroll | `frontend/src/components/chat/message-list.tsx` |
| MessageBubble | User (right/indigo) or Assistant (left/slate) | `frontend/src/components/chat/message-bubble.tsx` |
| MessageInput | Textarea + Send button | `frontend/src/components/chat/message-input.tsx` |

**Acceptance**: Chat UI matches design spec, responsive on mobile/desktop.

### 3.4 Chat Page Integration

| Task | Description | Output |
|------|-------------|--------|
| Create chat page | Compose chat components | `frontend/src/app/chat/page.tsx` |
| State management | Messages array, loading state, conversation ID | Same file |
| API integration | Connect to `POST /api/{user_id}/chat` | `frontend/src/lib/api.ts` |
| Optimistic updates | Show user message immediately | Chat page |
| Error handling | Display error states gracefully | Chat page |

**Acceptance**: Full chat flow works, messages persist, UI responsive.

---

## Phase 4: Deploy + Polish

**Goal**: Deploy to production and verify all features.

### 4.1 Deployment

| Task | Description | Output |
|------|-------------|--------|
| Deploy frontend to Vercel | Configure build, environment variables | Vercel project |
| Deploy backend to Render | Configure Python runtime, Neon connection | Render service |
| Configure environment variables | API URLs, database credentials, OpenAI key | Both platforms |
| Setup CORS | Allow frontend origin | Backend config |

**Acceptance**: Both services deployed and accessible.

### 4.2 Verification Testing

| Test | Description | Expected |
|------|-------------|----------|
| Chat flow | Send message, receive response | Works end-to-end |
| Task operations | Add, list, complete, delete, update | All 5 tools functional |
| Conversation persistence | Reload page, history preserved | Messages restored |
| Mobile responsive | Test on 375px viewport | UI adapts correctly |
| Error handling | Disconnect network, retry | Graceful error messages |

**Acceptance**: All success criteria from spec met.

### 4.3 Documentation

| Task | Description | Output |
|------|-------------|--------|
| Update README | Installation, setup, usage | `README.md` |
| API documentation | Endpoint details | `docs/api.md` |
| Environment setup | Required variables | `.env.example` |

**Acceptance**: New developer can setup and run project from docs.

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenAI API latency | Medium | High | Implement streaming responses, timeout handling |
| MCP tool integration issues | Low | Medium | Test tools independently before agent integration |
| Neon cold start delays | Medium | Medium | Use connection pooling, keep-alive queries |

## Next Steps

Run `/sp.tasks` to generate detailed implementation tasks from this plan.
