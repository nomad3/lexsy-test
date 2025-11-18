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
