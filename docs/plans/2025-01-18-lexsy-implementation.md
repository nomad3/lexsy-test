# Lexsy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-first legal document automation platform that helps lawyers fill documents through intelligent placeholder detection, conversational filling, and cross-document intelligence.

**Architecture:** Monorepo with React frontend, Express backend, PostgreSQL database, and 11 specialized OpenAI GPT-4 agents. Multi-agent system handles document analysis, entity extraction, and business intelligence. Docker Compose deployment with production-ready infrastructure.

**Tech Stack:** React 18 + TypeScript + Vite, Express + TypeScript, PostgreSQL, OpenAI GPT-4, Docker Compose, Tailwind CSS + shadcn/ui, Zustand, React Query, Jest, Vitest, Playwright

---

## Phase 1: Project Infrastructure & Setup

### Task 1: Initialize Monorepo Structure

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `frontend/package.json`
- Create: `backend/package.json`
- Create: `common/package.json`

**Step 1: Create root package.json**

```bash
npm init -y
```

**Step 2: Configure workspace in root package.json**

```json
{
  "name": "lexsy",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend",
    "common"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "build": "npm run build --workspace=common && npm run build --workspace=backend && npm run build --workspace=frontend",
    "test": "npm run test --workspace=backend && npm run test --workspace=frontend",
    "lint": "npm run lint --workspace=backend && npm run lint --workspace=frontend",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "npm run typecheck --workspace=backend && npm run typecheck --workspace=frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "prettier": "^3.1.1"
  }
}
```

**Step 3: Create .gitignore**

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tsbuildinfo

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Docker volumes
postgres_data/

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep

# Testing
coverage/
.nyc_output/

# Misc
.cache/
```

**Step 4: Create directory structure**

```bash
mkdir -p frontend backend common docs/plans docs/api
mkdir -p backend/src/{controllers,services,agents,middleware,routes,database,utils,config}
mkdir -p backend/src/database/{migrations,seeds}
mkdir -p backend/{tests,uploads,logs}
mkdir -p frontend/src/{components,pages,services,stores,hooks,utils,types}
mkdir -p frontend/src/components/{common,documents,conversation,dataroom,ui}
mkdir -p frontend/{tests,public}
mkdir -p common/{types,constants}
touch backend/uploads/.gitkeep
touch backend/logs/.gitkeep
```

**Step 5: Commit initial structure**

```bash
git add .
git commit -m "feat: initialize monorepo structure with workspaces"
```

---

### Task 2: Setup Common Package (Shared Types)

**Files:**
- Create: `common/package.json`
- Create: `common/tsconfig.json`
- Create: `common/types/index.ts`
- Create: `common/types/Document.ts`
- Create: `common/types/Placeholder.ts`
- Create: `common/types/Agent.ts`
- Create: `common/types/User.ts`

**Step 1: Create common/package.json**

```json
{
  "name": "@lexsy/common",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Step 2: Create common/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["types/**/*", "constants/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create common/types/Document.ts**

```typescript
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  ANALYZING = 'analyzing',
  READY = 'ready',
  FILLING = 'filling',
  COMPLETED = 'completed'
}

export interface Document {
  id: string;
  filename: string;
  filePath: string;
  uploadDate: Date;
  status: DocumentStatus;
  documentType: string;
  aiClassificationConfidence?: number;
  riskScore?: number;
  completionPercentage: number;
  metadata?: Record<string, any>;
  userId: string;
}
```

**Step 4: Create common/types/Placeholder.ts**

```typescript
export enum PlaceholderFieldType {
  TEXT = 'text',
  DATE = 'date',
  CURRENCY = 'currency',
  NUMBER = 'number',
  EMAIL = 'email',
  ADDRESS = 'address'
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  FLAGGED = 'flagged'
}

export interface Placeholder {
  id: string;
  documentId: string;
  fieldName: string;
  fieldType: PlaceholderFieldType;
  originalText: string;
  position: number;
  filledValue?: string;
  aiSuggestedValue?: string;
  suggestionSource?: string;
  confidence: number;
  validationStatus: ValidationStatus;
  validationNotes?: string;
}
```

**Step 5: Create common/types/Agent.ts**

```typescript
export enum AgentType {
  EXTRACTOR = 'extractor',
  VALIDATOR = 'validator',
  ANALYZER = 'analyzer',
  RECOMMENDER = 'recommender'
}

export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum TaskType {
  EXTRACT_PLACEHOLDERS = 'extract_placeholders',
  VALIDATE_DATA = 'validate_data',
  SUGGEST_VALUES = 'suggest_values',
  CHECK_COMPLIANCE = 'check_compliance',
  ANALYZE_DOCUMENT = 'analyze_document',
  EXTRACT_ENTITIES = 'extract_entities',
  CALCULATE_HEALTH = 'calculate_health',
  DETECT_CONFLICTS = 'detect_conflicts',
  SEARCH_NL = 'search_nl',
  LINK_DOCUMENTS = 'link_documents'
}

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  model: string;
  systemPrompt: string;
  config: Record<string, any>;
  active: boolean;
}

export interface AITask {
  id: string;
  agentId: string;
  taskType: TaskType;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  status: TaskStatus;
  tokensUsed?: number;
  cost?: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}
```

**Step 6: Create common/types/User.ts**

```typescript
export enum UserRole {
  LAWYER = 'lawyer',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

**Step 7: Create common/types/index.ts**

```typescript
export * from './Document';
export * from './Placeholder';
export * from './Agent';
export * from './User';
```

**Step 8: Build common package**

```bash
cd common
npm install
npm run build
```

**Step 9: Commit common types**

```bash
git add common/
git commit -m "feat: add shared TypeScript types for common package"
```

---

### Task 3: Setup Backend Infrastructure

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/src/config/database.ts`
- Create: `backend/src/config/openai.ts`
- Create: `backend/src/config/app.ts`

**Step 1: Create backend/package.json**

```json
{
  "name": "@lexsy/backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate": "ts-node src/database/migrate.ts",
    "seed": "ts-node src/database/seed.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lexsy/common": "^1.0.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "mammoth": "^1.6.0",
    "openai": "^4.24.1",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.6",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0"
  }
}
```

**Step 2: Create backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: Create backend/.env.example**

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://lexsy_user:lexsy_password@localhost:5432/lexsy

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=24h

# File Upload
FILE_UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Step 4: Create backend/src/config/database.ts**

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    return release();
  };

  return client;
};
```

**Step 5: Create backend/src/config/openai.ts**

```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODELS = {
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
} as const;

