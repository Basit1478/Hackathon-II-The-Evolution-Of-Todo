# Tasks: Natural Language Task Management

**Input**: Design documents from `/specs/001-natural-language-task-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/`, `backend/tests/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure per implementation plan
- [ ] T002 [P] Initialize backend Python project with FastAPI dependencies in `backend/`
- [ ] T003 [P] Initialize frontend Next.js 15 project with TypeScript in `frontend/`
- [ ] T004 [P] Configure backend linting (ruff) and formatting (black) in `backend/pyproject.toml`
- [ ] T005 [P] Configure frontend ESLint and Prettier in `frontend/`

**Checkpoint**: Project structure ready for development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [ ] T006 Create database connection module with Neon PostgreSQL async pool in `backend/app/database.py`
- [ ] T007 [P] Create Conversation SQLModel class in `backend/app/models/conversation.py`
  - Fields: id (int, PK), user_id (str), created_at (datetime), updated_at (datetime)
  - Index on user_id
- [ ] T008 [P] Create Message SQLModel class in `backend/app/models/message.py`
  - Fields: id (int, PK), conversation_id (int, FK), user_id (str), role (str), content (text), created_at (datetime)
  - Index on conversation_id
  - Relationship to Conversation
- [ ] T009 [P] Create Task SQLModel class in `backend/app/models/task.py`
  - Fields: id (int, PK), user_id (str), title (str 200), description (text, nullable), status (str: pending/completed), created_at (datetime), updated_at (datetime)
  - Index on user_id, status
- [ ] T010 Create Alembic migration for all models in `backend/alembic/versions/`
- [ ] T011 Run migration and verify tables created in Neon

### Conversation Utilities

- [ ] T012 Implement `create_conversation(user_id)` → Conversation in `backend/app/services/conversation_service.py`
- [ ] T013 Implement `get_conversation(conv_id)` → Conversation | None in same file
- [ ] T014 Implement `add_message(conv_id, user_id, role, content)` → Message in same file
- [ ] T015 Implement `get_conversation_history(conv_id, limit=50)` → List[Message] in same file

### Task Service

- [ ] T016 Implement task CRUD operations in `backend/app/services/task_service.py`
  - `create_task(user_id, title, description=None)` → Task
  - `get_task(task_id, user_id)` → Task | None
  - `list_tasks(user_id, status=None)` → List[Task]
  - `update_task(task_id, user_id, title=None, description=None)` → Task
  - `complete_task(task_id, user_id)` → Task
  - `delete_task(task_id, user_id)` → bool

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Send Message and Receive AI Response (Priority: P1) 🎯 MVP

**Goal**: User can send a message and receive an AI response through the chat interface

**Independent Test**: Send "Hello" and receive a friendly response from TaskMaster AI

### MCP Tools (Required for AI Agent)

- [ ] T017 [P] [US1] Implement `add_task` MCP tool in `backend/app/mcp/tools/add_task.py`
  - Input: `{ user_id: str, title: str, description?: str }`
  - Output: `{ task_id: int, status: "created", title: str }`
  - Validation: title 1-200 chars
- [ ] T018 [P] [US1] Implement `list_tasks` MCP tool in `backend/app/mcp/tools/list_tasks.py`
  - Input: `{ user_id: str, status?: "all"|"pending"|"completed" }`
  - Output: `{ tasks: Task[], total: int }`
- [ ] T019 [P] [US1] Implement `complete_task` MCP tool in `backend/app/mcp/tools/complete_task.py`
  - Input: `{ user_id: str, task_id: int }`
  - Output: `{ task_id: int, status: "completed", title: str }`
- [ ] T020 [P] [US1] Implement `delete_task` MCP tool in `backend/app/mcp/tools/delete_task.py`
  - Input: `{ user_id: str, task_id: int }`
  - Output: `{ task_id: int, status: "deleted", title: str }`
- [ ] T021 [P] [US1] Implement `update_task` MCP tool in `backend/app/mcp/tools/update_task.py`
  - Input: `{ user_id: str, task_id: int, title?: str, description?: str }`
  - Output: `{ task_id: int, status: "updated" }`

### MCP Server

- [ ] T022 [US1] Initialize MCP Server in `backend/app/mcp/server.py`
- [ ] T023 [US1] Register all 5 tools with MCP Server in same file
- [ ] T024 [US1] Implement `list_tools()` handler in same file
- [ ] T025 [US1] Implement `call_tool()` handler in same file

### AI Agent

- [ ] T026 [US1] Create system prompt in `backend/app/agent/prompts.py`
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
- [ ] T027 [US1] Build TaskMasterAgent class in `backend/app/agent/taskmaster_agent.py`
  - Initialize with Gemini API key
  - Register MCP tools with agent
  - Implement `run_conversation(messages: List[Message])` → str
  - Handle tool calls and responses

### Chat API Endpoint

- [ ] T028 [US1] Create API router in `backend/app/api/router.py`
- [ ] T029 [US1] Implement `POST /api/{user_id}/chat` endpoint in `backend/app/api/chat.py`
  - Request: `{ conversation_id?: int, message: str }`
  - Response: `{ conversation_id: int, response: str }`
  - Create conversation if conversation_id not provided
  - Fetch conversation history from DB
  - Call TaskMasterAgent with history
  - Save user message and assistant response to DB
  - Return response

### Frontend Foundation

- [ ] T030 [P] [US1] Configure Tailwind with custom colors in `frontend/tailwind.config.ts`
  - Primary: indigo-500
  - Secondary: slate-700
  - Success: emerald-500
  - Error: rose-500
- [ ] T031 [P] [US1] Setup shadcn/ui in `frontend/` with `components.json`
- [ ] T032 [P] [US1] Add Inter font to `frontend/src/app/layout.tsx`
- [ ] T033 [P] [US1] Create Button component in `frontend/src/components/ui/button.tsx`
- [ ] T034 [P] [US1] Create Textarea component in `frontend/src/components/ui/textarea.tsx`
- [ ] T035 [P] [US1] Create Card component in `frontend/src/components/ui/card.tsx`
- [ ] T036 [P] [US1] Create Avatar component in `frontend/src/components/ui/avatar.tsx`

### Chat UI Components

- [ ] T037 [US1] Create ChatHeader component in `frontend/src/components/chat/chat-header.tsx`
  - Display "TaskMaster AI" title
  - Show "Your AI-powered task assistant" subtitle
  - Tailwind styling
- [ ] T038 [US1] Create MessageBubble component in `frontend/src/components/chat/message-bubble.tsx`
  - User messages: right-aligned, indigo background
  - Assistant messages: left-aligned, slate background
  - Show avatar icon (User or Bot from Lucide)
  - Display timestamp
  - Responsive design
- [ ] T039 [US1] Create MessageList component in `frontend/src/components/chat/message-list.tsx`
  - Scrollable container with flex-grow
  - Map over messages array
  - Auto-scroll to bottom on new message
  - Loading state with spinner
  - Empty state: "Start a conversation..."
- [ ] T040 [US1] Create MessageInput component in `frontend/src/components/chat/message-input.tsx`
  - Auto-resize textarea
  - Send button with Send icon (Lucide)
  - Enter to send, Shift+Enter for newline
  - Disabled state when sending
  - Max 10,000 characters

### Chat Page Integration

- [ ] T041 [US1] Create TypeScript types in `frontend/src/types/chat.ts`
  - Message: { id, role, content, createdAt }
  - Conversation: { id, messages }
  - ChatRequest: { conversation_id?, message }
  - ChatResponse: { conversation_id, response }
- [ ] T042 [US1] Create API client in `frontend/src/lib/api.ts`
  - `sendMessage(userId, conversationId, message)` → ChatResponse
  - Include auth headers
  - Error handling
- [ ] T043 [US1] Implement Chat page in `frontend/src/app/chat/page.tsx`
  - State: messages[], loading, conversationId
  - Compose ChatHeader, MessageList, MessageInput
  - Send message handler with optimistic update
  - Error handling with toast/alert

**Checkpoint**: User Story 1 complete - basic chat flow working

---

## Phase 4: User Story 2-6 - Task Operations via Natural Language (Priority: P2-P6)

**Goal**: All 5 task operations work through natural language commands

**Independent Test**: Each operation can be tested via specific phrases

### Integration Testing (All Stories)

- [ ] T044 [P] [US2-6] Test "Add buy groceries" → task created in `backend/tests/test_chat_endpoint.py`
- [ ] T045 [P] [US2-6] Test "Show my tasks" → tasks listed
- [ ] T046 [P] [US2-6] Test "Complete task 1" → task marked done
- [ ] T047 [P] [US2-6] Test "Delete task 2" → task removed
- [ ] T048 [P] [US2-6] Test "Rename task 3 to X" → task updated
- [ ] T049 [US2-6] Test multi-turn conversation with context preservation

**Checkpoint**: All 5 MCP tools working via natural language

---

## Phase 5: Deployment

**Purpose**: Deploy to production and verify all features

### Backend Deployment

- [ ] T050 Create `backend/requirements.txt` with all dependencies
- [ ] T051 Create `backend/Dockerfile` or Render configuration
- [ ] T052 Deploy backend to Render
- [ ] T053 Configure environment variables (DATABASE_URL, GEMINI_API_KEY)
- [ ] T054 Verify API endpoints working in production

### Frontend Deployment

- [ ] T055 Create production build configuration in `frontend/next.config.ts`
- [ ] T056 Deploy frontend to Vercel
- [ ] T057 Configure environment variables (NEXT_PUBLIC_API_URL)
- [ ] T058 Configure CORS on backend to allow Vercel origin

### E2E Verification

- [ ] T059 [P] Verify chat flow works end-to-end in production
- [ ] T060 [P] Verify all 5 task operations work in production
- [ ] T061 [P] Verify conversation persistence (reload preserves history)
- [ ] T062 [P] Verify mobile responsive (375px viewport)
- [ ] T063 [P] Verify dark mode styling

**Checkpoint**: Application deployed and accessible

---

## Phase 6: Polish & Documentation

**Purpose**: Final polish and documentation

- [ ] T064 [P] Update README.md with setup instructions
- [ ] T065 [P] Create API documentation in `docs/api.md`
- [ ] T066 [P] Create `.env.example` files for backend and frontend
- [ ] T067 Code cleanup and remove console.logs
- [ ] T068 Add error boundary to frontend

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1 MVP) → Phase 4 (US2-6) → Phase 5 (Deploy) → Phase 6 (Polish)
```

