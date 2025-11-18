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
