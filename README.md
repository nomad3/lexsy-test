# Lexsy - AI-Powered Legal Document Automation Platform

<div align="center">

![Lexsy Logo](https://via.placeholder.com/150x150?text=LEXSY)

**Intelligent Legal Document Processing | AI-First Architecture | Multi-Agent System**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-key-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [AI Agents](#-ai-agents)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Lexsy** is a next-generation legal document automation platform that leverages artificial intelligence to streamline the document creation and filling process for legal professionals. Unlike traditional template-based systems, Lexsy uses a sophisticated multi-agent AI architecture to intelligently understand, process, and complete legal documents.

### The Problem

Legal professionals spend countless hours:
- Manually filling repetitive document templates
- Ensuring consistency across related documents
- Searching through past documents for relevant information
- Validating document completeness and compliance
- Managing relationships between multiple legal documents

### The Solution

Lexsy provides:
- **Intelligent Placeholder Detection**: AI automatically identifies fillable fields
- **Conversational Document Filling**: Natural dialogue-based completion
- **Cross-Document Intelligence**: Automatic value synchronization across related documents
- **Knowledge Graph**: Reusable entity database from past documents
- **Compliance Validation**: AI-powered document health scoring
- **Natural Language Search**: Find documents using plain English queries

---

## ✨ Key Features

### 🤖 Multi-Agent AI System

11 specialized AI agents work together to provide comprehensive document intelligence:

| Agent | Purpose | Status |
|-------|---------|--------|
| **DocumentAnalyzer** | Document classification and metadata extraction | ✅ Implemented |
| **PlaceholderExtractor** | Intelligent field identification and typing | ✅ Implemented |
| **EntityMatcher** | Knowledge graph entity matching | ✅ Implemented |
| **ConversationalAssistant** | Natural dialogue for document filling | ✅ Implemented |
| **ComplianceValidator** | Format and completeness validation | ✅ Implemented |
| **HealthScoreCalculator** | Document quality scoring (0-100) | ✅ Implemented |
| **TemplateAnalyzer** | Template structure analysis | ✅ Implemented |
| **ConflictDetector** | Consistency checking | ✅ Implemented |
| **MultiDocIntelligence** | Cross-document relationship mapping | ✅ Implemented |
| **NLSearchAgent** | Natural language to SQL conversion | ✅ Implemented |
| **InsightsEngine** | Business intelligence generation | ✅ Implemented |

### 📊 Core Capabilities

- **Smart Document Upload**: Upload .docx files with automatic analysis
- **AI-Powered Placeholder Detection**: Automatically identifies all fillable fields
- **Conversational Filling**: Chat-based interface for completing documents
- **Data Room Integration**: Upload company documents to build knowledge base
- **Automatic Value Suggestions**: AI suggests values from past documents
- **Document Health Scores**: Real-time 0-100 scoring for completeness and compliance
- **Cross-Document Sync**: Changes in one document suggest updates in related docs
- **Natural Language Search**: "Show me all SAFEs for TechCo with cap over $10M"
- **Business Analytics**: AI-generated insights from document patterns

### 🎯 Competitive Advantages

1. **Multi-Document Intelligence**: Automatic relationship detection and synchronization
2. **Knowledge Graph**: Learns from every document to improve suggestions
3. **Conversational UX**: Natural dialogue instead of forms
4. **AI-First Architecture**: Every feature powered by specialized AI
5. **Document Health Scoring**: Instant quality assessment

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 16
- **ORM**: Knex.js (migrations & query builder)
- **AI**: OpenAI GPT-4 Turbo
- **Authentication**: JWT + bcrypt
- **File Processing**: Mammoth (DOCX parsing)
- **Logging**: Winston
- **Validation**: Zod

### Frontend (Planned)
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Server State**: React Query
- **UI Library**: shadcn/ui + Tailwind CSS
- **Routing**: React Router 6

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL (Docker)
- **Development**: nodemon, ts-node
- **Version Control**: Git

---

## 🏗 Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React + TypeScript + Vite) - NOT YET IMPLEMENTED           │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                    Express API Server                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │  Middleware  │  │    Routes    │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────┐       │
│  │              Business Services                   │       │
│  │  • DocumentService    • ConversationService      │       │
│  │  • DataRoomService    • KnowledgeGraphService    │       │
│  │  • AnalyticsService   • AIAgentService           │       │
│  └──────┬──────────────────────────────────────────┘       │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────┐       │
│  │           Multi-Agent AI System                  │       │
│  │  11 Specialized GPT-4 Agents                     │       │
│  └──────┬──────────────────────────────────────────┘       │
└─────────┼────────────────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────┐
│              PostgreSQL Database (19 Tables)              │
│  Documents • Placeholders • AI Tasks • Knowledge Graph    │
└───────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
lexsy/
├── backend/           # Express API server
│   ├── src/
│   │   ├── agents/    # 11 AI agents
│   │   ├── config/    # Configuration files
│   │   ├── controllers/ # Route handlers
│   │   ├── database/  # Migrations & seeds
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helpers
│   └── package.json
│
├── frontend/          # React application (planned)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── stores/
│   └── package.json
│
├── common/            # Shared TypeScript types
│   ├── types/
│   └── constants/
│
└── docs/              # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x or higher
- **Docker**: Latest version (for PostgreSQL)
- **OpenAI API Key**: Get one at [platform.openai.com](https://platform.openai.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/lexsy.git
cd lexsy

# 2. Install dependencies
npm install

# 3. Start PostgreSQL database
docker run -d \
  --name lexsy-postgres \
  -e POSTGRES_USER=lexsy_user \
  -e POSTGRES_PASSWORD=lexsy_password \
  -e POSTGRES_DB=lexsy \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your OPENAI_API_KEY

# 5. Run database migrations
cd backend
npm run migrate:latest

# 6. Seed database with demo data
npm run seed

# 7. Start development server
npm run dev
```

The backend API will be available at **http://localhost:5000**

### Verify Installation

```bash
# Test health check
curl http://localhost:5000/health

# Expected response:
# {"success":true,"data":{"status":"healthy","timestamp":"...","environment":"development"}}

# Test demo user login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@lexsy.com","password":"Demo123!"}'
```

---

## 💻 Development

### Running the Application

```bash
# Start backend development server (with hot reload)
cd backend
npm run dev

# Run TypeScript type checking
npm run typecheck

# Run linter
npm run lint

# Format code
npm run format
```

### Database Management

```bash
# Run migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:rollback

# Check migration status
npm run migrate:status

# Create new migration
npm run migrate:make migration_name

# Seed database
npm run seed
```

### Environment Variables

Create `backend/.env` with:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://lexsy_user:lexsy_password@localhost:5432/lexsy

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# File Upload
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "lawyer",
  "organization": "Law Firm LLC"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "lawyer"
    },
    "token": "jwt-token-here"
  }
}
```

### Documents

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: document.docx
```

#### Get Documents
```http
GET /api/documents
Authorization: Bearer {token}
```

#### Analyze Document
```http
POST /api/documents/:id/analyze
Authorization: Bearer {token}
```

#### Extract Placeholders
```http
POST /api/documents/:id/extract-placeholders
Authorization: Bearer {token}
```

For complete API documentation, see [docs/API.md](docs/API.md)

---

## 🗄 Database Schema

### Core Tables

**Documents Table:**
- Stores uploaded legal documents
- Tracks status (uploaded → analyzing → ready → filling → completed)
- Includes AI-generated metadata and health scores

**Placeholders Table:**
- Extracted fillable fields from documents
- Field types, positions, and AI suggestions
- Validation status and confidence scores

**AI Agents Table:**
- Configuration for 11 AI agents
- System prompts and model settings
- Active/inactive status

**AI Tasks Table:**
- Complete audit log of all AI operations
- Input/output data, token usage, costs
- Performance metrics

**Knowledge Graph Table:**
- Extracted entities from all documents
- Entity relationships and confidence scores
- Usage statistics for better suggestions

**19 Total Tables** - See [docs/DATABASE.md](docs/DATABASE.md) for complete schema

---

## 🤖 AI Agents

### Agent Architecture

All agents extend `BaseAgent` class which provides:
- OpenAI API integration with retry logic
- Task logging to database
- Token usage tracking
- Error handling and fallbacks
- Response validation

### Agent Configurations

| Agent | Model | Temperature | Max Tokens | Purpose |
|-------|-------|-------------|------------|---------|
| DocumentAnalyzer | GPT-4 Turbo | 0.3 | 1500 | Low temp for consistent classification |
| PlaceholderExtractor | GPT-4 Turbo | 0.2 | 2000 | Very low for accurate extraction |
| ConversationalAssistant | GPT-4 Turbo | 0.7 | 300 | Higher for natural conversation |
| ComplianceValidator | GPT-4 Turbo | 0.2 | 1500 | Low for consistent validation |
| HealthScoreCalculator | GPT-4 Turbo | 0.1 | 800 | Minimal for reproducible scoring |

See [docs/AI_AGENTS.md](docs/AI_AGENTS.md) for detailed agent documentation

---

## 📁 Project Structure

```
backend/src/
├── agents/              # AI Agent Implementations
│   ├── BaseAgent.ts             # Abstract base class
│   ├── DocumentAnalyzer.ts      # Document classification
│   ├── PlaceholderExtractor.ts  # Field extraction
│   ├── EntityMatcher.ts         # Knowledge graph matching
│   ├── ConversationalAssistant.ts
│   ├── ComplianceValidator.ts
│   ├── HealthScoreCalculator.ts
│   ├── TemplateAnalyzer.ts
│   ├── ConflictDetector.ts
│   ├── MultiDocIntelligence.ts
│   ├── NLSearchAgent.ts
│   ├── InsightsEngine.ts
│   └── index.ts
│
├── services/            # Business Logic Layer
│   ├── DocumentService.ts       # Document CRUD
│   ├── AIAgentService.ts        # Agent orchestration
│   ├── ConversationService.ts   # Dialogue management
│   ├── DataRoomService.ts       # Knowledge base
│   ├── KnowledgeGraphService.ts # Entity management
│   ├── AnalyticsService.ts      # Business intelligence
│   └── index.ts
│
├── controllers/         # HTTP Request Handlers
│   ├── authController.ts
│   └── documentController.ts
│
├── routes/              # API Route Definitions
│   ├── auth.routes.ts
│   └── documents.routes.ts
│
├── middleware/          # Express Middleware
│   ├── authenticate.ts          # JWT verification
│   ├── authorize.ts             # Role-based access
│   └── errorHandler.ts          # Global error handling
│
├── config/              # Configuration
│   ├── app.ts                   # App config
│   ├── database.ts              # DB connection (legacy)
│   ├── knex.ts                  # Knex instance
│   └── openai.ts                # OpenAI config
│
├── database/            # Database Files
│   ├── migrations/              # Knex migrations
│   ├── seeds/                   # Database seeds
│   └── schema.sql               # Reference schema
│
├── utils/               # Utility Functions
│   ├── logger.ts                # Winston logger
│   └── docxParser.ts            # DOCX file parsing
│
└── server.ts            # Express app entry point
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend tests (when implemented)
cd frontend
npm test
npm run test:e2e
```

### Test Coverage Goals

- **Unit Tests**: 85%+ coverage for services and utilities
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment-Specific Configuration

**Development:**
- Local PostgreSQL or Docker
- Hot reload enabled
- Detailed logging (DEBUG level)

**Production:**
- PostgreSQL container with persistent volumes
- Nginx reverse proxy
- SSL/TLS with Let's Encrypt
- Minimal logging (INFO level)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment guide

---

## 🎯 Implementation Status

### ✅ Completed (Backend ~60%)

- [x] Monorepo structure with npm workspaces
- [x] PostgreSQL database with 19 tables
- [x] All 11 AI agents implemented (2,347 LOC)
- [x] 6 backend services (1,508 LOC)
- [x] Authentication system (JWT + bcrypt)
- [x] Express API server with middleware
- [x] 2 API controllers (auth, documents)
- [x] Database migrations and seeds
- [x] DOCX file parsing
- [x] Comprehensive logging

### 🚧 In Progress

- [ ] Additional API endpoints (conversation, analytics, data room)
- [ ] Frontend React application
- [ ] Docker Compose configuration
- [ ] Testing infrastructure
- [ ] CI/CD pipeline

### 📋 Planned Features

- [ ] Real-time WebSocket updates
- [ ] Email notifications
- [ ] Document version history
- [ ] Multi-user collaboration
- [ ] SSO integration (Google, Microsoft)
- [ ] Mobile app (React Native)
- [ ] API rate limiting enhancements
- [ ] Advanced caching (Redis)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use conventional commits
- Write tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **AI Agents**: 11 specialized GPT-4 agents
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/lexsy/issues)
- **Email**: support@lexsy.com
- **Demo**: demo@lexsy.com / Demo123!

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- The TypeScript and Node.js communities
- All contributors and supporters

---

<div align="center">

**Built with ❤️ using AI-first principles**

[⬆ Back to Top](#lexsy---ai-powered-legal-document-automation-platform)

</div>
