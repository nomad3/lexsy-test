# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🎯 Current Implementation Status

**✅ COMPLETED:**
- Monorepo structure with npm workspaces (frontend/backend/common)
- PostgreSQL database with Knex.js migrations (19 tables)
- All 11 AI agents implemented and operational
- 6 backend services (Document, AIAgent, Conversation, DataRoom, KnowledgeGraph, Analytics)
- Authentication system (JWT, bcrypt, sessions)
- Express API server with CORS, logging, error handling
- 2 API controllers (auth, documents) with routes
- DOCX file parsing and upload handling
- Database seed with demo user
- Frontend application (React + Vite + Tailwind + shadcn/ui)
- Frontend API integration (Axios + React Query)
- Frontend pages (Dashboard, Documents, Conversation, DataRoom)

**⚠️ NOT YET IMPLEMENTED:**
- Additional API endpoints (conversation, data room, analytics) - *Partially implemented*
- Docker Compose configuration - *Implemented*
- Testing infrastructure (Jest, Vitest, Playwright)

**📊 Progress: ~90% Backend Complete | ~80% Frontend Complete**

---

## Project Overview

**Lexsy** is an AI-first legal document automation platform that helps lawyers fill legal documents through intelligent placeholder detection, conversational filling, and cross-document intelligence.

**Key Technologies:**
- Frontend: React 18 + TypeScript + Vite
- Backend: Express + TypeScript
- Database: PostgreSQL
- AI: OpenAI GPT-4 (multi-agent system)
- Deployment: Docker Compose
- UI: Tailwind CSS + shadcn/ui

**Architecture**: Monorepo with clean separation between `/frontend`, `/backend`, and `/common` (shared types)

---

## Development Commands

### Initial Setup
```bash
npm install                           # Install all dependencies
cp backend/.env.example backend/.env  # Setup backend environment
# Edit backend/.env with your OPENAI_API_KEY and database credentials

# Start PostgreSQL (using Docker)
docker run -d --name lexsy-postgres \
  -e POSTGRES_USER=lexsy_user \
  -e POSTGRES_PASSWORD=lexsy_password \
  -e POSTGRES_DB=lexsy \
  -p 5432:5432 \
  postgres:16-alpine

# Run migrations and seed
cd backend
npm run migrate:latest
npm run seed
```

### Running the Application

**Development Mode (Local):**
```bash
# Backend only (currently implemented)
cd backend
npm run dev                # Backend: http://localhost:5000

# Test API health check
curl http://localhost:5000/health

# Frontend not yet implemented
```

**Development Mode (Docker):**
```bash
docker-compose -f docker-compose.dev.yml up -d  # Start all services
docker-compose logs -f backend                   # View backend logs
docker-compose down                              # Stop all services
```

**Production Mode:**
```bash
npm run build              # Build both frontend and backend
docker-compose up -d       # Start production containers
```

### Database Operations

```bash
# Backend directory
cd backend
npm run migrate            # Run database migrations
npm run seed               # Seed database with templates and test data
npm run migrate:rollback   # Rollback last migration
```

### Testing

**Run All Tests:**
```bash
npm test                   # Run all tests (frontend + backend)
```

**Frontend Tests:**
```bash
cd frontend
npm run test               # Run Vitest unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run Playwright E2E tests
npm run test:e2e:ui        # Run Playwright with UI
```

**Backend Tests:**
```bash
cd backend
npm run test               # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report
```

**Single Test File:**
```bash
# Frontend
npm test -- src/components/DocumentUpload.test.tsx

# Backend
npm test -- src/services/DocumentService.test.ts
```

### Code Quality

```bash
npm run lint               # Lint all code (ESLint)
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format all code (Prettier)
npm run typecheck          # TypeScript type checking (both apps)
```

### Docker Commands

