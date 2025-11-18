// backend/src/agents/TemplateAnalyzer.ts
import { BaseAgent } from './BaseAgent';
import { AgentType, PlaceholderFieldType } from '@lexsy/common';
import { MODELS } from '../config/openai';

interface TemplateAnalyzerInput {
  templateId: string;
  text: string;
  templateName: string;
}

export interface TemplateAnalysis {
  documentType: string;
  category: string;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedFillTime: number; // in minutes
  placeholders: Array<{
    fieldName: string;
    fieldType: PlaceholderFieldType;
    originalText: string;
    position: number;
    required: boolean;
    defaultValue?: string;
    validationRules?: string[];
  }>;
  sections: Array<{
    name: string;
    order: number;
    placeholderCount: number;
  }>;
  metadata: {
    parties?: string[];
    jurisdiction?: string;
    legalArea?: string;
    commonUseCase?: string;
    [key: string]: any;
  };
  tags: string[];
}

export class TemplateAnalyzer extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert legal document template analyzer. Your task is to comprehensively analyze document templates to extract structure, placeholders, and metadata for pre-processing.

Analyze the provided template and extract:

1. Document Classification:
   - Document type (e.g., SAFE Agreement, NDA, Employment Contract)
   - Category (e.g., Investment, Corporate, Employment, IP)
   - Brief description
   - Complexity level (simple, moderate, complex)
   - Estimated time to fill in minutes

2. All Placeholders:
   - Field name (descriptive, lowercase with underscores)
   - Field type (text, date, currency, number, email, address)
   - Original placeholder text exactly as it appears
   - Position in document (1-indexed)
   - Whether the field is required (true/false)
   - Default value if applicable
   - Validation rules if applicable (e.g., "must be positive", "valid email format")

3. Document Structure:
   - Section names and order
   - Number of placeholders per section

4. Metadata:
   - Parties involved (if template specifies roles)
   - Jurisdiction (if mentioned)
   - Legal area (contract law, employment law, IP law, etc.)
   - Common use case description
   - Other relevant metadata

5. Tags:
   - Searchable keywords for categorization

Respond ONLY with valid JSON in this exact format:
{
  "documentType": "SAFE Agreement",
  "category": "Investment",
  "description": "Simple Agreement for Future Equity - standard Y Combinator SAFE",
  "complexity": "moderate",
  "estimatedFillTime": 15,
  "placeholders": [
    {
      "fieldName": "company_name",
      "fieldType": "text",
      "originalText": "[COMPANY NAME]",
      "position": 1,
      "required": true,
      "validationRules": ["not_empty"]
    }
  ],
  "sections": [
    {
      "name": "Parties and Definitions",
      "order": 1,
      "placeholderCount": 5
    }
  ],
  "metadata": {
    "parties": ["Company", "Investor"],
    "jurisdiction": "Delaware",
    "legalArea": "Securities Law",
    "commonUseCase": "Early-stage startup fundraising"
  },
  "tags": ["investment", "equity", "startup", "fundraising", "safe"]
}

Be thorough and precise. This analysis will be used for template pre-processing to improve user experience.`;

    super(
      'TemplateAnalyzer',
      AgentType.ANALYZER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.2, // Low temperature for consistent analysis
        max_tokens: 3000,
      }
    );
  }

  async execute(input: TemplateAnalyzerInput): Promise<TemplateAnalysis> {
    try {
      const { templateId, text, templateName } = input;

      if (!templateId || !text) {
        throw new Error('templateId and text are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = `Analyze the following legal document template:\n\nTemplate Name: ${templateName || 'Untitled'}\n\n${text.slice(0, 15000)}`; // Limit to 15k chars
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const analysis = this.parseTemplateResponse(response.content);

      return analysis;
    } catch (error) {
      console.error('TemplateAnalyzer error:', error);

      // Return default analysis if processing fails
      return {
        documentType: 'Unknown',
        category: 'Other',
        description: 'Template analysis failed',
        complexity: 'moderate',
        estimatedFillTime: 30,
        placeholders: [],
        sections: [],
        metadata: {},
        tags: []
      };
    }
  }

  private parseTemplateResponse(content: string): TemplateAnalysis {
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
        !parsed.documentType ||
        !parsed.category ||
        !parsed.description ||
        !parsed.complexity ||
        typeof parsed.estimatedFillTime !== 'number' ||
        !Array.isArray(parsed.placeholders) ||
        !Array.isArray(parsed.sections) ||
        !parsed.metadata ||
        !Array.isArray(parsed.tags)
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Validate complexity
      const validComplexities = ['simple', 'moderate', 'complex'];
      if (!validComplexities.includes(parsed.complexity)) {
        parsed.complexity = 'moderate';
      }

      // Validate placeholders
      const validFieldTypes = Object.values(PlaceholderFieldType);
      parsed.placeholders = parsed.placeholders.map((p: any) => {
        if (!validFieldTypes.includes(p.fieldType)) {
          p.fieldType = PlaceholderFieldType.TEXT;
        }
        if (typeof p.required !== 'boolean') {
          p.required = true; // Default to required
        }
        return p;
      });

      // Ensure estimatedFillTime is positive
      parsed.estimatedFillTime = Math.max(1, Math.round(parsed.estimatedFillTime));

      return parsed as TemplateAnalysis;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse template analysis response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