export const PRICING = {
  [MODELS.GPT4_TURBO]: { input: 0.01, output: 0.03 }, // per 1K tokens
  [MODELS.GPT4]: { input: 0.03, output: 0.06 },
  [MODELS.GPT35_TURBO]: { input: 0.0005, output: 0.0015 },
} as const;

export function calculateCost(tokens: { prompt: number; completion: number }, model: string): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;

  const inputCost = (tokens.prompt / 1000) * pricing.input;
  const outputCost = (tokens.completion / 1000) * pricing.output;

  return inputCost + outputCost;
}
```

**Step 6: Create backend/src/config/app.ts**

```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  fileUploadPath: process.env.FILE_UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

// Validate required config
if (config.env === 'production' && config.jwtSecret === 'change-me-in-production') {
  throw new Error('JWT_SECRET must be set in production');
}
```

**Step 7: Install backend dependencies**

```bash
cd backend
npm install
```

**Step 8: Commit backend setup**

```bash
git add backend/
git commit -m "feat: setup backend infrastructure with config and dependencies"
```

---

### Task 4: Setup Database Schema and Migrations

**Files:**
- Create: `backend/src/database/schema.sql`
- Create: `backend/src/database/migrate.ts`
- Create: `backend/src/database/migrations/001_initial_schema.sql`

**Step 1: Create backend/src/database/schema.sql**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('lawyer', 'admin')),
  organization VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- AI Agents table
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('extractor', 'validator', 'analyzer', 'recommender')),
  model VARCHAR(100) NOT NULL,
  system_prompt TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Tasks table
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id),
  task_type VARCHAR(100) NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tokens_used INTEGER,
  cost DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT
);

CREATE INDEX idx_ai_tasks_agent_id ON ai_tasks(agent_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at DESC);

-- AI Insights table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('anomaly', 'pattern', 'suggestion', 'risk')),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  agent_id UUID REFERENCES ai_agents(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_insights_entity ON ai_insights(entity_type, entity_id);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- AI Training Data table
CREATE TABLE ai_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('user_correction', 'validation', 'feedback')),
  original_ai_output JSONB NOT NULL,
  user_correction JSONB NOT NULL,
  context JSONB DEFAULT '{}',
  agent_id UUID REFERENCES ai_agents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_for_improvement BOOLEAN DEFAULT FALSE
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL CHECK (status IN ('uploaded', 'analyzing', 'ready', 'filling', 'completed')),
  document_type VARCHAR(100),
  ai_classification_confidence FLOAT,
  risk_score FLOAT,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_upload_date ON documents(upload_date DESC);

-- Placeholders table
CREATE TABLE placeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  field_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  original_text TEXT,
  position INTEGER NOT NULL,
  filled_value TEXT,
  ai_suggested_value TEXT,
  suggestion_source VARCHAR(255),
  confidence FLOAT,
  validation_status VARCHAR(50) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'flagged')),
  validation_notes TEXT
);

CREATE INDEX idx_placeholders_document_id ON placeholders(document_id);
CREATE INDEX idx_placeholders_position ON placeholders(document_id, position);

-- Document Templates table
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  pre_extracted_placeholders JSONB DEFAULT '[]',
  popularity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Room Documents table
CREATE TABLE data_room_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_status VARCHAR(50) DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'extracting', 'indexed', 'failed')),
  ai_summary TEXT,
  key_entities_count INTEGER DEFAULT 0,
  quality_score FLOAT
);

CREATE INDEX idx_data_room_user_id ON data_room_documents(user_id);
CREATE INDEX idx_data_room_company ON data_room_documents(company_name);

-- Knowledge Graph table
CREATE TABLE knowledge_graph (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(100) NOT NULL,
  entity_value TEXT NOT NULL,
  source_document_id UUID REFERENCES data_room_documents(id) ON DELETE CASCADE,
  source_document_type VARCHAR(100),
  relationships JSONB DEFAULT '{}',
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usage_count INTEGER DEFAULT 0
);

CREATE INDEX idx_knowledge_graph_entity ON knowledge_graph(entity_type, entity_value);
CREATE INDEX idx_knowledge_graph_source ON knowledge_graph(source_document_id);

-- Document Relationships table
CREATE TABLE document_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  related_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('same_company', 'same_series', 'amendment', 'related_party')),
  confidence FLOAT,
  detected_by UUID REFERENCES ai_agents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doc_relationships_source ON document_relationships(source_document_id);
CREATE INDEX idx_doc_relationships_related ON document_relationships(related_document_id);

-- Cross Document Updates table
CREATE TABLE cross_document_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_placeholder_id UUID NOT NULL REFERENCES placeholders(id) ON DELETE CASCADE,
  affected_document_ids JSONB NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  suggested_value TEXT NOT NULL,
  user_action VARCHAR(50) DEFAULT 'pending' CHECK (user_action IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Checks table
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 100),
  consistency_score INTEGER CHECK (consistency_score >= 0 AND consistency_score <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  issues JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_checks_document ON health_checks(document_id);
CREATE INDEX idx_health_checks_date ON health_checks(checked_at DESC);

-- Conflicts table
CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('value_mismatch', 'missing_field', 'inconsistent_terms', 'unusual_value')),
  field_name VARCHAR(255),
  current_value TEXT,
  expected_value TEXT,
  conflicting_document_id UUID REFERENCES documents(id),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conflicts_document ON conflicts(document_id);
CREATE INDEX idx_conflicts_status ON conflicts(status);

-- Search Queries table
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  query_text TEXT NOT NULL,
  parsed_filters JSONB,
  results_count INTEGER,
  ai_agent_id UUID REFERENCES ai_agents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_queries_user ON search_queries(user_id);
CREATE INDEX idx_search_queries_created ON search_queries(created_at DESC);

-- Business Intelligence table
CREATE TABLE business_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type VARCHAR(100) NOT NULL,
  metric_value JSONB NOT NULL,
  time_period TSRANGE,
  company_id VARCHAR(255),
  calculated_by UUID REFERENCES ai_agents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bi_metric_type ON business_intelligence(metric_type);
CREATE INDEX idx_bi_time_period ON business_intelligence USING GIST (time_period);
```