```bash
docker-compose up -d                          # Start all containers
docker-compose down                            # Stop all containers
docker-compose logs -f [service]               # Follow logs
docker-compose exec backend npm run migrate    # Run migration in container
docker-compose exec backend npm run seed       # Seed DB in container
docker-compose restart backend                 # Restart service
docker-compose build --no-cache               # Rebuild images
```

---

## Architecture Overview

### Multi-Agent AI System

This is an **AI-FIRST** application. All document processing, analysis, and intelligence features are powered by a multi-agent system using OpenAI GPT-4.

**11 Specialized AI Agents (ALL IMPLEMENTED ✓):**

1. **DocumentAnalyzer** ✓ - Document triage and classification
2. **PlaceholderExtractor** ✓ - Field identification and typing
3. **EntityMatcher** ✓ - Knowledge graph matching
4. **ConversationalAssistant** ✓ - User interaction and guidance
5. **ComplianceValidator** ✓ - Format validation and error checking
6. **InsightsEngine** ✓ - Pattern analysis and learning
7. **MultiDocIntelligence** ✓ - Cross-document relationship mapping
8. **NLSearchAgent** ✓ - Natural language to SQL conversion
9. **HealthScoreCalculator** ✓ - Document scoring and validation
10. **TemplateAnalyzer** ✓ - Template preprocessing
11. **ConflictDetector** ✓ - Consistency checking across documents

**Agent Location**: `/backend/src/agents/`

**Base Agent Pattern**: All agents extend `BaseAgent.ts` which provides:
- Consistent OpenAI API interaction
- Task logging to `ai_tasks` table
- Retry logic with exponential backoff
- Error handling and fallbacks
- Token usage tracking

### Core Data Flow

**Document Upload Flow:**
```
User uploads .docx → DocumentAnalyzer → PlaceholderExtractor → Ready for filling
```

**Conversational Filling Flow:**
```
User starts conversation → ConversationalAssistant generates questions →
EntityMatcher suggests values from data room → User provides answers →
Values stored → HealthScoreCalculator evaluates → Document completed
```

**Data Room Intelligence Flow:**
```
User uploads company doc → TemplateAnalyzer extracts entities →
Knowledge graph updated → Available for auto-suggestions
```

**Multi-Document Intelligence Flow:**
```
Value changed in document A → MultiDocIntelligence detects related docs →
Suggests updates to documents B, C → User accepts/rejects → Values synced
```

### Directory Organization

**Frontend (`/frontend/src/`)** - ⚠️ NOT YET IMPLEMENTED:
- `components/` - Directory structure exists but minimal code
- `pages/` - Placeholder directories
- `services/` - Placeholder directories
- `stores/` - Placeholder directories
- `hooks/` - Placeholder directories
- `utils/` - Placeholder directories
- `types/` - Placeholder directories

**Note:** Frontend implementation is the next major phase. Backend API is ready to integrate.

**Backend (`/backend/src/`)** - ✓ IMPLEMENTED:
- `controllers/` ✓ - Express route handlers
  - `authController.ts` - Registration and login
  - `documentController.ts` - Document upload, analysis, placeholder extraction
- `services/` ✓ - Business logic (6 services implemented)
  - `DocumentService.ts` ✓ - Document CRUD and file operations
  - `AIAgentService.ts` ✓ - Agent orchestration and task queue
  - `ConversationService.ts` ✓ - Dialogue state management
  - `DataRoomService.ts` ✓ - Data room processing
  - `KnowledgeGraphService.ts` ✓ - Entity relationship management
  - `AnalyticsService.ts` ✓ - Business intelligence generation
- `agents/` ✓ - AI agent implementations (ALL 11 agents implemented)
- `middleware/` ✓ - Express middleware (auth, validation, errors)
- `routes/` ✓ - API route definitions (auth, documents)
- `database/` ✓ - Knex.js migrations and seeds
- `utils/` ✓ - Logger (Winston), DOCX parser
- `config/` ✓ - Configuration files (app, database, OpenAI)

**Common (`/common/`):**
- `types/` - Shared TypeScript types between frontend and backend
  - `Document.ts`, `Placeholder.ts`, `Agent.ts`, `User.ts`
