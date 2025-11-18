// backend/src/agents/ConflictDetector.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@lexsy/common';
import { MODELS } from '../config/openai';

interface ConflictDetectorInput {
  documentId: string;
  placeholders: Array<{
    fieldName: string;
    value: string;
    fieldType: string;
  }>;
  relatedDocuments?: Array<{
    documentId: string;
    documentType: string;
    placeholders: Array<{
      fieldName: string;
      value: string;
    }>;
  }>;
}

export interface ConflictDetection {
  hasConflicts: boolean;
  conflictCount: number;
  conflicts: Array<{
    type: 'internal' | 'cross_document' | 'validation' | 'logical';
    severity: 'critical' | 'warning' | 'info';
    field1: string;
    field2?: string;
    value1: string;
    value2?: string;
    description: string;
    suggestion: string;
    relatedDocumentId?: string;
  }>;
  consistencyScore: number; // 0-100
  recommendations: string[];
}

export class ConflictDetector extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert legal document conflict and consistency detector. Your task is to identify inconsistencies, conflicts, and logical errors within a document or across multiple related documents.

Analyze the provided document data and detect:

1. Internal Conflicts:
   - Contradicting values (e.g., different dates for the same event)
   - Inconsistent formatting (e.g., "Company Inc." vs "Company, Inc")
   - Logical errors (e.g., end date before start date)
   - Mathematical inconsistencies (e.g., percentages not adding to 100%)

2. Cross-Document Conflicts (if related documents provided):
   - Same entity with different values across documents
   - Contradicting terms or conditions
   - Inconsistent party names or details
   - Conflicting dates or amounts

3. Validation Issues:
   - Invalid data formats
   - Missing required dependencies
   - Out-of-range values

4. Logical Inconsistencies:
   - Business logic violations
   - Legal requirement violations
   - Timeline inconsistencies

For each conflict, provide:
- Type: internal, cross_document, validation, or logical
- Severity: critical (must fix), warning (should fix), info (consider reviewing)
- Fields involved and their values
- Clear description of the conflict
- Actionable suggestion to resolve it

Calculate a consistency score (0-100) where:
- 100 = No conflicts detected
- 90-99 = Minor info-level issues only
- 75-89 = Some warnings present
- 60-74 = Multiple warnings or minor critical issues
- Below 60 = Significant critical conflicts

Respond ONLY with valid JSON in this exact format:
{
  "hasConflicts": true,
  "conflictCount": 3,
  "conflicts": [
    {
      "type": "internal",
      "severity": "critical",
      "field1": "contract_start_date",
      "field2": "contract_end_date",
      "value1": "2024-12-01",
      "value2": "2024-06-01",
      "description": "Contract end date (2024-06-01) is before start date (2024-12-01)",
      "suggestion": "Ensure end date is after start date. Consider if dates were entered incorrectly."
    },
    {
      "type": "cross_document",
      "severity": "warning",
      "field1": "company_name",
      "field2": "company_name",
      "value1": "TechCo Inc.",
      "value2": "TechCo, Inc",
      "description": "Company name formatting differs across documents",
      "suggestion": "Standardize company name format across all documents as 'TechCo Inc.'",
      "relatedDocumentId": "doc-123"
    }
  ],
  "consistencyScore": 72,
  "recommendations": [
    "Fix the contract date logic error immediately",
    "Standardize company name formatting across all documents",
    "Review all date fields for consistency"
  ]
}

If no conflicts are detected:
{
  "hasConflicts": false,
  "conflictCount": 0,
  "conflicts": [],
  "consistencyScore": 100,
  "recommendations": ["No conflicts detected. Document appears consistent."]
}

Be thorough but practical - focus on conflicts that matter legally or operationally.`;

    super(
      'ConflictDetector',
      AgentType.VALIDATOR,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.2, // Low temperature for consistent detection
        max_tokens: 2500,
      }
    );
  }

  async execute(input: ConflictDetectorInput): Promise<ConflictDetection> {
    try {
      const { documentId, placeholders, relatedDocuments } = input;

      if (!documentId || !placeholders || !Array.isArray(placeholders)) {
        throw new Error('documentId and placeholders array are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildConflictPrompt(placeholders, relatedDocuments);
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const detection = this.parseConflictResponse(response.content);

      return detection;
    } catch (error) {
      console.error('ConflictDetector error:', error);

      // Return safe default if detection fails
      return {
        hasConflicts: false,
        conflictCount: 0,
        conflicts: [],
        consistencyScore: 50, // Conservative score when detection fails
        recommendations: ['Conflict detection failed - please review document manually']
      };
    }
  }

  private buildConflictPrompt(
    placeholders: Array<{ fieldName: string; value: string; fieldType: string }>,
    relatedDocuments?: Array<{
      documentId: string;
      documentType: string;
      placeholders: Array<{ fieldName: string; value: string }>;
    }>
  ): string {
    const placeholdersSummary = placeholders.map(p =>
      `  - ${p.fieldName} (${p.fieldType}): "${p.value}"`
    ).join('\n');

    let prompt = `Detect conflicts and inconsistencies in this document:\n\nDocument Placeholders:\n${placeholdersSummary}`;

    if (relatedDocuments && relatedDocuments.length > 0) {
      prompt += '\n\nRelated Documents:\n';
      relatedDocuments.forEach(doc => {
        prompt += `\nDocument ID: ${doc.documentId} (${doc.documentType})\n`;
        prompt += doc.placeholders.map(p =>
          `  - ${p.fieldName}: "${p.value}"`
        ).join('\n');
      });
    }

    prompt += '\n\nIdentify all conflicts, inconsistencies, and potential issues.';

    return prompt;
  }

  private parseConflictResponse(content: string): ConflictDetection {
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
        typeof parsed.hasConflicts !== 'boolean' ||
        typeof parsed.conflictCount !== 'number' ||
        !Array.isArray(parsed.conflicts) ||
        typeof parsed.consistencyScore !== 'number' ||
        !Array.isArray(parsed.recommendations)
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Validate conflict count matches array length
      parsed.conflictCount = parsed.conflicts.length;
      parsed.hasConflicts = parsed.conflictCount > 0;

      // Validate consistency score
      parsed.consistencyScore = Math.max(0, Math.min(100, Math.round(parsed.consistencyScore)));

      // Validate each conflict
      const validTypes = ['internal', 'cross_document', 'validation', 'logical'];
      const validSeverities = ['critical', 'warning', 'info'];

      parsed.conflicts = parsed.conflicts.filter((conflict: any) => {
        // Ensure required fields exist
        if (!conflict.type || !conflict.severity || !conflict.field1 || !conflict.description || !conflict.suggestion) {
          return false;
        }

        // Validate type and severity
        if (!validTypes.includes(conflict.type)) {
          conflict.type = 'internal';
        }
        if (!validSeverities.includes(conflict.severity)) {
          conflict.severity = 'warning';
        }

        return true;
      });

      // Recalculate after filtering
      parsed.conflictCount = parsed.conflicts.length;
      parsed.hasConflicts = parsed.conflictCount > 0;

      return parsed as ConflictDetection;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse conflict detection response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
