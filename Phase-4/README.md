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

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
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

### Request/Response

```json
// POST /api/{user_id}/chat
// Request
{
  "conversation_id": 123,  // optional
  "message": "Add buy groceries"
}

// Response
{
  "conversation_id": 123,
  "response": "I've added 'buy groceries' to your task list."
}
```

## Natural Language Commands

The AI understands various phrasings:

- **Add task**: "Add buy groceries", "Create a task to call mom"
- **List tasks**: "Show my tasks", "What do I need to do?"
- **Complete task**: "Mark task 1 as done", "I finished task 2"
- **Delete task**: "Delete task 3", "Remove task 4"
- **Update task**: "Rename task 1 to buy milk", "Change task 2 description"

## Deployment

### Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your database URL and Gemini API key

# Run the server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

### Production Deployment

For production deployment, please refer to [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Database Schema

The application uses three main tables:

- `conversations`: Stores conversation records with user_id and timestamps
- `messages`: Stores individual messages linked to conversations
- `tasks`: Stores task information with status tracking

Tables have been created in your Neon database project `phase-3-ai-assistant`.

## License

MIT
