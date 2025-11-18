// backend/src/agents/PlaceholderExtractor.ts
import { BaseAgent } from './BaseAgent';
import { AgentType, PlaceholderFieldType } from '@lexsy/common';
import { MODELS } from '../config/openai';

interface PlaceholderExtractorInput {
  documentId: string;
  text: string;
}

export interface PlaceholderData {
  fieldName: string;
  fieldType: PlaceholderFieldType;
  originalText: string;
  position: number;
  suggestedQuestion: string;
}

export class PlaceholderExtractor extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert legal document placeholder extraction system. Your task is to identify ALL placeholders, blanks, and fillable fields in legal documents.

Analyze the provided document text and identify:
1. ALL placeholders, blanks, brackets, underscores, or fillable fields (e.g., [NAME], __________, {company}, etc.)
2. Field type for each placeholder:
   - text: General text fields (names, titles, descriptions)
   - date: Any date-related fields
   - currency: Monetary amounts or financial values
   - number: Numeric values (percentages, counts, quantities)
   - email: Email addresses
   - address: Physical addresses or locations
3. The original placeholder text exactly as it appears in the document
4. A user-friendly field name (descriptive, clear, lowercase with underscores)
5. The position/order in which the placeholder appears (starting from 1)
6. A suggested question to ask the user to fill this field

Respond ONLY with valid JSON array in this exact format:
[
  {
    "fieldName": "company_name",
    "fieldType": "text",
    "originalText": "[COMPANY NAME]",
    "position": 1,
    "suggestedQuestion": "What is the company name?"
  },
  {
    "fieldName": "investment_amount",
    "fieldType": "currency",
    "originalText": "$__________",
    "position": 2,
    "suggestedQuestion": "What is the investment amount?"
  }
]

If no placeholders are found, return an empty array: []

Be thorough and identify all possible fillable fields. Common patterns include:
- Brackets: [TEXT], {TEXT}, <TEXT>
- Underscores: __________, ___
- Explicit labels: "Name: _____", "Date: ________"
- Template variables: {{variable}}, $variable
- Blank spaces clearly meant to be filled in`;

    super(
      'PlaceholderExtractor',
      AgentType.EXTRACTOR,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.2, // Low temperature for consistent extraction
        max_tokens: 2000,
      }
    );
  }

  async execute(input: PlaceholderExtractorInput): Promise<PlaceholderData[]> {
    try {
      const { documentId, text } = input;

      if (!documentId || !text) {
        throw new Error('documentId and text are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = `Extract all placeholders from the following legal document:\n\n${text.slice(0, 15000)}`; // Limit text to 15k chars
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const placeholders = this.parsePlaceholderResponse(response.content);

      return placeholders;
    } catch (error) {
      console.error('PlaceholderExtractor error:', error);

      // Return empty array if extraction fails
      return [];
    }
  }

  private parsePlaceholderResponse(content: string): PlaceholderData[] {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);

      // Handle case where response is not an array
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate each placeholder has required fields
      const validPlaceholders = parsed.filter((placeholder: any) => {
        return (
          placeholder.fieldName &&
          placeholder.fieldType &&
          placeholder.originalText &&
          typeof placeholder.position === 'number' &&
          placeholder.suggestedQuestion
        );
      });

      // Validate field types are valid enum values
      const validatedPlaceholders = validPlaceholders.map((placeholder: any) => {
        // Ensure fieldType is a valid PlaceholderFieldType
        const validFieldTypes = Object.values(PlaceholderFieldType);
        if (!validFieldTypes.includes(placeholder.fieldType)) {
          placeholder.fieldType = PlaceholderFieldType.TEXT; // Default to TEXT if invalid
        }

        return placeholder as PlaceholderData;
      });

      return validatedPlaceholders;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse placeholder response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
