# Legal Document Automation Platform - Design Document

**Date**: 2025-01-18
**Project**: Lexsy - AI-Powered Legal Document Automation
**Status**: Production-Ready Architecture

---

## Executive Summary

Building an AI-first web application that helps lawyers fill legal documents through intelligent placeholder detection, conversational filling, and cross-document intelligence. The platform leverages multiple AI agents for document analysis, entity extraction, and business intelligence.

**Timeline**: 1 week (production-ready quality)
**Deployment**: Docker Compose on DigitalOcean
**Tech Stack**: React + Vite, Express + TypeScript, PostgreSQL, OpenAI GPT-4

---

## Core Requirements

### Must-Have Features
1. Upload legal documents (.docx)
2. Identify and distinguish template text from dynamic placeholders
3. Conversational experience to fill placeholders
4. Display completed document with download option
5. Data room for company documents (auto-populate fields)

### Competitive Advantage Features
1. **Multi-Document Intelligence** - Cross-document value synchronization
2. **Natural Language Search** - Query documents in plain English
3. **Document Health Score** - Real-time completeness and risk scoring
4. **Smart Templates Library** - Pre-analyzed common legal documents
5. **Conflict Checker** - Consistency validation across documents

---

## Architecture Overview

### High-Level Design

**Three-Tier Architecture:**

1. **Frontend**: React 18 + Vite + TypeScript SPA
2. **Backend**: Express + TypeScript RESTful API
3. **Data Layer**: PostgreSQL + Local File System

**Monorepo Structure**: `/frontend`, `/backend`, `/common` (shared types)

**Containerization**: Docker Compose with 4 services:
- Frontend (nginx serving static build)
- Backend (Node.js)
- PostgreSQL
- Nginx reverse proxy (SSL/routing)

---

## Database Schema

### AI Infrastructure Tables

**`ai_agents`**
- Agent metadata (name, type, model, system_prompt, config)
- Supports 11 specialized agents

**`ai_tasks`**
- Task execution tracking
- Input/output logging
- Token usage and cost tracking

**`ai_insights`**
- Generated insights (anomalies, patterns, suggestions, risks)
- Confidence scoring and metadata

**`ai_training_data`**
- User corrections and feedback
- Training loop for continuous improvement

### Core Document Tables

**`documents`**
- Document metadata and file paths
- AI classification confidence
- Risk score and completion percentage
- Status tracking (uploaded → analyzing → ready → filling → completed)

**`placeholders`**
- Extracted fields from documents
- AI-suggested values from data room
- Validation status and confidence scores

**`document_templates`**
- Pre-analyzed legal document templates
- Pre-extracted placeholder structures
- Popularity tracking

### Data Room & Intelligence

**`data_room_documents`**
- Company document uploads
- AI-generated summaries
- Quality scores

**`knowledge_graph`**
- Entity extraction (company, person, amount, date, address)
- Relationship mapping
- Source tracking and confidence
- Usage analytics

**`business_intelligence`**
- Metrics (document velocity, field accuracy, time savings)
- Time-series data
- Company-specific analytics

### Advanced Features Tables

**`document_relationships`**
- Links between related documents
- Relationship types (same_company, same_series, amendment)

**`cross_document_updates`**
- Suggested value synchronization across documents
- User acceptance tracking

**`health_checks`**
- Document health scores (0-100)
- Completeness, consistency, risk subscores
- Issues and recommendations

**`conflicts`**
- Value mismatches and inconsistencies
- Severity levels (critical, warning, info)
- Status tracking (open, acknowledged, resolved)

**`search_queries`**
- Natural language query logging
- Parsed filter tracking

### Authentication Tables

**`users`**
- Email/password authentication (bcrypt)
- Role-based access (lawyer, admin)
- Organization support (multi-tenant)

**`sessions`**
- JWT token management
- Expiration and security tracking

---

## AI Agent System

### Multi-Agent Architecture

**Agent 1: DocumentAnalyzer**
- Document triage and classification
- Structure extraction
- Complexity assessment

