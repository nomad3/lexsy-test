# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SmartDocs** is an AI-first legal document automation platform. Lawyers upload DOCX files, the system detects placeholders via AI, then fills them through conversational AI and cross-document intelligence.

**Stack:** React 18 + Vite (frontend), Express + TypeScript (backend), PostgreSQL + Knex.js (database), OpenAI GPT-4 (AI agents)

**Monorepo:** npm workspaces with `frontend/`, `backend/`, and `common/` (shared types).

## Development Commands

```bash
# Setup
npm install                              # All workspaces
cp backend/.env.example backend/.env     # Then edit with real credentials

# Run (local dev)
cd backend && npm run dev                # Backend on :5000
cd frontend && npm run dev               # Frontend on :5173 (proxies /api to :5000)

# Run (Docker)
docker-compose up -d                     # DB + backend(:5001) + frontend(:5175)

# Database (from backend/)
npm run migrate:latest                   # Run all migrations
npm run migrate:rollback                 # Rollback last batch
npm run seed                             # Seed demo user + data

# Build
npm run build                            # Root: builds common → backend → frontend

# Test
cd backend && npm test                   # Jest
cd backend && npm run test:coverage      # Jest with coverage
cd frontend && npm run lint              # ESLint (no test runner configured yet)

# Type checking
npm run typecheck                        # Both workspaces
```

## Architecture

### Three-Layer Backend Pattern

```
Controller (thin, in routes/) → Service (business logic) → Agent (AI/OpenAI calls)
```

- **Controllers**: `backend/src/controllers/` — 5 controllers (auth, documents, conversations, dataroom, analytics)
- **Services**: `backend/src/services/` — 6 services matching the controllers + AIAgentService for orchestration
- **Agents**: `backend/src/agents/` — 11 AI agents, all extending `BaseAgent.ts`

### AI Agent System

All agents extend `BaseAgent.ts` which provides OpenAI API interaction, task logging to `ai_tasks` table, retry with exponential backoff, and token usage tracking.

The 11 agents and their roles:
- **DocumentAnalyzer** — Document triage/classification on upload
- **PlaceholderExtractor** — Identifies fillable fields in documents
- **EntityMatcher** — Matches placeholders to known entities from data room
- **ConversationalAssistant** — Drives the chat-based document filling flow
- **ComplianceValidator** — Validates filled values against format rules
- **HealthScoreCalculator** — Scores documents 0-100 for completeness
- **MultiDocIntelligence** — Detects cross-document relationships and suggests synced updates
- **ConflictDetector** — Finds inconsistencies across related documents
- **NLSearchAgent** — Converts natural language queries to SQL
- **TemplateAnalyzer** — Pre-processes document templates
- **InsightsEngine** — Pattern analysis and learning from user corrections

### Core Data Flows

**Upload:** User uploads .docx → DocumentAnalyzer classifies → PlaceholderExtractor finds fields → ready for filling

**Filling:** ConversationalAssistant generates questions → EntityMatcher suggests from data room → user provides answers → HealthScoreCalculator scores result

**Cross-doc sync:** Value changed in doc A → MultiDocIntelligence finds related docs → suggests updates to B, C

### Database

PostgreSQL with 19 tables via Knex.js migrations. Key table groups:
- **Auth:** `users`, `sessions`
- **Documents:** `documents`, `placeholders`, `document_templates`
- **AI:** `ai_agents`, `ai_tasks`, `ai_insights`, `ai_training_data`
- **Data Room:** `data_room_documents`, `knowledge_graph`
- **Cross-doc:** `document_relationships`, `cross_document_updates`, `health_checks`, `conflicts`
- **Search:** `search_queries`, `business_intelligence`

All queries are filtered by `user_id` or `organization` for multi-tenancy.

Knex config: `backend/knexfile.ts` — uses `DATABASE_URL` env var or defaults to localhost:5432.

### Frontend

- **Routing:** React Router v6 in `App.tsx` — public routes (`/`, `/login`, `/register`) and protected routes (`/dashboard`, `/documents`, `/documents/:id`, `/conversation/:documentId`, `/dataroom`)
- **State:** Zustand for auth (`stores/authStore.ts`), React Query for server state
- **API client:** `lib/api.ts` — Axios with auth token injection and 401 redirect
- **UI:** Custom Tailwind components (not shadcn/ui library, but similar patterns). Purple/blue gradient theme.
- **Path alias:** `@` → `./src` (configured in vite and tsconfig)

### API Routes

All routes mounted under `/api/` in `server.ts`:
- `/api/auth` — login, register
- `/api/documents` — CRUD, upload, analyze, placeholders
- `/api/conversations` — start, send message, history
- `/api/dataroom` — upload, list, stats, delete
- `/api/analytics` — dashboard metrics, insights

Health check at `GET /health` (not under `/api/`).

### Auth

JWT-based. Middleware chain: `authenticate` → `authorize(['lawyer', 'admin'])` → handler. Tokens in Bearer header. Rate limiting on auth endpoints (5 req/15 min).

## Docker

```bash
docker-compose up -d           # Dev: DB(:5432) + backend(:5001) + frontend(:5175)
docker-compose -f docker-compose.prod.yml up -d   # Prod with nginx
```

Backend container runs `npm run migrate:prod && npm start` on startup.

## Environment Variables

Backend requires (see `backend/.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — for AI agents
- `JWT_SECRET` — for auth tokens
- `PORT` (default 5000), `NODE_ENV`, `FRONTEND_URL`, `FILE_UPLOAD_PATH`

Frontend: `VITE_API_URL` (only needed when not using Vite proxy)

## Demo Credentials

- Email: `demo@smartdocs.com`
- Password: `Demo123!`

## Conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Branch naming: `feature/`, `fix/`, `docs/`
- Error responses use structured format: `{ success: false, error: { code, message, details } }`
- File uploads: DOCX only, 10MB max, validated by mimetype