- `constants/` - Shared constants and enums

### Database Schema Highlights

**AI Infrastructure Tables:**
- `ai_agents` - Agent metadata and configuration
- `ai_tasks` - Task execution log (all I/O logged)
- `ai_insights` - Generated insights and patterns
- `ai_training_data` - User corrections for learning loop

**Core Tables:**
- `documents` - Document metadata, status, AI scores
- `placeholders` - Extracted fields with AI suggestions
- `document_templates` - Pre-analyzed templates
- `data_room_documents` - Company document uploads
- `knowledge_graph` - Extracted entities and relationships

**Advanced Features:**
- `document_relationships` - Cross-document links
- `cross_document_updates` - Sync suggestions
- `health_checks` - Document health scores (0-100)
- `conflicts` - Inconsistency detection
- `search_queries` - Natural language search log

**Auth Tables:**
- `users` - User accounts (bcrypt hashed passwords)
- `sessions` - JWT token management

**Multi-Tenancy**: All queries filtered by `user_id` or `organization`

---

## Key Implementation Patterns

### API Structure

**Controller → Service → Agent Pattern:**
```typescript
// Controller (thin)
export const analyzeDocument = async (req, res) => {
  const result = await DocumentService.analyzeDocument(req.params.id, req.user.id);
  res.json(result);
};

// Service (business logic)
class DocumentService {
  async analyzeDocument(documentId: string, userId: string) {
    const doc = await this.getDocument(documentId, userId);
    const task = await AIAgentService.runAgent('DocumentAnalyzer', { documentId });
    return task.output;
  }
}

// Agent (AI interaction)
class DocumentAnalyzer extends BaseAgent {
  async execute(input: { documentId: string }) {
    const prompt = this.buildPrompt(input);
    const result = await this.callOpenAI(prompt);
    return this.parseResponse(result);
  }
}
```

### Error Handling

**Always use structured error responses:**
```typescript
{
  success: false,
  error: {
    code: "DOCUMENT_PROCESSING_FAILED",
    message: "Human-readable message",
    details: {},
    timestamp: "ISO-8601",
    requestId: "uuid"
  }
}
```

**Frontend error handling:**
- Axios interceptor catches all API errors
- Toast notifications for user-facing errors
- Error boundaries for React component failures
- Retry logic for AI timeouts

### Authentication & Authorization

**Middleware Chain:**
```
Request → authenticate → authorize(['lawyer', 'admin']) → route handler
```

**JWT Implementation:**
- HttpOnly cookies for web
- Bearer token for API clients
- 24-hour expiration with refresh token support
- Rate limiting: 5 login attempts per 15 minutes

**Data Isolation:**
```typescript
// Always filter by user or organization
const documents = await db.query(
  'SELECT * FROM documents WHERE user_id = $1 OR organization = $2',
  [userId, userOrganization]
);
```

### AI Agent Best Practices

**1. Always Log Tasks:**
```typescript
const task = await this.createTask({
  agent_id: this.id,
  task_type: 'extract_placeholders',
  input_data: input,
  status: 'processing'
});

try {
  const result = await this.executeAICall(input);
  await this.completeTask(task.id, result);
} catch (error) {
  await this.failTask(task.id, error);
}
```

**2. Implement Retry Logic:**
```typescript
const result = await this.retryWithBackoff(
  () => openai.chat.completions.create(...),
  { maxRetries: 3, initialDelay: 1000 }
);
```

**3. Track Costs:**
```typescript
await this.logTokenUsage(task.id, {
  tokens_used: result.usage.total_tokens,
  cost: calculateCost(result.usage, model)
});
```

**4. Structured Prompts:**
```typescript
const systemPrompt = `You are a legal document analyzer...`;
const userPrompt = `Extract all placeholders from this document:\n\n${documentText}\n\nRespond with JSON: { "placeholders": [...] }`;
```

### State Management (Frontend)