**Step 2: Create backend/src/database/migrate.ts**

```typescript
import { pool, query } from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Create migrations tracking table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      // Check if migration already executed
      const result = await query('SELECT id FROM migrations WHERE name = $1', [file]);

      if (result.rows.length === 0) {
        console.log(`Running migration: ${file}`);

        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await query(sql);
        await query('INSERT INTO migrations (name) VALUES ($1)', [file]);

        console.log(`Completed migration: ${file}`);
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations();
```

**Step 3: Create backend/src/database/migrations/001_initial_schema.sql**

Copy the entire schema.sql content into this file.

**Step 4: Make migrate.ts executable**

```bash
chmod +x backend/src/database/migrate.ts
```

**Step 5: Commit database schema**

```bash
git add backend/src/database/
git commit -m "feat: add database schema and migration system"
```

---

## Phase 2: Backend Core Implementation

### Task 5: Implement Base Agent Class

**Files:**
- Create: `backend/src/agents/BaseAgent.ts`
- Create: `backend/tests/agents/BaseAgent.test.ts`

**Step 1: Write the failing test**

```typescript
// backend/tests/agents/BaseAgent.test.ts
import { BaseAgent } from '../../src/agents/BaseAgent';
import { AgentType, TaskType, TaskStatus } from '@lexsy/common';

// Mock OpenAI
jest.mock('openai');

class TestAgent extends BaseAgent {
  constructor() {
    super('test-agent', AgentType.ANALYZER, 'gpt-4-turbo-preview');
  }

  async execute(input: any): Promise<any> {
    return { result: 'test' };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;

  beforeEach(() => {
    agent = new TestAgent();
  });

  it('should create agent with correct properties', () => {
    expect(agent.name).toBe('test-agent');
    expect(agent.type).toBe(AgentType.ANALYZER);
    expect(agent.model).toBe('gpt-4-turbo-preview');
  });

  it('should create and complete task successfully', async () => {
    const input = { test: 'data' };
    const result = await agent.runTask(TaskType.ANALYZE_DOCUMENT, input);

    expect(result).toBeDefined();
    expect(result.status).toBe(TaskStatus.COMPLETED);
    expect(result.outputData).toEqual({ result: 'test' });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- tests/agents/BaseAgent.test.ts
```