**Agent 2: PlaceholderExtractor**
- Field identification and typing
- Dependency detection
- Question generation

**Agent 3: EntityMatcher**
- Knowledge graph search
- Confidence-scored suggestions
- Ambiguity handling

**Agent 4: ConversationalAssistant**
- Context-aware question generation
- Input validation
- Natural language interaction

**Agent 5: ComplianceValidator**
- Format validation
- Error detection
- Improvement suggestions

**Agent 6: InsightsEngine**
- Pattern analysis
- Anomaly detection
- Learning from corrections

**Agent 7: MultiDocIntelligence**
- Document relationship mapping
- Cross-document update suggestions
- Relationship graph maintenance

**Agent 8: NLSearchAgent**
- Natural language to SQL conversion
- Legal domain understanding
- Ranked result generation

**Agent 9: HealthScoreCalculator**
- Multi-dimensional scoring
- Validation checks
- Actionable recommendations

**Agent 10: TemplateAnalyzer**
- Template preprocessing
- Placeholder structure creation
- Metadata generation

**Agent 11: ConflictDetector**
- Cross-document comparison
- Pattern anomaly detection
- Legal implication analysis

### Agent Orchestration
- Database-backed task queue
- All I/O logged to `ai_tasks`
- Exponential backoff retry (3 attempts)
- Circuit breaker for failing services
- GPT-4 → GPT-3.5-turbo fallback

---

## API Design

### RESTful Endpoints

**Document Management**
- `POST /api/documents/upload`
- `GET /api/documents/:id`
- `GET /api/documents/:id/placeholders`
- `PATCH /api/documents/:id/placeholders/:placeholderId`
- `POST /api/documents/:id/validate`
- `GET /api/documents/:id/download`
- `GET /api/documents`

**Conversational Interface**
- `POST /api/conversation/:documentId/start`
- `POST /api/conversation/:documentId/message`
- `GET /api/conversation/:documentId/context`

**Data Room**
- `POST /api/data-room/upload`
- `GET /api/data-room/documents`
- `GET /api/data-room/companies`
- `GET /api/data-room/entities/:companyName`
- `DELETE /api/data-room/documents/:id`

**AI Insights & Intelligence**
- `GET /api/insights`
- `GET /api/insights/:documentId`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/patterns`
- `POST /api/feedback`

**Multi-Document Intelligence**
- `GET /api/documents/:id/related`
- `POST /api/documents/:id/sync-values`
- `GET /api/documents/network`

**Natural Language Search**
- `POST /api/search/query`
- `GET /api/search/suggestions`

**Health Score**
- `GET /api/documents/:id/health`
- `POST /api/documents/:id/health/refresh`
- `GET /api/documents/:id/issues`

**Templates**
- `GET /api/templates`
- `POST /api/documents/from-template/:templateId`
- `GET /api/templates/:id/preview`

**Conflicts**
- `GET /api/documents/:id/conflicts`
- `PATCH /api/conflicts/:id`
- `GET /api/conflicts/dashboard`

**Authentication**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

**Agent Management**
- `GET /api/agents`
- `GET /api/agents/:id/tasks`
- `PATCH /api/agents/:id/config` (admin)

### Service Layer
- `DocumentService`
- `AIAgentService`
- `ConversationService`
- `DataRoomService`
- `KnowledgeGraphService`
- `AnalyticsService`

---

## Frontend Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **UI Library**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **File Upload**: React Dropzone
- **Charts**: Recharts
- **Animations**: Framer Motion

### Page Structure

**Public Pages:**

**Landing Page (`/`)**
- Hero with bold headline and CTA
- Features grid (AI extraction, conversational filling, data room)
- How it works (3-step flow)
- AI showcase (animated agents)
- Real-time stats counters
- Trust indicators
- Dark mode, glassmorphism, smooth animations

**Auth Pages (`/login`, `/register`)**
- Clean centered forms
- Inline validation
- Remember me option

**Protected Pages:**

**Dashboard (`/dashboard`)**
- Overview cards (totals, in progress, completed)
- Recent documents table
- Quick actions (upload, data room)
- AI insights feed (sidebar)
- Analytics preview

**Document Upload (`/documents/new`)**
- Drag-and-drop zone
- File validation
- Upload progress with AI agent status

**Conversational Filling (`/documents/:id/fill`)**
- Left: Document preview with highlighted placeholders
- Right: Chat interface with AI
- Progress bar (% complete)
- Auto-suggestions from data room (green highlight)
- Real-time validation
- Edit previous answers
- Jump to field

**Document Library (`/documents`)**
- Filterable table (status, type, date)
- Search functionality
- Batch actions
- Download/preview

**Data Room (`/data-room`)**
- Company-based organization
- Upload area
- Document type badges
- Extracted entities (expandable cards)
- Knowledge graph visualization (D3.js/React Flow)

**Analytics Dashboard (`/analytics`)**
- KPI cards
- Charts (velocity, accuracy, trends)
- AI insights table
- Export reports

**Admin Panel (`/admin`)** (admin only)
- AI agents status/config
- Task queue monitoring
- User management
- System health

---

## Error Handling & Resilience

### Frontend Error Handling
- Axios interceptor for API errors
- Toast notifications
- File upload validation (type/size)
- AI timeout handling with retry
- Offline detection with operation queue
- React error boundaries

### Backend Error Handling

**Structured Error Responses:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "timestamp": "ISO-8601",
    "requestId": "uuid"
  }
}
```

