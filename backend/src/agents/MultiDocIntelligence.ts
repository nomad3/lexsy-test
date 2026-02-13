// backend/src/agents/MultiDocIntelligence.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@smartdocs/common';
import { MODELS } from '../config/openai';

interface MultiDocIntelligenceInput {
  documentId: string;
  documentType: string;
  placeholders: Array<{
    fieldName: string;
    value: string;
    fieldType: string;
  }>;
  allUserDocuments: Array<{
    documentId: string;
    documentType: string;
    status: string;
    placeholders: Array<{
      fieldName: string;
      value: string | null;
      fieldType: string;
    }>;
  }>;
}

export interface MultiDocIntelligenceResult {
  hasRelationships: boolean;
  relationshipCount: number;
  relationships: Array<{
    relatedDocumentId: string;
    relatedDocumentType: string;
    relationshipType: 'same_party' | 'related_transaction' | 'dependent' | 'complementary' | 'conflicting';
    strength: number; // 0-1 confidence score
    sharedEntities: string[];
    description: string;
  }>;
  suggestions: Array<{
    targetDocumentId: string;
    targetFieldName: string;
    suggestedValue: string;
    sourceFieldName: string;
    reasoning: string;
    confidence: number; // 0-1
    autoApply: boolean; // true if confidence is very high and safe
  }>;
  insights: string[];
  potentialIssues: Array<{
    severity: 'critical' | 'warning' | 'info';
    description: string;
    affectedDocuments: string[];
  }>;
}

export class MultiDocIntelligence extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert multi-document intelligence system for legal documents. Your task is to analyze relationships between documents and suggest cross-document updates for consistency.

Analyze the provided document in the context of all user documents and identify:

1. Document Relationships:
   - Same parties involved (same companies, individuals)
   - Related transactions (follow-on investments, amendments, related agreements)
   - Dependencies (one document references another)
   - Complementary documents (NDA + Employment Agreement for same person)
   - Conflicting documents (contradicting terms)

2. Cross-Document Update Suggestions:
   - Values that should be synchronized (e.g., company name, addresses)
   - Fields in other documents that should be updated when this one changes
   - Missing values that could be auto-filled from related documents
   - Inconsistencies that need resolution

3. Business Insights:
   - Patterns across documents (e.g., "This is the 3rd SAFE for this company")
   - Timeline analysis (sequence of agreements)
   - Relationship mapping (investor relationships, employment history)

4. Potential Issues:
   - Cross-document conflicts or inconsistencies
   - Missing related documents
   - Unusual patterns that may need attention

For each relationship, provide:
- Type and strength (0-1 confidence)
- Shared entities that create the relationship
- Clear description

For each suggestion:
- Target document and field
- Suggested value and source
- Reasoning and confidence (0-1)
- Whether it's safe to auto-apply (high confidence + non-critical field)

Respond ONLY with valid JSON in this exact format:
{
  "hasRelationships": true,
  "relationshipCount": 2,
  "relationships": [
    {
      "relatedDocumentId": "doc-456",
      "relatedDocumentType": "NDA",
      "relationshipType": "same_party",
      "strength": 0.95,
      "sharedEntities": ["TechCo Inc.", "John Smith"],
      "description": "Both documents involve TechCo Inc. and John Smith, likely related to same business relationship"
    }
  ],
  "suggestions": [
    {
      "targetDocumentId": "doc-456",
      "targetFieldName": "company_address",
      "suggestedValue": "123 Main St, San Francisco, CA",
      "sourceFieldName": "company_address",
      "reasoning": "Company address was updated in this document and should be synchronized to the related NDA",
      "confidence": 0.92,
      "autoApply": false
    }
  ],
  "insights": [
    "This is the second SAFE agreement for TechCo Inc. within 6 months",
    "Total investment across related documents: $2.5M",
    "All documents share the same company address - good consistency"
  ],
  "potentialIssues": [
    {
      "severity": "warning",
      "description": "Valuation cap differs from previous SAFE ($8M vs $10M) - intentional or error?",
      "affectedDocuments": ["doc-123", "doc-456"]
    }
  ]
}

If no relationships detected:
{
  "hasRelationships": false,
  "relationshipCount": 0,
  "relationships": [],
  "suggestions": [],
  "insights": ["No related documents detected"],
  "potentialIssues": []
}

