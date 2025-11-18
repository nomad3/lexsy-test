import { AIAgentService } from '../../src/services/AIAgentService';
import { DocumentAnalyzer } from '../../src/agents/DocumentAnalyzer';
import { PlaceholderExtractor } from '../../src/agents/PlaceholderExtractor';
import { TaskType, TaskStatus } from '@lexsy/common';

// Mock the agents
jest.mock('../../src/agents/DocumentAnalyzer');
jest.mock('../../src/agents/PlaceholderExtractor');

describe('AIAgentService', () => {
  let aiAgentService: AIAgentService;
  let mockDocumentAnalyzer: jest.Mocked<DocumentAnalyzer>;
  let mockPlaceholderExtractor: jest.Mocked<PlaceholderExtractor>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock instances
    mockDocumentAnalyzer = new DocumentAnalyzer() as jest.Mocked<DocumentAnalyzer>;
    mockPlaceholderExtractor = new PlaceholderExtractor() as jest.Mocked<PlaceholderExtractor>;

    // Mock the constructors to return our mock instances
    (DocumentAnalyzer as jest.MockedClass<typeof DocumentAnalyzer>).mockImplementation(() => mockDocumentAnalyzer);
    (PlaceholderExtractor as jest.MockedClass<typeof PlaceholderExtractor>).mockImplementation(() => mockPlaceholderExtractor);

    // Create service instance
    aiAgentService = new AIAgentService();
  });

  describe('constructor', () => {
    it('should instantiate DocumentAnalyzer', () => {
      jest.clearAllMocks();
      const service = new AIAgentService();
      expect(DocumentAnalyzer).toHaveBeenCalledTimes(1);
    });

    it('should instantiate PlaceholderExtractor', () => {
      jest.clearAllMocks();
      const service = new AIAgentService();
      expect(PlaceholderExtractor).toHaveBeenCalledTimes(1);
    });
  });

  describe('runAgent - DocumentAnalyzer', () => {
    it('should run DocumentAnalyzer for analyze_document task type', async () => {
      const input = {
        documentId: 'doc-123',
        text: 'Sample legal document text',
      };

      const mockTask = {
        id: 'task-123',
        agentId: 'agent-123',
        taskType: TaskType.ANALYZE_DOCUMENT,
        inputData: input,
        outputData: {
          documentType: 'NDA',
          confidence: 0.95,
          complexity: 'moderate',
          metadata: {},
        },
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockDocumentAnalyzer.runTask = jest.fn().mockResolvedValue(mockTask);

      const result = await aiAgentService.runAgent('DocumentAnalyzer', input);

      expect(mockDocumentAnalyzer.runTask).toHaveBeenCalledWith(TaskType.ANALYZE_DOCUMENT, input);
      expect(result).toEqual(mockTask);
    });

    it('should throw error if DocumentAnalyzer task fails', async () => {
      const input = {
        documentId: 'doc-123',
        text: 'Sample text',
      };

      const error = new Error('Analysis failed');
      mockDocumentAnalyzer.runTask = jest.fn().mockRejectedValue(error);

      await expect(aiAgentService.runAgent('DocumentAnalyzer', input)).rejects.toThrow('Analysis failed');
    });
  });

  describe('runAgent - PlaceholderExtractor', () => {
    it('should run PlaceholderExtractor for extract_placeholders task type', async () => {
      const input = {
        documentId: 'doc-123',
        text: 'Sample document with [PLACEHOLDER]',
      };

      const mockTask = {
        id: 'task-456',
        agentId: 'agent-456',
        taskType: TaskType.EXTRACT_PLACEHOLDERS,
        inputData: input,
        outputData: {
          placeholders: [
            {
              fieldName: 'placeholder',
              fieldType: 'text',
              originalText: '[PLACEHOLDER]',
              position: 1,
              suggestedQuestion: 'What is the placeholder value?',
            },
          ],
        },
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockPlaceholderExtractor.runTask = jest.fn().mockResolvedValue(mockTask);

      const result = await aiAgentService.runAgent('PlaceholderExtractor', input);

      expect(mockPlaceholderExtractor.runTask).toHaveBeenCalledWith(TaskType.EXTRACT_PLACEHOLDERS, input);
      expect(result).toEqual(mockTask);
    });

    it('should throw error if PlaceholderExtractor task fails', async () => {
      const input = {
        documentId: 'doc-123',
        text: 'Sample text',
      };

      const error = new Error('Extraction failed');
      mockPlaceholderExtractor.runTask = jest.fn().mockRejectedValue(error);

      await expect(aiAgentService.runAgent('PlaceholderExtractor', input)).rejects.toThrow('Extraction failed');
    });
  });

  describe('runAgent - Invalid Agent', () => {
    it('should throw error for unknown agent name', async () => {
      const input = { test: 'data' };

      await expect(aiAgentService.runAgent('UnknownAgent', input)).rejects.toThrow('Unknown agent: UnknownAgent');
    });

    it('should throw error for empty agent name', async () => {
      const input = { test: 'data' };

      await expect(aiAgentService.runAgent('', input)).rejects.toThrow('Agent name is required');
    });
  });

  describe('runAgent - Multiple Executions', () => {
    it('should handle multiple sequential DocumentAnalyzer calls', async () => {
      const mockTask1 = {
        id: 'task-1',
        agentId: 'agent-123',
        taskType: TaskType.ANALYZE_DOCUMENT,
        inputData: {},
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
      };

      const mockTask2 = {
        id: 'task-2',
        agentId: 'agent-123',
        taskType: TaskType.ANALYZE_DOCUMENT,
        inputData: {},
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
      };

      mockDocumentAnalyzer.runTask = jest.fn()
        .mockResolvedValueOnce(mockTask1)
        .mockResolvedValueOnce(mockTask2);

      const result1 = await aiAgentService.runAgent('DocumentAnalyzer', { documentId: 'doc-1', text: 'text1' });
      const result2 = await aiAgentService.runAgent('DocumentAnalyzer', { documentId: 'doc-2', text: 'text2' });

      expect(result1.id).toBe('task-1');
      expect(result2.id).toBe('task-2');
      expect(mockDocumentAnalyzer.runTask).toHaveBeenCalledTimes(2);
    });

    it('should handle alternating calls to different agents', async () => {
      const mockAnalysisTask = {
        id: 'task-analysis',
        agentId: 'agent-123',
        taskType: TaskType.ANALYZE_DOCUMENT,
        inputData: {},
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
      };

      const mockExtractionTask = {
        id: 'task-extraction',
        agentId: 'agent-456',
        taskType: TaskType.EXTRACT_PLACEHOLDERS,
        inputData: {},
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
      };

      mockDocumentAnalyzer.runTask = jest.fn().mockResolvedValue(mockAnalysisTask);
      mockPlaceholderExtractor.runTask = jest.fn().mockResolvedValue(mockExtractionTask);

      const result1 = await aiAgentService.runAgent('DocumentAnalyzer', { documentId: 'doc-1', text: 'text1' });
      const result2 = await aiAgentService.runAgent('PlaceholderExtractor', { documentId: 'doc-1', text: 'text1' });

      expect(result1.id).toBe('task-analysis');
      expect(result2.id).toBe('task-extraction');
      expect(mockDocumentAnalyzer.runTask).toHaveBeenCalledTimes(1);
      expect(mockPlaceholderExtractor.runTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Messages', () => {
    it('should preserve original error message from agent', async () => {
      const customError = new Error('Custom agent error message');
      mockDocumentAnalyzer.runTask = jest.fn().mockRejectedValue(customError);

      await expect(
        aiAgentService.runAgent('DocumentAnalyzer', { documentId: 'doc-1', text: 'text' })
      ).rejects.toThrow('Custom agent error message');
    });
  });
});