**Error Categories:**
- Validation (400)
- Auth (401, 403)
- Not Found (404)
- Rate Limiting (429)
- AI/Server Errors (500)

### AI Resilience
- Exponential backoff (1s, 2s, 4s, 8s, 16s)
- Max 3 retries
- Circuit breaker pattern
- GPT-4 → GPT-3.5-turbo fallback

### Logging
- Winston with structured JSON logs
- Levels: ERROR, WARN, INFO, DEBUG
- Request ID tracking
- User context included

### Monitoring Metrics
- API response times (p50, p95, p99)
- AI agent success/failure rates
- Token usage and costs
- Active users/sessions
- Document throughput

---

## Testing Strategy

### Frontend Testing
- **Unit**: Vitest + React Testing Library (80%+ coverage)
- **Integration**: MSW for API mocking
- **E2E**: Playwright for critical paths

### Backend Testing
- **Unit**: Jest (85%+ coverage)
- **Integration**: All endpoints with test DB
- **AI Agents**: Mock OpenAI responses
- **Database**: Migration and query tests

### Performance Testing
- k6 load tests (100 concurrent users)
- Document upload stress tests
- AI queue throughput

### Security Testing
- SQL injection prevention
- XSS protection
- Auth bypass attempts
- Malicious file uploads
- Rate limiting validation

---

## Deployment & Infrastructure

### Docker Compose Setup

**Services:**
1. **Frontend** (nginx:alpine) - Port 3000
2. **Backend** (node:20-alpine) - Port 5000
3. **PostgreSQL** (postgres:16-alpine) - Internal only
4. **Nginx Reverse Proxy** - Ports 80/443, SSL termination

### Environment Variables

