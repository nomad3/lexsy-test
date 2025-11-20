# Lexsy - AI-Powered Legal Document Automation Platform

<div align="center">

**Intelligent Legal Document Processing | AI-First Architecture | Multi-Agent System**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-key-features) • [Quick Start](#-quick-start) • [Demo](#-demo) • [Architecture](#-architecture) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Demo](#-demo)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [User Flows](#-user-flows)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [AI Agents](#-ai-agents)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)

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
- **Conversational Document Filling**: Natural dialogue-based completion with contextual examples
- **Cross-Document Intelligence**: Automatic value synchronization across related documents
- **Knowledge Graph**: Reusable entity database from past documents
- **Compliance Validation**: AI-powered document health scoring
- **Real-Time Progress Tracking**: Live completion percentage updates

---

## 🎬 Demo

### Application Screenshots

#### Landing Page
![Landing Page](docs/screenshots/landing_page_1763645474416.png)
*Clean, modern landing page with clear value proposition*

#### Login Page
![Login Page](docs/screenshots/login_page_1763645496591.png)
*Secure authentication with JWT tokens*

### Video Demonstrations

#### Full Application Flow
![Full Application Tour](docs/videos/full_app_test_1763658658058.webp)
*Complete tour of the dashboard, document management, and data room features*

#### AI Conversation Feature
![AI-Powered Document Filling](docs/videos/test_conversation_fixed_1763658193899.webp)
*Natural dialogue flow with contextual examples and real-time progress tracking*

#### Data Room Management
![Data Room Upload & Management](docs/videos/verify_dataroom_fixed_1763656284264.webp)
*Uploading company documents and building the knowledge graph*

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

- ✅ **Smart Document Upload**: Upload .docx files with automatic analysis
- ✅ **AI-Powered Placeholder Detection**: Automatically identifies all fillable fields
- ✅ **Conversational Filling**: Chat-based interface with contextual examples
- ✅ **Data Room Integration**: Upload company documents to build knowledge base
- ✅ **Automatic Value Suggestions**: AI suggests values from past documents
- ✅ **Real-Time Progress Tracking**: Live completion percentage updates (refreshes every 2s)
- ✅ **Document Health Scores**: Real-time 0-100 scoring for completeness
- ✅ **Toast Notifications**: User-friendly feedback system
- ✅ **Responsive UI**: Modern, accessible interface with loading states

### 🎯 Competitive Advantages

1. **Contextual AI Guidance**: Provides relevant examples based on field types
   - Company names: "Acme Corporation", "TechStart Inc."
   - Person names: "John Smith", "Jane Doe"
   - Dates: "2025-01-15", "December 31, 2025"
   - And more...

2. **Real-Time Updates**: Completion percentage updates automatically as you fill fields

3. **Knowledge Graph**: Learns from every document to improve suggestions

4. **Conversational UX**: Natural dialogue instead of forms

5. **Multi-Document Intelligence**: Automatic relationship detection

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 16
- **ORM**: Knex.js
- **AI**: OpenAI GPT-4
- **Authentication**: JWT
- **Validation**: Zod
- **File Processing**: Mammoth (DOCX parsing)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **UI Components**: Custom components + shadcn/ui patterns
- **Styling**: Tailwind CSS
- **Notifications**: Custom Toast system

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Knex.js migrations
- **Environment**: .env configuration
- **Logging**: Winston

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lexsy-test.git
cd lexsy-test
```

2. **Set up the database**
```bash
# Create PostgreSQL database
createdb lexsy_test

# Or using psql
psql -U postgres -c "CREATE DATABASE lexsy_test;"
```

3. **Configure environment variables**

Backend (`.env` in `/backend`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lexsy_test
JWT_SECRET=your_jwt_secret_key_change_in_production
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=http://localhost:5173,http://localhost:5174
FILE_UPLOAD_PATH=./uploads
```

Frontend (`.env` in `/frontend`):
```env
VITE_API_URL=http://localhost:5000
```

4. **Install dependencies and run migrations**
```bash
# Backend
cd backend
npm install
npm run migrate:latest
npm run seed

# Frontend (in a new terminal)
cd frontend
npm install
```

5. **Start the development servers**
```bash
# Backend (from /backend directory)
npm run dev

# Frontend (from /frontend directory, in a new terminal)
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173 (or 5174 if 5173 is in use)
- Backend API: http://localhost:5000
- Demo credentials: `demo@lexsy.com` / `Demo123!`

---

## 👥 User Flows

### 1. Document Upload & Analysis

```
User uploads .docx → AI analyzes document → Placeholders extracted → Ready for filling
```

**Features:**
- Automatic document type detection
- Placeholder extraction with field typing
- Initial health score calculation

### 2. Conversational Document Filling

```
Click "Fill with AI Chat" → AI starts conversation → User provides values → Real-time progress updates → Completion
```

**Example Conversation:**
```
AI: Hi! I'll help you fill out this Non-Disclosure Agreement. I found 3 fields to complete.

Let's start with: Disclosing Party
Examples: "John Smith", "Jane Doe", "Robert Johnson"

What value should we use?

User: Acme Corporation

AI: Great! I've recorded "Acme Corporation" for Disclosing Party.

Now, let's fill in: Recipient
Examples: "John Smith", "Jane Doe", "Robert Johnson"

What value should we use?
```

**Features:**
- Contextual examples based on field names
- Real-time completion percentage updates (every 2 seconds)
- Progress bar visualization
- Automatic redirect on completion

### 3. Data Room Management

```
Upload company documents → AI extracts entities → Knowledge graph built → Auto-suggestions enabled
```

**Features:**
- Company name and document type categorization
- Entity extraction and storage
- Usage statistics (documents, entities, suggestions)
- Real-time stats updates

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Documents │  │Data Room │  │  Chat    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                         │                                     │
│                    Axios + React Query                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
                    REST API (Express)
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    Backend (Node.js)                         │
│  ┌──────────────────────┴────────────────────────────────┐  │
│  │              Controllers & Routes                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐ │  │
│  │  │Documents│  │  Data   │  │Conversation│ │Analytics│ │  │
│  │  └─────────┘  │  Room   │  └──────────┘  └────────┘ │  │
│  │               └─────────┘                             │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────┴──────────────────────────────────┐  │
│  │                  Services Layer                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ Document     │  │ Conversation │  │  AI Agent   │ │  │
│  │  │ Service      │  │  Service     │  │  Service    │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────┴──────────────────────────────────┐  │
│  │              11 Specialized AI Agents                  │  │
│  │  DocumentAnalyzer │ PlaceholderExtractor │ ...        │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────┴──────────────────────────────────┐  │
│  │         Database Layer (Knex.js + PostgreSQL)         │  │
│  │  documents │ placeholders │ knowledge_graph │ ...     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Database Schema

Key tables:
- `users` - User authentication and profiles
- `documents` - Uploaded documents and metadata
- `placeholders` - Extracted fillable fields
- `data_room_documents` - Company knowledge base
- `knowledge_graph` - Extracted entities for auto-suggestions
- `ai_insights` - Generated insights and analytics
- `health_checks` - Document quality scores

---

## 📚 API Documentation

### Authentication
All API endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Core Endpoints

#### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `POST /api/documents/:id/analyze` - Analyze document
- `POST /api/documents/:id/placeholders` - Extract placeholders
- `GET /api/documents/:id/placeholders` - Get placeholders

#### Conversations
- `POST /api/conversations/start` - Start AI conversation
- `POST /api/conversations/:id/message` - Send message
- `GET /api/conversations/:id/history` - Get conversation history

#### Data Room
- `POST /api/dataroom/upload` - Upload company document
- `GET /api/dataroom/documents` - List data room documents
- `GET /api/dataroom/stats` - Get statistics
- `DELETE /api/dataroom/documents/:id` - Delete document

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/documents/:id/insights` - Document insights

---

## 🤖 AI Agents

### Agent Workflow Example

```typescript
// Document Analysis Flow
DocumentAnalyzer → PlaceholderExtractor → EntityMatcher → HealthScoreCalculator

// Conversation Flow
ConversationalAssistant → ComplianceValidator → EntityMatcher

// Data Room Flow
TemplateAnalyzer → EntityMatcher → InsightsEngine
```

Each agent is implemented as a specialized service that:
1. Receives structured input
2. Calls OpenAI GPT-4 with specific prompts
3. Validates and structures the response
4. Returns typed output for the next agent

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## 🚢 Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Build the backend:
```bash
cd backend
npm run build
```

3. Run migrations on production database:
```bash
cd backend
NODE_ENV=production npm run migrate:latest
```

4. Start the production server:
```bash
cd backend
NODE_ENV=production npm start
```

---

## 📝 Development Notes

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Conventional commits for git messages

### Project Status
- ✅ Backend: ~95% complete
- ✅ Frontend: ~90% complete
- ✅ AI Agents: All 11 agents implemented
- ✅ Core Features: Fully functional
- 🔄 Advanced Features: In progress

### Recent Updates
- ✅ Added contextual examples to AI conversation
- ✅ Implemented real-time completion percentage updates
- ✅ Created toast notification system
- ✅ Added spinner loading states
- ✅ Fixed Data Room API integration
- ✅ Enhanced conversation UX with markdown formatting

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- The React and Node.js communities
- All contributors and testers

---

<div align="center">

**Built with ❤️ by the Lexsy Team**

[Report Bug](https://github.com/yourusername/lexsy-test/issues) • [Request Feature](https://github.com/yourusername/lexsy-test/issues)

</div>
