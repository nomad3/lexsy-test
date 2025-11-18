// backend/src/agents/EntityMatcher.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@lexsy/common';
import { MODELS } from '../config/openai';

interface EntityMatcherInput {
  placeholderId: string;
  fieldName: string;
  fieldType: string;
  knowledgeGraphEntities: Array<{
    entityType: string;
    entityValue: string;
    sourceDocument: string;
    confidence: number;
  }>;
}

export interface EntityMatch {
  suggestedValue: string;
  confidence: number;
  source: string;
  reasoning: string;
}

export class EntityMatcher extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert entity matching system for legal documents. Your task is to match document placeholders with relevant entities from a knowledge graph.

Given a placeholder field and a list of entities extracted from company documents (data room), determine:
1. The most appropriate entity value to suggest for this placeholder
2. Your confidence level in this match (0-1 scale)
3. The source of the match
4. Brief reasoning for why this match is appropriate

Consider:
- Field name and type compatibility
- Context and semantic meaning
- Entity confidence scores
- Document types and relationships

Respond ONLY with valid JSON in this exact format:
{
  "suggestedValue": "suggested value here",
  "confidence": 0.85,
  "source": "source document or description",
  "reasoning": "Brief explanation of why this match makes sense"
}

If no good match is found, respond with:
{
  "suggestedValue": null,
  "confidence": 0.0,
  "source": "none",
  "reasoning": "No suitable entity found in knowledge graph"
}

Be conservative with matches - only suggest values when confidence is reasonably high (>0.6).`;

    super(
      'EntityMatcher',
      AgentType.RECOMMENDER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.3,
        max_tokens: 500,
      }
    );
  }

  async execute(input: EntityMatcherInput): Promise<EntityMatch> {
    try {
      const { placeholderId, fieldName, fieldType, knowledgeGraphEntities } = input;

      if (!placeholderId || !fieldName) {
        throw new Error('placeholderId and fieldName are required');
      }

      // If no entities available, return no match
      if (!knowledgeGraphEntities || knowledgeGraphEntities.length === 0) {
        return {
          suggestedValue: null as any,
          confidence: 0.0,
          source: 'none',
          reasoning: 'No entities available in knowledge graph'
        };
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildMatchPrompt(fieldName, fieldType, knowledgeGraphEntities);
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const match = this.parseMatchResponse(response.content);

      return match;
    } catch (error) {
      console.error('EntityMatcher error:', error);

      // Return no match if matching fails
      return {
        suggestedValue: null as any,
        confidence: 0.0,
        source: 'error',
        reasoning: 'Entity matching failed'
      };
    }
  }

  private buildMatchPrompt(
    fieldName: string,
    fieldType: string,
    entities: Array<{ entityType: string; entityValue: string; sourceDocument: string; confidence: number }>
  ): string {
    const entitiesSummary = entities.map((e, idx) =>
      `${idx + 1}. Type: ${e.entityType}, Value: "${e.entityValue}", Source: ${e.sourceDocument}, Confidence: ${e.confidence}`
    ).join('\n');

    return `Find the best match for this placeholder:
Field Name: "${fieldName}"
Field Type: ${fieldType}

Available entities from knowledge graph:
${entitiesSummary}

Which entity (if any) should be suggested for this field?`;
  }

  private parseMatchResponse(content: string): EntityMatch {
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
      if (typeof parsed.confidence !== 'number' || !parsed.source || !parsed.reasoning) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Ensure confidence is between 0 and 1
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

      // Handle null suggestedValue
      if (parsed.suggestedValue === null || parsed.suggestedValue === undefined) {
        parsed.suggestedValue = null;
      }

      return parsed as EntityMatch;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse entity match response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