**Zustand for Client State:**
```typescript
// stores/authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null })
}));
```

**React Query for Server State:**
```typescript
// hooks/useDocuments.ts
export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsAPI.getAll()
  });
};
```

---

## Competitive Advantage Features

When working on these features, prioritize quality and "wow factor":

1. **Multi-Document Intelligence** - Cross-document value synchronization
   - Location: `MultiDocIntelligence` agent, `document_relationships` table
   - UI: "Also update 3 other documents?" prompts

2. **Natural Language Search** - Query in plain English
   - Location: `NLSearchAgent`, `/api/search/query` endpoint
   - Example: "Show me all SAFEs for TechCo with cap over $10M"

3. **Document Health Score** - Real-time 0-100 scoring
   - Location: `HealthScoreCalculator` agent, `health_checks` table
   - UI: Big circular score widget (color-coded)

4. **Smart Templates Library** - Pre-analyzed documents
   - Location: `document_templates` table, `/api/templates` endpoints
   - UI: Template gallery on dashboard

5. **Conflict Checker** - Consistency validation
   - Location: `ConflictDetector` agent, `conflicts` table
   - UI: Warning badges with severity indicators

---

## Testing Guidelines

### Unit Test Requirements
- All services must have 85%+ coverage
- All agents must have mocked OpenAI tests
- All React components must have rendering tests
- Use descriptive test names: `it('should extract placeholders from SAFE document')`

### Integration Test Requirements
- All API endpoints tested with test database
- Use `beforeEach` to reset DB state
- Test auth middleware on protected routes
- Validate error responses

### E2E Test Critical Paths
1. Complete document flow (upload → fill → download)
2. Data room intelligence (upload → extract → auto-suggest)
3. Multi-document synchronization
4. Natural language search
5. Template usage

### Mock AI Responses
```typescript
jest.mock('openai', () => ({
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'mocked response' } }],
        usage: { total_tokens: 100 }
      })
    }
  }
}));
```

---

## Security Best Practices

### Input Validation
- Validate all user inputs with Zod schemas
- Sanitize HTML to prevent XSS
- Validate file types and sizes before processing
- Use parameterized queries (prevent SQL injection)

### File Upload Security
```typescript
const allowedMimeTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new ValidationError('Only .docx files allowed');
}
```

### Environment Variables
- NEVER commit `.env` files
- Use `.env.example` as template
- Validate required env vars on startup:
```typescript
const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY', 'JWT_SECRET'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
});
```

### Rate Limiting
```typescript
// 100 requests per 15 minutes per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Stricter for auth endpoints
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
}));
```

---

## Deployment Notes

### Environment-Specific Configs

**Development:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Database: Local PostgreSQL
- Hot reload enabled
- Detailed logging (DEBUG level)

**Production:**
- Frontend: Nginx-served static build
- Backend: Port 5000 (internal)
- Database: PostgreSQL container with persistent volume
- Nginx reverse proxy on ports 80/443
- SSL via Certbot (Let's Encrypt)
- Logging: INFO level only

### Docker Compose Services

```yaml
services:
  frontend:   # nginx:alpine serving static build
  backend:    # node:20-alpine running Express
  database:   # postgres:16-alpine
  nginx:      # nginx:alpine reverse proxy
```

### Health Checks

**Backend Health Endpoint:**
```typescript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: await checkDatabaseConnection(),
    openai: await checkOpenAIConnection()
  });
});
```

### Migrations on Deployment

Migrations run automatically on container startup:
```typescript
// server.ts
await runMigrations();
app.listen(PORT);
```

---

## Troubleshooting

### Common Issues

**"OpenAI API Error: Rate limit exceeded"**
- Check token usage in `ai_tasks` table
- Implement request queuing
- Consider GPT-3.5-turbo fallback for non-critical tasks

**"Database connection failed"**
- Verify `DATABASE_URL` in `.env`
- Check if PostgreSQL container is running: `docker-compose ps`
- Check connection in container: `docker-compose exec backend npm run db:test`

**"Frontend can't reach backend"**
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running on correct port
- Check CORS configuration in backend

**"File upload fails"**
- Check `FILE_UPLOAD_PATH` exists and is writable
- Verify file size limits (default 10MB)
- Check disk space on server

**"Tests failing with DB errors"**
- Ensure test database exists
- Run migrations on test DB: `NODE_ENV=test npm run migrate`
- Check test DB is isolated from dev/prod

---

## Contributing Guidelines

### Branch Naming
- Features: `feature/multi-doc-intelligence`
- Bugs: `fix/placeholder-extraction-error`
- Docs: `docs/update-api-documentation`

### Commit Messages
Use conventional commits:
- `feat: add natural language search endpoint`
- `fix: resolve duplicate placeholder detection`
- `docs: update deployment instructions`
- `test: add health score calculator tests`
- `refactor: extract common agent logic to base class`

### Pull Request Process
1. Create feature branch from `main`
2. Write code + tests
3. Run `npm run lint && npm run test`
4. Push and create PR
5. CI must pass (linting, tests, build)
6. Request review
7. Squash and merge to `main`

### Code Review Checklist
- [ ] Tests added/updated
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] No secrets in code

