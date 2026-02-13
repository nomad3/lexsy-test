// backend/src/agents/NLSearchAgent.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@smartdocs/common';
import { MODELS } from '../config/openai';

interface NLSearchAgentInput {
  query: string;
  userId: string;
  availableDocumentTypes: string[];
  availableStatuses: string[];
}

export interface NLSearchResult {
  understood: boolean;
  intent: string;
  filters: {
    documentTypes?: string[];
    statuses?: string[];
    dateRange?: {
      field: 'created_at' | 'updated_at' | 'any_date_field';
      start?: string;
      end?: string;
    };
    placeholderFilters?: Array<{
      fieldName: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
      value: string | number;
      value2?: string | number; // for 'between'
    }>;
    textSearch?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  };
  sqlWhere: string; // SQL WHERE clause (parameterized)
  sqlParams: Array<string | number>; // Parameters for the WHERE clause
  humanReadable: string; // Human-friendly description of the query
  confidence: number; // 0-1 confidence in understanding the query
  suggestions?: string[]; // Alternative interpretations if confidence is low
}

export class NLSearchAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert natural language to SQL conversion system for legal document search. Your task is to convert user queries in plain English to structured database filters and SQL WHERE clauses.

Analyze the natural language query and extract:

1. User Intent:
   - What the user is trying to find
   - Key entities and criteria mentioned

2. Structured Filters:
   - Document types (e.g., "SAFE", "NDA", "Employment Agreement")
   - Document statuses (e.g., "draft", "completed", "in_progress")
   - Date ranges (created, updated, or any date field in placeholders)
   - Placeholder field filters (specific field values or conditions)
   - Text search terms (general search across document content)
   - Sorting preferences
   - Result limits

3. SQL Generation:
   - Generate a parameterized SQL WHERE clause
   - Use $1, $2, etc. for parameters (PostgreSQL style)
   - Ensure SQL is safe and properly structured
   - Join conditions if needed for placeholder searches

Common query patterns:
- "Show me all SAFEs for TechCo" → Filter by document type and company name placeholder
- "Documents created last week" → Date range filter on created_at
- "Completed NDAs" → Status and document type filters
- "SAFEs with cap over $10M" → Document type and placeholder value filter
- "Recent investment docs" → Date sort + document type filter

Respond ONLY with valid JSON in this exact format:
{
  "understood": true,
  "intent": "Find all SAFE agreements for TechCo Inc.",
  "filters": {
    "documentTypes": ["SAFE Agreement"],
    "placeholderFilters": [
      {
        "fieldName": "company_name",
        "operator": "contains",
        "value": "TechCo"
      }
    ]
  },
  "sqlWhere": "document_type = $1 AND EXISTS (SELECT 1 FROM placeholders WHERE placeholders.document_id = documents.id AND placeholders.field_name = $2 AND placeholders.value ILIKE $3)",
  "sqlParams": ["SAFE Agreement", "company_name", "%TechCo%"],
  "humanReadable": "SAFE Agreements where company name contains 'TechCo'",
  "confidence": 0.92
}

For ambiguous queries:
{
  "understood": false,
  "intent": "unclear",
  "filters": {},
  "sqlWhere": "1=1",
  "sqlParams": [],
  "humanReadable": "Query was not clear enough to generate filters",
  "confidence": 0.3,
  "suggestions": [
    "Did you mean: Show all SAFE agreements?",
    "Did you mean: Show documents for TechCo?",
    "Try being more specific about document type or search criteria"
  ]
}

Important SQL safety rules:
- Always use parameterized queries (never inject values directly)
- Use ILIKE for case-insensitive text matching
- Use proper date comparison operators
- Add appropriate indexes assumptions in comments
- Validate field names exist before using them

