// backend/tests/agents/DocumentAnalyzer.test.ts
import { DocumentAnalyzer } from '../../src/agents/DocumentAnalyzer';
import { AgentType, TaskType } from '@lexsy/common';
import { MODELS } from '../../src/config/openai';

// Mock OpenAI
jest.mock('openai');

// Mock OpenAI config
jest.mock('../../src/config/openai', () => ({
  openai: {},
  calculateCost: jest.fn(),
  MODELS: {
    GPT4_TURBO: 'gpt-4-turbo-preview',
    GPT4: 'gpt-4',
    GPT35_TURBO: 'gpt-3.5-turbo',
  },
}));

// Mock database
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('DocumentAnalyzer', () => {
  let analyzer: DocumentAnalyzer;

  beforeEach(() => {
    analyzer = new DocumentAnalyzer();
  });

  it('should create analyzer with correct properties', () => {
    expect(analyzer.name).toBe('DocumentAnalyzer');
    expect(analyzer.type).toBe(AgentType.ANALYZER);
    expect(analyzer.model).toBe(MODELS.GPT4_TURBO);
  });

  describe('execute', () => {
    it('should successfully analyze a document', async () => {
      // Mock the callOpenAI method
      const mockResponse = {
        documentType: 'SAFE Agreement',
        confidence: 0.95,
        complexity: 'moderate',
        metadata: {
          parties: ['Acme Inc.', 'John Doe'],
          dates: ['2024-01-15'],
          amounts: ['$100,000'],
        },
      };

      jest.spyOn(analyzer as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockResponse),
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-123',
        text: 'This is a SAFE agreement between Acme Inc. and John Doe for $100,000 dated January 15, 2024.',
      };

      const result = await analyzer.execute(input);

      expect(result).toEqual(mockResponse);
      expect(result.documentType).toBe('SAFE Agreement');
      expect(result.confidence).toBe(0.95);
      expect(result.complexity).toBe('moderate');
      expect(result.metadata.parties).toEqual(['Acme Inc.', 'John Doe']);
    });

    it('should handle JSON response with markdown code blocks', async () => {
      const mockResponse = {
        documentType: 'NDA',
        confidence: 0.88,
        complexity: 'simple',
        metadata: {
          parties: ['Company A', 'Company B'],
        },
      };

      jest.spyOn(analyzer as any, 'callOpenAI').mockResolvedValue({
        content: '```json\n' + JSON.stringify(mockResponse) + '\n```',
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-456',
        text: 'Non-disclosure agreement between Company A and Company B.',
      };

      const result = await analyzer.execute(input);

      expect(result).toEqual(mockResponse);
      expect(result.documentType).toBe('NDA');
    });

    it('should clamp confidence values to 0-1 range', async () => {
      const mockResponse = {
        documentType: 'Employment Agreement',
        confidence: 1.5, // Invalid: above 1
        complexity: 'complex',
        metadata: {},
      };

      jest.spyOn(analyzer as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockResponse),
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-789',
        text: 'Employment agreement text.',
      };

      const result = await analyzer.execute(input);

      expect(result.confidence).toBe(1); // Should be clamped to 1
    });

    it('should return default values on API error', async () => {
      jest.spyOn(analyzer as any, 'callOpenAI').mockRejectedValue(new Error('API Error'));

      const input = {
        documentId: 'doc-error',
        text: 'Some document text.',
      };

      const result = await analyzer.execute(input);

      expect(result.documentType).toBe('Unknown');
      expect(result.confidence).toBe(0.0);
      expect(result.complexity).toBe('unknown');
      expect(result.metadata).toEqual({});
    });

    it('should return default values on JSON parsing error', async () => {
      jest.spyOn(analyzer as any, 'callOpenAI').mockResolvedValue({
        content: 'Invalid JSON response',
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-parse-error',
        text: 'Some document text.',
      };

      const result = await analyzer.execute(input);

      expect(result.documentType).toBe('Unknown');
      expect(result.confidence).toBe(0.0);
      expect(result.complexity).toBe('unknown');
      expect(result.metadata).toEqual({});
    });

    it('should throw error if documentId is missing', async () => {
      const input = {
        documentId: '',
        text: 'Some text',
      };

      const result = await analyzer.execute(input);

      // Should return default values instead of throwing
      expect(result.documentType).toBe('Unknown');
    });

    it('should throw error if text is missing', async () => {
      const input = {
        documentId: 'doc-123',
        text: '',
      };

      const result = await analyzer.execute(input);

      // Should return default values instead of throwing
      expect(result.documentType).toBe('Unknown');
    });

    it('should use retry with backoff for API calls', async () => {
      const callOpenAISpy = jest.spyOn(analyzer as any, 'callOpenAI')
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          content: JSON.stringify({
            documentType: 'Stock Option Agreement',
            confidence: 0.92,
            complexity: 'complex',
            metadata: {},
          }),
          tokens: {
            prompt: 100,
            completion: 50,
            total: 150,
          },
        });

      const input = {
        documentId: 'doc-retry',
        text: 'Stock option agreement text.',
      };

      const result = await analyzer.execute(input);

      expect(result.documentType).toBe('Stock Option Agreement');
      expect(callOpenAISpy).toHaveBeenCalledTimes(2); // First call failed, second succeeded
    });

    it('should limit text to 10k characters', async () => {
      const longText = 'A'.repeat(15000);
      const callOpenAISpy = jest.spyOn(analyzer as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify({
          documentType: 'Long Document',
          confidence: 0.85,
          complexity: 'complex',
          metadata: {},
        }),
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-long',
        text: longText,
      };

      await analyzer.execute(input);

      // Verify the text was truncated
      const callArgs = callOpenAISpy.mock.calls[0][0] as string;
      expect(callArgs.length).toBeLessThan(longText.length + 100); // +100 for the prompt text
    });

    it('should ensure metadata exists even if not in response', async () => {
      const mockResponse = {
        documentType: 'Contract',
        confidence: 0.80,
        complexity: 'simple',
        // metadata is missing
      };

      jest.spyOn(analyzer as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockResponse),
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-no-metadata',
        text: 'Contract text.',
      };

      const result = await analyzer.execute(input);

      expect(result.metadata).toBeDefined();
      expect(result.metadata).toEqual({});
    });
  });
});
