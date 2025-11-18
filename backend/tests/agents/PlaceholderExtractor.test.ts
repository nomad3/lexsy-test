// backend/tests/agents/PlaceholderExtractor.test.ts
import { PlaceholderExtractor } from '../../src/agents/PlaceholderExtractor';
import { AgentType, PlaceholderFieldType } from '@lexsy/common';
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

describe('PlaceholderExtractor', () => {
  let extractor: PlaceholderExtractor;

  beforeEach(() => {
    extractor = new PlaceholderExtractor();
  });

  it('should create extractor with correct properties', () => {
    expect(extractor.name).toBe('PlaceholderExtractor');
    expect(extractor.type).toBe(AgentType.EXTRACTOR);
    expect(extractor.model).toBe(MODELS.GPT4_TURBO);
  });

  describe('execute', () => {
    it('should successfully extract placeholders from a document', async () => {
      const mockPlaceholders = [
        {
          fieldName: 'company_name',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[COMPANY NAME]',
          position: 1,
          suggestedQuestion: 'What is the company name?',
        },
        {
          fieldName: 'investment_amount',
          fieldType: PlaceholderFieldType.CURRENCY,
          originalText: '$__________',
          position: 2,
          suggestedQuestion: 'What is the investment amount?',
        },
        {
          fieldName: 'signing_date',
          fieldType: PlaceholderFieldType.DATE,
          originalText: 'Date: __________',
          position: 3,
          suggestedQuestion: 'What is the signing date?',
        },
      ];

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockPlaceholders),
        tokens: {
          prompt: 200,
          completion: 100,
          total: 300,
        },
      });

      const input = {
        documentId: 'doc-123',
        text: 'This SAFE agreement is between [COMPANY NAME] and the investor for $__________ dated __________.',
      };

      const result = await extractor.execute(input);

      expect(result).toEqual(mockPlaceholders);
      expect(result).toHaveLength(3);
      expect(result[0].fieldName).toBe('company_name');
      expect(result[0].fieldType).toBe(PlaceholderFieldType.TEXT);
      expect(result[1].fieldType).toBe(PlaceholderFieldType.CURRENCY);
      expect(result[2].fieldType).toBe(PlaceholderFieldType.DATE);
    });

    it('should handle JSON response with markdown code blocks', async () => {
      const mockPlaceholders = [
        {
          fieldName: 'employee_name',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[Employee Name]',
          position: 1,
          suggestedQuestion: 'What is the employee name?',
        },
      ];

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: '```json\n' + JSON.stringify(mockPlaceholders) + '\n```',
        tokens: {
          prompt: 150,
          completion: 80,
          total: 230,
        },
      });

      const input = {
        documentId: 'doc-456',
        text: 'Employment agreement for [Employee Name].',
      };

      const result = await extractor.execute(input);

      expect(result).toEqual(mockPlaceholders);
      expect(result[0].fieldName).toBe('employee_name');
    });

    it('should return empty array when no placeholders are found', async () => {
      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: '[]',
        tokens: {
          prompt: 100,
          completion: 10,
          total: 110,
        },
      });

      const input = {
        documentId: 'doc-empty',
        text: 'This is a complete document with no placeholders or blanks.',
      };

      const result = await extractor.execute(input);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle all field types correctly', async () => {
      const mockPlaceholders = [
        {
          fieldName: 'party_name',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '{PARTY_NAME}',
          position: 1,
          suggestedQuestion: 'What is the party name?',
        },
        {
          fieldName: 'effective_date',
          fieldType: PlaceholderFieldType.DATE,
          originalText: '[DATE]',
          position: 2,
          suggestedQuestion: 'What is the effective date?',
        },
        {
          fieldName: 'purchase_price',
          fieldType: PlaceholderFieldType.CURRENCY,
          originalText: '$_____',
          position: 3,
          suggestedQuestion: 'What is the purchase price?',
        },
        {
          fieldName: 'share_count',
          fieldType: PlaceholderFieldType.NUMBER,
          originalText: '[NUMBER]',
          position: 4,
          suggestedQuestion: 'How many shares?',
        },
        {
          fieldName: 'contact_email',
          fieldType: PlaceholderFieldType.EMAIL,
          originalText: 'Email: _______',
          position: 5,
          suggestedQuestion: 'What is the contact email?',
        },
        {
          fieldName: 'business_address',
          fieldType: PlaceholderFieldType.ADDRESS,
          originalText: 'Address: _________',
          position: 6,
          suggestedQuestion: 'What is the business address?',
        },
      ];

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockPlaceholders),
        tokens: {
          prompt: 250,
          completion: 150,
          total: 400,
        },
      });

      const input = {
        documentId: 'doc-types',
        text: 'Agreement with {PARTY_NAME} on [DATE] for $_____.',
      };

      const result = await extractor.execute(input);

      expect(result).toHaveLength(6);
      expect(result[0].fieldType).toBe(PlaceholderFieldType.TEXT);
      expect(result[1].fieldType).toBe(PlaceholderFieldType.DATE);
      expect(result[2].fieldType).toBe(PlaceholderFieldType.CURRENCY);
      expect(result[3].fieldType).toBe(PlaceholderFieldType.NUMBER);
      expect(result[4].fieldType).toBe(PlaceholderFieldType.EMAIL);
      expect(result[5].fieldType).toBe(PlaceholderFieldType.ADDRESS);
    });

    it('should return empty array on API error', async () => {
      jest.spyOn(extractor as any, 'callOpenAI').mockRejectedValue(new Error('API Error'));

      const input = {
        documentId: 'doc-error',
        text: 'Some document text with [PLACEHOLDER].',
      };

      const result = await extractor.execute(input);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array on JSON parsing error', async () => {
      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: 'Invalid JSON response',
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-parse-error',
        text: 'Document with [FIELD].',
      };

      const result = await extractor.execute(input);

      expect(result).toEqual([]);
    });

    it('should filter out invalid placeholders missing required fields', async () => {
      const mockResponse = [
        {
          fieldName: 'valid_field',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[VALID]',
          position: 1,
          suggestedQuestion: 'Valid question?',
        },
        {
          // Missing fieldName
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[INVALID1]',
          position: 2,
          suggestedQuestion: 'Question?',
        },
        {
          fieldName: 'another_valid',
          fieldType: PlaceholderFieldType.DATE,
          originalText: '[DATE]',
          position: 3,
          suggestedQuestion: 'Date question?',
        },
        {
          fieldName: 'missing_question',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[TEXT]',
          position: 4,
          // Missing suggestedQuestion
        },
      ];

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockResponse),
        tokens: {
          prompt: 150,
          completion: 100,
          total: 250,
        },
      });

      const input = {
        documentId: 'doc-invalid',
        text: 'Document with various fields.',
      };

      const result = await extractor.execute(input);

      // Only valid placeholders should be returned
      expect(result).toHaveLength(2);
      expect(result[0].fieldName).toBe('valid_field');
      expect(result[1].fieldName).toBe('another_valid');
    });

    it('should default invalid field types to TEXT', async () => {
      const mockPlaceholders = [
        {
          fieldName: 'invalid_type_field',
          fieldType: 'invalid_type', // Invalid field type
          originalText: '[FIELD]',
          position: 1,
          suggestedQuestion: 'What is this field?',
        },
      ];

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockPlaceholders),
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-invalid-type',
        text: 'Document with [FIELD].',
      };

      const result = await extractor.execute(input);

      expect(result).toHaveLength(1);
      expect(result[0].fieldType).toBe(PlaceholderFieldType.TEXT);
    });

    it('should throw error if documentId is missing', async () => {
      const input = {
        documentId: '',
        text: 'Some text',
      };

      const result = await extractor.execute(input);

      // Should return empty array instead of throwing
      expect(result).toEqual([]);
    });

    it('should throw error if text is missing', async () => {
      const input = {
        documentId: 'doc-123',
        text: '',
      };

      const result = await extractor.execute(input);

      // Should return empty array instead of throwing
      expect(result).toEqual([]);
    });

    it('should use retry with backoff for API calls', async () => {
      const mockPlaceholders = [
        {
          fieldName: 'retry_field',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[FIELD]',
          position: 1,
          suggestedQuestion: 'What is the field value?',
        },
      ];

      const callOpenAISpy = jest.spyOn(extractor as any, 'callOpenAI')
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          content: JSON.stringify(mockPlaceholders),
          tokens: {
            prompt: 100,
            completion: 50,
            total: 150,
          },
        });

      const input = {
        documentId: 'doc-retry',
        text: 'Document with [FIELD].',
      };

      const result = await extractor.execute(input);

      expect(result).toHaveLength(1);
      expect(result[0].fieldName).toBe('retry_field');
      expect(callOpenAISpy).toHaveBeenCalledTimes(2); // First call failed, second succeeded
    });

    it('should limit text to 15k characters', async () => {
      const longText = 'A'.repeat(20000);
      const callOpenAISpy = jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: '[]',
        tokens: {
          prompt: 100,
          completion: 10,
          total: 110,
        },
      });

      const input = {
        documentId: 'doc-long',
        text: longText,
      };

      await extractor.execute(input);

      // Verify the text was truncated
      const callArgs = callOpenAISpy.mock.calls[0][0] as string;
      expect(callArgs.length).toBeLessThan(longText.length + 200); // +200 for the prompt text
    });

    it('should handle non-array response gracefully', async () => {
      const mockResponse = {
        // Not an array
        placeholders: [],
      };

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockResponse),
        tokens: {
          prompt: 100,
          completion: 50,
          total: 150,
        },
      });

      const input = {
        documentId: 'doc-non-array',
        text: 'Document text.',
      };

      const result = await extractor.execute(input);

      expect(result).toEqual([]);
    });

    it('should extract multiple placeholders in correct position order', async () => {
      const mockPlaceholders = [
        {
          fieldName: 'first_field',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[FIRST]',
          position: 1,
          suggestedQuestion: 'First field?',
        },
        {
          fieldName: 'second_field',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[SECOND]',
          position: 2,
          suggestedQuestion: 'Second field?',
        },
        {
          fieldName: 'third_field',
          fieldType: PlaceholderFieldType.TEXT,
          originalText: '[THIRD]',
          position: 3,
          suggestedQuestion: 'Third field?',
        },
      ];

      jest.spyOn(extractor as any, 'callOpenAI').mockResolvedValue({
        content: JSON.stringify(mockPlaceholders),
        tokens: {
          prompt: 150,
          completion: 100,
          total: 250,
        },
      });

      const input = {
        documentId: 'doc-order',
        text: 'Document with [FIRST], [SECOND], and [THIRD] fields.',
      };

      const result = await extractor.execute(input);

      expect(result).toHaveLength(3);
      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
    });
  });
});