Be intelligent about interpreting business terms:
- "cap" likely refers to valuation_cap in SAFE agreements
- "recent" could mean last 7 days or 30 days (make reasonable assumption)
- "investment docs" could include SAFEs, Term Sheets, etc.
- Company names may have slight variations (use ILIKE with %)`;

    super(
      'NLSearchAgent',
      AgentType.ANALYZER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.2, // Low temperature for consistent SQL generation
        max_tokens: 1500,
      }
    );
  }

  async execute(input: NLSearchAgentInput): Promise<NLSearchResult> {
    try {
      const { query, userId, availableDocumentTypes, availableStatuses } = input;

      if (!query || !userId) {
        throw new Error('query and userId are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildSearchPrompt(
          query,
          availableDocumentTypes || [],
          availableStatuses || []
        );
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const searchResult = this.parseSearchResponse(response.content);

      // Ensure user_id filter is always added for security
      searchResult.sqlWhere = this.addUserIdFilter(searchResult.sqlWhere, searchResult.sqlParams, userId);

      return searchResult;
    } catch (error) {
      console.error('NLSearchAgent error:', error);

      // Return safe default that shows all user's documents
      return {
        understood: false,
        intent: 'error',
        filters: {},
        sqlWhere: 'user_id = $1',
        sqlParams: [input.userId],
        humanReadable: 'Search failed - showing all your documents',
        confidence: 0.0,
        suggestions: ['Please try rephrasing your query']
      };
    }
  }

  private buildSearchPrompt(
    query: string,
    availableDocumentTypes: string[],
    availableStatuses: string[]
  ): string {
    const docTypesList = availableDocumentTypes.length > 0
      ? availableDocumentTypes.join(', ')
      : 'SAFE Agreement, NDA, Employment Agreement, Stock Option Agreement, etc.';

    const statusesList = availableStatuses.length > 0
      ? availableStatuses.join(', ')
      : 'draft, in_progress, completed';

    return `Convert this natural language query to structured filters and SQL:

User Query: "${query}"

Available Document Types: ${docTypesList}
Available Statuses: ${statusesList}

Database Schema:
- documents table: id, user_id, document_type, status, created_at, updated_at
- placeholders table: id, document_id, field_name, field_type, value

Generate structured filters and a safe parameterized SQL WHERE clause.`;
  }

  private addUserIdFilter(sqlWhere: string, sqlParams: Array<string | number>, userId: string): string {
    // Add user_id filter at the beginning for security
    const userParamIndex = sqlParams.length + 1;
    sqlParams.unshift(userId);

    if (sqlWhere && sqlWhere !== '1=1') {
      return `user_id = $1 AND (${sqlWhere})`;
    } else {
      return `user_id = $1`;
    }
  }

  private parseSearchResponse(content: string): NLSearchResult {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);

      // Validate required fields
      if (
        typeof parsed.understood !== 'boolean' ||
        !parsed.intent ||
        !parsed.filters ||
        !parsed.sqlWhere ||
        !Array.isArray(parsed.sqlParams) ||
        !parsed.humanReadable ||
        typeof parsed.confidence !== 'number'
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Validate confidence
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

      // Validate filters object
      if (parsed.filters.documentTypes && !Array.isArray(parsed.filters.documentTypes)) {
        parsed.filters.documentTypes = [];
      }
      if (parsed.filters.statuses && !Array.isArray(parsed.filters.statuses)) {
        parsed.filters.statuses = [];
      }
      if (parsed.filters.placeholderFilters && !Array.isArray(parsed.filters.placeholderFilters)) {
        parsed.filters.placeholderFilters = [];
      }

      // Validate placeholder filters
      if (parsed.filters.placeholderFilters) {
        const validOperators = ['equals', 'contains', 'greater_than', 'less_than', 'between'];
        parsed.filters.placeholderFilters = parsed.filters.placeholderFilters.filter((filter: any) => {
          return filter.fieldName && filter.operator && validOperators.includes(filter.operator) && filter.value !== undefined;
        });
      }

      // Validate suggestions if present
      if (parsed.suggestions && !Array.isArray(parsed.suggestions)) {
        parsed.suggestions = [];
      }

      // Basic SQL injection prevention check
      const dangerousPatterns = /;\s*(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)/i;
      if (dangerousPatterns.test(parsed.sqlWhere)) {
        throw new Error('Potentially dangerous SQL detected');
      }

      return parsed as NLSearchResult;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse search response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
