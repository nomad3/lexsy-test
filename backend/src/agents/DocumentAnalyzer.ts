// backend/src/agents/DocumentAnalyzer.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@smartdocs/common';
import { MODELS } from '../config/openai';

interface DocumentAnalyzerInput {
  documentId: string;
  text: string;
}

interface DocumentAnalysis {
  documentType: string;
  confidence: number;
  complexity: string;
  metadata: {
    parties?: string[];
    dates?: string[];
    amounts?: string[];
    [key: string]: any;
  };
}

export class DocumentAnalyzer extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert legal document analyzer. Your task is to analyze legal documents and extract key information.

Analyze the provided document text and identify:
1. Document type (e.g., SAFE Agreement, NDA, Employment Agreement, Stock Option Agreement, etc.)
2. Your confidence level in the classification (0-1 scale)
3. Document complexity (simple, moderate, complex)
4. Key metadata including:
   - Parties involved (names of individuals or companies)
   - Important dates (signing date, effective date, expiration date, etc.)
   - Monetary amounts (if visible)
   - Any other relevant document-specific information

Respond ONLY with valid JSON in this exact format:
{
  "documentType": "document type here",
  "confidence": 0.95,
  "complexity": "moderate",
  "metadata": {
    "parties": ["Party A", "Party B"],
    "dates": ["2024-01-15"],
    "amounts": ["$100,000"],
    "additionalInfo": "any other relevant details"
  }
}

Be precise and thorough. If information is not clearly visible, omit it from the metadata or use empty arrays.`;

    super(
      'DocumentAnalyzer',
      AgentType.ANALYZER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1500,
      }
    );
  }

  async execute(input: DocumentAnalyzerInput): Promise<DocumentAnalysis> {
    try {
      const { documentId, text } = input;

      if (!documentId || !text) {
        throw new Error('documentId and text are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = `Analyze the following legal document:\n\n${text.slice(0, 10000)}`; // Limit text to 10k chars
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const analysis = this.parseAnalysisResponse(response.content);

      return analysis;
    } catch (error) {
      console.error('DocumentAnalyzer error:', error);

      // Return default values if analysis fails
      return {
        documentType: 'Unknown',
        confidence: 0.0,
        complexity: 'unknown',
        metadata: {},
      };
    }
  }

  private parseAnalysisResponse(content: string): DocumentAnalysis {
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
      if (!parsed.documentType || typeof parsed.confidence !== 'number' || !parsed.complexity) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Ensure confidence is between 0 and 1
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

      // Ensure metadata exists
      if (!parsed.metadata) {
        parsed.metadata = {};
      }

      return parsed as DocumentAnalysis;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse analysis response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