Expected: FAIL with "Cannot find module '../../src/agents/BaseAgent'"

**Step 3: Write minimal implementation**

```typescript
// backend/src/agents/BaseAgent.ts
import { v4 as uuidv4 } from 'uuid';
import { openai, calculateCost } from '../config/openai';
import { query } from '../config/database';
import { AgentType, TaskType, TaskStatus, AITask } from '@lexsy/common';

export abstract class BaseAgent {
  public readonly name: string;
  public readonly type: AgentType;
  public readonly model: string;
  protected systemPrompt: string;
  protected config: Record<string, any>;

  constructor(name: string, type: AgentType, model: string, systemPrompt: string = '', config: Record<string, any> = {}) {
    this.name = name;
    this.type = type;
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.config = {
      temperature: 0.7,
      max_tokens: 2000,
      ...config
    };
  }

  abstract execute(input: any): Promise<any>;

  async runTask(taskType: TaskType, input: any): Promise<AITask> {
    const taskId = uuidv4();

    try {
      // Get or create agent in database
      const agentId = await this.getOrCreateAgent();

      // Create task record
      await this.createTaskRecord(taskId, agentId, taskType, input);

      // Execute the task
      const output = await this.execute(input);

      // Complete task record
      await this.completeTaskRecord(taskId, output);

      // Return completed task
      const result = await query('SELECT * FROM ai_tasks WHERE id = $1', [taskId]);
      return this.mapRowToTask(result.rows[0]);
    } catch (error) {
      await this.failTaskRecord(taskId, error as Error);
      throw error;
    }
  }

  protected async callOpenAI(userPrompt: string): Promise<any> {
    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
    });

    return {
      content: response.choices[0].message.content,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    };
  }

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private async getOrCreateAgent(): Promise<string> {
    const result = await query(
      'SELECT id FROM ai_agents WHERE name = $1',
      [this.name]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    const insertResult = await query(
      `INSERT INTO ai_agents (name, type, model, system_prompt, config, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [this.name, this.type, this.model, this.systemPrompt, JSON.stringify(this.config), true]
    );

    return insertResult.rows[0].id;
  }

  private async createTaskRecord(taskId: string, agentId: string, taskType: TaskType, input: any): Promise<void> {
    await query(
      `INSERT INTO ai_tasks (id, agent_id, task_type, input_data, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [taskId, agentId, taskType, JSON.stringify(input), TaskStatus.PROCESSING]
    );
  }

  private async completeTaskRecord(taskId: string, output: any): Promise<void> {
    await query(
      `UPDATE ai_tasks
       SET output_data = $1, status = $2, completed_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(output), TaskStatus.COMPLETED, taskId]
    );
  }

  private async failTaskRecord(taskId: string, error: Error): Promise<void> {
    await query(
      `UPDATE ai_tasks
       SET status = $1, error = $2, completed_at = NOW()
       WHERE id = $3`,
      [TaskStatus.FAILED, error.message, taskId]
    );
  }

  private mapRowToTask(row: any): AITask {
    return {
      id: row.id,
      agentId: row.agent_id,
      taskType: row.task_type,
      inputData: row.input_data,
      outputData: row.output_data,
      status: row.status,
      tokensUsed: row.tokens_used,
      cost: row.cost ? parseFloat(row.cost) : undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      error: row.error
    };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/agents/BaseAgent.test.ts
```

Expected: PASS

**Step 5: Commit BaseAgent**

```bash
git add src/agents/BaseAgent.ts tests/agents/BaseAgent.test.ts
git commit -m "feat: implement BaseAgent class with task tracking"
```

---

### Task 6: Implement Logger Utility

**Files:**
- Create: `backend/src/utils/logger.ts`
- Create: `backend/tests/utils/logger.test.ts`

**Step 1: Write the failing test**

```typescript
// backend/tests/utils/logger.test.ts
import { logger } from '../../src/utils/logger';

describe('Logger', () => {
  it('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should log messages without throwing', () => {
    expect(() => {
      logger.info('Test message');
      logger.error('Error message');
      logger.warn('Warning message');
      logger.debug('Debug message');
    }).not.toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/utils/logger.test.ts
```

Expected: FAIL

**Step 3: Write implementation**

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';
import path from 'path';
import { config } from '../config/app';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    level: config.env === 'production' ? 'info' : 'debug'
  })
];

// Add file transport in production
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: logFormat
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: logFormat
    })
  );
}

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  exitOnError: false
});

// Create a stream for Morgan (HTTP logger)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
```

**Step 4: Run test to verify it passes**

```bash
npm test -- tests/utils/logger.test.ts
```

Expected: PASS

**Step 5: Commit logger**

```bash
git add src/utils/logger.ts tests/utils/logger.test.ts
git commit -m "feat: implement Winston logger with file and console transports"
```

---

### Task 7: Implement Authentication Middleware

**Files:**
- Create: `backend/src/middleware/authenticate.ts`
- Create: `backend/src/middleware/authorize.ts`
- Create: `backend/tests/middleware/authenticate.test.ts`

**Step 1: Write the failing test**

```typescript
// backend/tests/middleware/authenticate.test.ts
import { authenticate } from '../../src/middleware/authenticate';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/app';

describe('authenticate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should authenticate valid token from Authorization header', async () => {
    const token = jwt.sign({ userId: 'test-user-id', role: 'lawyer' }, config.jwtSecret);
    req.headers = { authorization: `Bearer ${token}` };

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.id).toBe('test-user-id');
  });

  it('should reject request without token', async () => {
    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    req.headers = { authorization: 'Bearer invalid-token' };

    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test**

```bash
npm test -- tests/middleware/authenticate.test.ts
```

Expected: FAIL

**Step 3: Implement authenticate middleware**

```typescript
// backend/src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/app';
import { query } from '../config/database';
import { UserRole } from '@lexsy/common';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  organization?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get token from header or cookie
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided'
        }
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: UserRole };

    // Check if user exists and is active
    const result = await query(
      'SELECT id, email, role, organization FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_USER',
          message: 'User not found or inactive'
        }
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      organization: result.rows[0].organization
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error'
      }
    });
  }
}
```

**Step 4: Implement authorize middleware**

```typescript
// backend/src/middleware/authorize.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@lexsy/common';

export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
      return;
    }

    next();
  };
}
```

**Step 5: Run tests**

```bash
npm test -- tests/middleware/authenticate.test.ts
```

Expected: PASS

**Step 6: Commit auth middleware**

```bash
git add src/middleware/ tests/middleware/
git commit -m "feat: implement authentication and authorization middleware"
```

---

**Due to length constraints, I'll create a condensed version of the remaining tasks. The plan continues with:**

- Task 8-11: Implement remaining 11 AI agents
- Task 12-15: Implement services (Document, Conversation, DataRoom, etc.)
- Task 16-20: Implement API routes and controllers
- Task 21-25: Frontend setup and core components
- Task 26-30: Frontend pages and features
- Task 31-35: Docker setup and deployment
- Task 36-40: Testing and refinement

The complete plan would be 150+ tasks. Should I:
1. Continue with full detailed plan (will be very long)
2. Create condensed plan with grouped tasks
3. Focus on next 10-15 critical tasks only