Focus on high-value relationships and actionable suggestions. Be conservative with autoApply - only suggest it when confidence is very high (>0.9) and the field is non-critical.`;

    super(
      'MultiDocIntelligence',
      AgentType.RECOMMENDER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.3, // Moderate temperature for balanced analysis
        max_tokens: 3000,
      }
    );
  }

  async execute(input: MultiDocIntelligenceInput): Promise<MultiDocIntelligenceResult> {
    try {
      const { documentId, documentType, placeholders, allUserDocuments } = input;

      if (!documentId || !documentType || !Array.isArray(placeholders)) {
        throw new Error('documentId, documentType, and placeholders are required');
      }

      // If no other documents, return empty intelligence
      if (!allUserDocuments || allUserDocuments.length === 0) {
        return {
          hasRelationships: false,
          relationshipCount: 0,
          relationships: [],
          suggestions: [],
          insights: ['No other documents available for comparison'],
          potentialIssues: []
        };
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildIntelligencePrompt(
          documentId,
          documentType,
          placeholders,
          allUserDocuments
        );
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const intelligence = this.parseIntelligenceResponse(response.content);

      return intelligence;
    } catch (error) {
      console.error('MultiDocIntelligence error:', error);

      // Return empty intelligence if analysis fails
      return {
        hasRelationships: false,
        relationshipCount: 0,
        relationships: [],
        suggestions: [],
        insights: ['Multi-document analysis failed'],
        potentialIssues: []
      };
    }
  }

  private buildIntelligencePrompt(
    documentId: string,
    documentType: string,
    placeholders: Array<{ fieldName: string; value: string; fieldType: string }>,
    allUserDocuments: Array<{
      documentId: string;
      documentType: string;
      status: string;
      placeholders: Array<{ fieldName: string; value: string | null; fieldType: string }>;
    }>
  ): string {
    const currentDocPlaceholders = placeholders.map(p =>
      `  - ${p.fieldName}: "${p.value}"`
    ).join('\n');

    const otherDocsSummary = allUserDocuments
      .filter(doc => doc.documentId !== documentId) // Exclude current document
      .map(doc => {
        const docPlaceholders = doc.placeholders
          .filter(p => p.value) // Only show filled placeholders
          .map(p => `    - ${p.fieldName}: "${p.value}"`)
          .join('\n');

        return `  Document ID: ${doc.documentId}
  Type: ${doc.documentType}
  Status: ${doc.status}
  Fields:
${docPlaceholders || '    (no filled fields)'}`;
      }).join('\n\n');

    return `Analyze relationships and suggest cross-document updates:

CURRENT DOCUMENT:
ID: ${documentId}
Type: ${documentType}
Placeholders:
${currentDocPlaceholders}

OTHER USER DOCUMENTS:
${otherDocsSummary || '(no other documents)'}

Identify relationships, suggest updates, provide insights, and flag potential issues.`;
  }

  private parseIntelligenceResponse(content: string): MultiDocIntelligenceResult {
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
        typeof parsed.hasRelationships !== 'boolean' ||
        typeof parsed.relationshipCount !== 'number' ||
        !Array.isArray(parsed.relationships) ||
        !Array.isArray(parsed.suggestions) ||
        !Array.isArray(parsed.insights) ||
        !Array.isArray(parsed.potentialIssues)
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Validate relationship count matches array length
      parsed.relationshipCount = parsed.relationships.length;
      parsed.hasRelationships = parsed.relationshipCount > 0;

      // Validate each relationship
      const validRelationshipTypes = ['same_party', 'related_transaction', 'dependent', 'complementary', 'conflicting'];
      parsed.relationships = parsed.relationships.filter((rel: any) => {
        if (!rel.relatedDocumentId || !rel.relatedDocumentType || !rel.relationshipType || !rel.description) {
          return false;
        }

        // Validate and normalize relationship type
        if (!validRelationshipTypes.includes(rel.relationshipType)) {
          rel.relationshipType = 'related_transaction';
        }

        // Validate strength
        if (typeof rel.strength !== 'number') {
          rel.strength = 0.5;
        }
        rel.strength = Math.max(0, Math.min(1, rel.strength));

        // Ensure sharedEntities is an array
        if (!Array.isArray(rel.sharedEntities)) {
          rel.sharedEntities = [];
        }

        return true;
      });

      // Validate each suggestion
      parsed.suggestions = parsed.suggestions.filter((sug: any) => {
        if (!sug.targetDocumentId || !sug.targetFieldName || !sug.suggestedValue || !sug.reasoning) {
          return false;
        }

        // Validate confidence
        if (typeof sug.confidence !== 'number') {
          sug.confidence = 0.5;
        }
        sug.confidence = Math.max(0, Math.min(1, sug.confidence));

        // Validate autoApply
        if (typeof sug.autoApply !== 'boolean') {
          sug.autoApply = false;
        }

        return true;
      });

      // Validate potential issues
      const validSeverities = ['critical', 'warning', 'info'];
      parsed.potentialIssues = parsed.potentialIssues.filter((issue: any) => {
        if (!issue.severity || !issue.description || !Array.isArray(issue.affectedDocuments)) {
          return false;
        }

        if (!validSeverities.includes(issue.severity)) {
          issue.severity = 'info';
        }

        return true;
      });

      // Recalculate counts after filtering
      parsed.relationshipCount = parsed.relationships.length;
      parsed.hasRelationships = parsed.relationshipCount > 0;

      return parsed as MultiDocIntelligenceResult;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse multi-doc intelligence response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