### Critical Path

1. **T001-T005**: Setup (parallel)
2. **T006-T016**: Foundation (T006 first, then T007-T009 parallel, then T010-T016)
3. **T017-T025**: MCP Tools & Server (T017-T021 parallel, then T022-T025 sequential)
4. **T026-T029**: AI Agent & API (sequential)
5. **T030-T043**: Frontend (T030-T036 parallel, then T037-T043 sequential)
6. **T044-T049**: Integration tests (parallel)
7. **T050-T063**: Deployment (backend then frontend, verification parallel)
8. **T064-T068**: Polish (parallel)

### Parallel Opportunities

```bash
# Phase 1 - All parallel
T002, T003, T004, T005

# Phase 2 - Models parallel after database
T007, T008, T009 (after T006)

# Phase 3 - MCP tools parallel
T017, T018, T019, T020, T021

# Phase 3 - Frontend foundation parallel
T030, T031, T032, T033, T034, T035, T036

# Phase 4 - Integration tests parallel
T044, T045, T046, T047, T048

# Phase 5 - Verification parallel
T059, T060, T061, T062, T063

# Phase 6 - Documentation parallel
T064, T065, T066
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test chat flow end-to-end
5. Deploy if ready (Phase 5)

### Full Implementation

1. Setup → Foundation → US1 (MVP)
2. Add US2-6 integration tests
3. Deploy
4. Polish

---

## Notes

- [P] tasks = different files, no dependencies
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- All tasks reference exact file paths from plan.md
- Backend uses Gemini API (per T10 in user input) not OpenAI