**Backend:**
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT=5000`
- `FILE_UPLOAD_PATH=/app/uploads`

**Frontend:**
- `VITE_API_URL`
- `VITE_ENV=production`

### Deployment Platform
**Recommended**: DigitalOcean Droplet (4GB RAM, 2 vCPUs, $24/mo)
- Ubuntu 22.04 + Docker + Docker Compose
- Certbot for SSL (Let's Encrypt)
- UFW firewall (allow 80, 443, 22)

**Alternative**: Railway / Render (easier, higher cost)

### CI/CD Pipeline (GitHub Actions)
1. Lint and test
2. Build Docker images
3. Push to registry
4. SSH deploy to server
5. Pull and restart containers
6. Smoke tests
7. Notifications

### Database Migrations
- Prisma or TypeORM
- Auto-run on container startup
- Pre-migration backups
- Rollback plan

### Backup Strategy
- Daily database backups (`pg_dump`)
- Weekly file backups (`/uploads`)
- Retention: 7 daily, 4 weekly, 3 monthly
- Storage: DigitalOcean Spaces / AWS S3

### Monitoring
- Health check endpoint: `/api/health`
- UptimeRobot for uptime monitoring
- Winston logs with rotation
- Email/Slack alerts

---

## Security Implementation

### Authentication
- JWT tokens (HttpOnly cookies + Bearer)
- Bcrypt password hashing
- Password complexity requirements
- Rate limiting (5 attempts / 15 min)

### Authorization
- Middleware chain: `authenticate → authorize → handler`
- Role-based access (lawyer, admin)
- Data isolation by `user_id` / `organization`

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- File upload validation (type, size, content)
- HTTPS only (SSL certificates)

### Demo Credentials
- Test user: `demo@lexsy.com` / `Demo123!`

---

## Development Workflow

### Setup
```bash
git clone <repo>
cd lexsy-test
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files
npm run dev
```

### Commands

**Root:**
- `npm run dev` - Start both apps
- `npm run build` - Build all
- `npm run test` - Test all
- `npm run lint` - Lint all

**Frontend:**
- `npm run dev` - Vite dev server (5173)
- `npm run test` - Vitest
- `npm run test:e2e` - Playwright

**Backend:**
- `npm run dev` - Nodemon (5000)
- `npm run test` - Jest
- `npm run migrate` - DB migrations
- `npm run seed` - Seed data

**Docker:**
- `docker-compose up -d` - Start all
- `docker-compose logs -f backend` - Logs
- `docker-compose exec backend npm run migrate` - Migrate

### Git Workflow
- Feature branches: `feature/feature-name`
- Conventional commits: `feat:`, `fix:`, `docs:`
- PR required for main
- CI must pass

---

## Project Directory Structure

```
lexsy-test/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Route components
│   │   ├── services/           # API clients
│   │   ├── stores/             # Zustand stores
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Helpers
│   │   └── types/              # Frontend types
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # Express + TypeScript
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── services/           # Business logic
│   │   ├── agents/             # 11 AI agents
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── routes/             # API routes
│   │   ├── database/           # Migrations, seeds
│   │   ├── utils/              # Logger, parsers
│   │   ├── config/             # Configuration
│   │   └── server.ts
│   ├── tests/
│   ├── uploads/                # File storage
│   ├── logs/                   # App logs
│   ├── Dockerfile
│   └── package.json
│
├── common/                      # Shared code
│   ├── types/                  # Shared types
│   └── constants/
│
├── docs/                        # Documentation
│   ├── plans/                  # This file
│   └── api/
│
├── docker-compose.yml
├── .github/workflows/
├── CLAUDE.md
└── README.md
```

---

## Success Criteria

### Functional Requirements
✓ Upload .docx documents
✓ AI placeholder extraction
✓ Conversational filling interface
✓ Document download
✓ Data room with entity extraction
✓ Auto-population from data room

### Competitive Advantages
✓ Multi-document intelligence
✓ Natural language search
✓ Document health score
✓ Smart templates library
✓ Conflict checker

### Quality Requirements
✓ Production-ready code quality
✓ Comprehensive testing (80%+ coverage)
✓ Professional UI/UX
✓ Docker deployment
✓ Public URL accessible
✓ Secure authentication

### Timeline
✓ 1 week to production

---

## Next Steps

1. **Create Implementation Plan** - Break down into tasks
2. **Setup Git Worktree** - Isolated development workspace
3. **Begin Implementation** - Start with core infrastructure
4. **Iterative Development** - Feature by feature with testing
5. **Deploy to Production** - Docker Compose on DigitalOcean
6. **Submit Application** - Link to hosted app + repo

---

**Document Status**: Complete and Validated
**Ready for Implementation**: Yes
