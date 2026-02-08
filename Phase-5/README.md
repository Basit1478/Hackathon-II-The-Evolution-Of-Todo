# TaskMaster Pro AI

A natural language task management application powered by AI.

## Features

- Natural language chat interface for task management
- 5 MCP tools: add, list, complete, delete, update tasks
- Conversation persistence across sessions
- Responsive UI with dark mode support
- Built with Next.js 15, FastAPI, and Gemini AI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS 3.4+, Lucide React |
| Backend | FastAPI, SQLModel |
| AI | Gemini 1.5 Flash |
| Database | Neon PostgreSQL |
| Deployment | Vercel (frontend), Render (backend) |

## Project Structure

```
backend/
├── app/
│   ├── models/           # SQLModel database models
│   ├── services/         # Business logic services
│   ├── mcp_server/       # MCP tools and server
│   ├── ai/               # Gemini AI agent
│   ├── routes/           # FastAPI routes
│   └── db/               # Database utilities
└── requirements.txt

frontend/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/              # Utilities and API client
│   └── types/            # TypeScript types
└── package.json
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Neon PostgreSQL database
- Gemini API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql+asyncpg://user:password@host/database
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

### Chat

- `POST /api/{user_id}/chat` - Send a message and receive AI response
- `GET /api/{user_id}/conversations` - List user conversations
- `GET /api/{user_id}/conversations/{conversation_id}/messages` - Get conversation messages

## Natural Language Commands

- **Add task**: "Add buy groceries", "Create a task to call mom"
- **List tasks**: "Show my tasks", "What do I need to do?"
- **Complete task**: "Mark task 1 as done", "I finished task 2"
- **Delete task**: "Delete task 3", "Remove task 4"
- **Update task**: "Rename task 1 to buy milk", "Change task 2 description"

## License

MIT