---

## Performance Optimization

### Frontend Performance
- Code splitting with React.lazy()
- Virtualized lists for large datasets (react-window)
- Debounce search inputs
- Optimize images (WebP format)
- Use React.memo for expensive components

### Backend Performance
- Database query optimization (use EXPLAIN ANALYZE)
- Add indexes on frequently queried columns
- Batch AI agent tasks when possible
- Implement caching for data room entities (Redis future)
- Connection pooling for PostgreSQL

### AI Cost Optimization
- Use GPT-3.5-turbo for simple tasks
- Cache common AI responses
- Batch similar requests
- Implement token usage budgets per user
- Monitor cost trends in `ai_tasks` table

---

## Design System (Frontend)

### Tailwind + shadcn/ui

**Colors:**
- Primary: Purple/Blue gradients
- Success: Green
- Warning: Yellow
- Error: Red
- Neutral: Gray scale

**Components:**
- Use shadcn/ui components from `/components/ui/`
- Customize with Tailwind classes
- Dark mode support (toggle in header)

**Layout:**
- Responsive mobile-first design
- Grid system: 12-column
- Spacing: 4px increments (Tailwind default)

**Typography:**
- Headings: Inter (bold)
- Body: Inter (regular)
- Code: JetBrains Mono

**Animations:**
- Framer Motion for complex animations
- Tailwind transitions for hover/focus states
- Smooth 200ms default timing

---

## Future Enhancements

Features planned but not in MVP:

1. **Version History** - Track document changes with AI summaries
2. **Collaboration** - Real-time multi-user editing with WebSockets
3. **Smart Redlining** - AI-explained document comparisons
4. **Email Integration** - Forward docs to `upload@domain.com`
5. **Mobile App** - React Native version
6. **Advanced Analytics** - More BI dashboards
7. **SSO Integration** - Google, Microsoft auth
8. **Audit Trail** - Comprehensive compliance logging
9. **Document Export** - PDF conversion and signing
10. **API for Partners** - RESTful API for integrations

---

## Support

### Documentation
- Full design doc: `/docs/plans/2025-01-18-legal-doc-automation-design.md`
- API documentation: (Generate with Swagger/OpenAPI - future)
- Architecture diagrams: `/docs/architecture/` (future)

### Demo Credentials
- Email: `demo@lexsy.com`
- Password: `Demo123!`
- Role: Lawyer (full access)

### Useful Links
- OpenAI API Docs: https://platform.openai.com/docs
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Zustand: https://zustand-demo.pmnd.rs
- React Query: https://tanstack.com/query

---

**Last Updated**: 2025-11-18
**Design Status**: Complete and validated
**Implementation Status**: Backend core complete (11 AI agents, 6 services, auth, migrations, API endpoints)
