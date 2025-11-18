import { DocumentService } from '../../src/services/DocumentService';
import { AIAgentService } from '../../src/services/AIAgentService';
import { parseDocx } from '../../src/utils/docxParser';
import { DocumentStatus, TaskStatus, TaskType, ValidationStatus } from '@lexsy/common';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
jest.mock('../../src/utils/docxParser');
jest.mock('../../src/services/AIAgentService');

// Mock database with a factory function
jest.mock('../../src/config/knex', () => {
  const mockDbChain = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
  };

  const mockDbFunction = jest.fn(() => mockDbChain);
  Object.assign(mockDbFunction, mockDbChain);

  return { db: mockDbFunction };
});

// Import mocked db to access it in tests
import { db as mockDb } from '../../src/config/knex';

const mockDbChain = mockDb as any;

describe('DocumentService', () => {
  let documentService: DocumentService;
  let mockAIAgentService: jest.Mocked<AIAgentService>;

  const testUserId = 'test-user-id';
  const testFilesDir = path.join(__dirname, '../fixtures/uploads');

  beforeAll(() => {
    // Ensure test fixtures directory exists
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock AIAgentService instance
    mockAIAgentService = new AIAgentService() as jest.Mocked<AIAgentService>;
    (AIAgentService as jest.MockedClass<typeof AIAgentService>).mockImplementation(() => mockAIAgentService);

    // Create DocumentService instance
    documentService = new DocumentService();
  });

  afterAll(() => {
    // Clean up test files directory
    if (fs.existsSync(testFilesDir)) {
      const files = fs.readdirSync(testFilesDir);
      files.forEach(file => {
        const filePath = path.join(testFilesDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(testFilesDir);
    }
  });

  describe('uploadDocument', () => {
    it('should upload a document and store in database', async () => {
      const mockFile = {
        originalname: 'test-doc.docx',
        path: path.join(testFilesDir, 'test-doc.docx'),
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024,
      } as Express.Multer.File;

      // Create mock file
      fs.writeFileSync(mockFile.path, 'mock content');

      // Mock database responses
      mockDbChain.first.mockResolvedValueOnce({ id: testUserId, email: 'test@example.com' });
      mockDbChain.returning.mockResolvedValueOnce([{
        id: 'doc-123',
        user_id: testUserId,
        filename: 'test-doc.docx',
        file_path: mockFile.path,
        status: DocumentStatus.UPLOADED,
        upload_date: new Date(),
        completion_percentage: 0,
        metadata: {},
      }]);

      const document = await documentService.uploadDocument(testUserId, mockFile);

      expect(document).toBeDefined();
      expect(document.filename).toBe('test-doc.docx');
      expect(document.userId).toBe(testUserId);
      expect(document.status).toBe(DocumentStatus.UPLOADED);
      expect(document.id).toBeDefined();

      // Clean up
      fs.unlinkSync(mockFile.path);
    });

    it('should throw error if user does not exist', async () => {
      const mockFile = {
        originalname: 'test-doc.docx',
        path: path.join(testFilesDir, 'test-doc2.docx'),
      } as Express.Multer.File;

      fs.writeFileSync(mockFile.path, 'mock content');

      // Mock database response - user not found
      mockDbChain.first.mockResolvedValueOnce(undefined);

      await expect(
        documentService.uploadDocument('non-existent-user', mockFile)
      ).rejects.toThrow('User not found');

      // Clean up
      fs.unlinkSync(mockFile.path);
    });

    it('should throw error if file is missing', async () => {
      await expect(
        documentService.uploadDocument(testUserId, null as any)
      ).rejects.toThrow('File is required');
    });
  });

  describe('analyzeDocument', () => {
    const documentId = 'doc-123';
    const mockFilePath = path.join(testFilesDir, 'test-analyze.docx');

    beforeEach(() => {
      // Create mock file
      fs.writeFileSync(mockFilePath, 'mock content');
    });

    afterEach(() => {
      // Clean up
      if (fs.existsSync(mockFilePath)) {
        fs.unlinkSync(mockFilePath);
      }
    });

    it('should analyze document and update status', async () => {
      const mockText = 'Sample legal document text for analysis';
      (parseDocx as jest.Mock).mockResolvedValue(mockText);

      // Mock database responses
      mockDbChain.first.mockResolvedValueOnce({
        id: documentId,
        user_id: testUserId,
        filename: 'test-analyze.docx',
        file_path: mockFilePath,
        status: DocumentStatus.UPLOADED,
      });

      const mockAnalysisTask = {
        id: 'task-123',
        agentId: 'agent-123',
        taskType: TaskType.ANALYZE_DOCUMENT,
        inputData: { documentId, text: mockText },
        outputData: {
          documentType: 'NDA',
          confidence: 0.95,
          complexity: 'moderate',
          metadata: { parties: ['Company A', 'Company B'] },
        },
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockAIAgentService.runAgent = jest.fn().mockResolvedValue(mockAnalysisTask);

      const analysis = await documentService.analyzeDocument(documentId, testUserId);

      expect(analysis).toBeDefined();
      expect(analysis.documentType).toBe('NDA');
      expect(analysis.confidence).toBe(0.95);
      expect(parseDocx).toHaveBeenCalledWith(mockFilePath);
      expect(mockAIAgentService.runAgent).toHaveBeenCalledWith('DocumentAnalyzer', {
        documentId,
        text: mockText,
      });

      // Verify update was called
      expect(mockDbChain.update).toHaveBeenCalled();
    });

    it('should throw error if document does not exist', async () => {
      // Mock database response - document not found
      mockDbChain.first.mockResolvedValueOnce(undefined);

      await expect(
        documentService.analyzeDocument('non-existent-doc', testUserId)
      ).rejects.toThrow('Document not found');
    });

    it('should throw error if user does not own document', async () => {
      // Mock database response - document not found (due to user mismatch)
      mockDbChain.first.mockResolvedValueOnce(undefined);

      await expect(
        documentService.analyzeDocument(documentId, 'other-user-id')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('extractPlaceholders', () => {
    const documentId = 'doc-456';
    const mockFilePath = path.join(testFilesDir, 'test-extract.docx');

    beforeEach(() => {
      // Create mock file
      fs.writeFileSync(mockFilePath, 'mock content');
    });

    afterEach(() => {
      // Clean up
      if (fs.existsSync(mockFilePath)) {
        fs.unlinkSync(mockFilePath);
      }
    });

    it('should extract placeholders and store in database', async () => {
      const mockText = 'Document with [PLACEHOLDER1] and [PLACEHOLDER2]';
      (parseDocx as jest.Mock).mockResolvedValue(mockText);

      // Mock database responses
      mockDbChain.first.mockResolvedValueOnce({
        id: documentId,
        user_id: testUserId,
        filename: 'test-extract.docx',
        file_path: mockFilePath,
        status: DocumentStatus.READY,
      });

      const mockExtractionTask = {
        id: 'task-456',
        agentId: 'agent-456',
        taskType: TaskType.EXTRACT_PLACEHOLDERS,
        inputData: { documentId, text: mockText },
        outputData: {
          placeholders: [
            {
              fieldName: 'placeholder1',
              fieldType: 'text',
              originalText: '[PLACEHOLDER1]',
              position: 1,
              suggestedQuestion: 'What is placeholder1?',
            },
            {
              fieldName: 'placeholder2',
              fieldType: 'text',
              originalText: '[PLACEHOLDER2]',
              position: 2,
              suggestedQuestion: 'What is placeholder2?',
            },
          ],
        },
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockAIAgentService.runAgent = jest.fn().mockResolvedValue(mockExtractionTask);

      // Mock database inserts for placeholders
      mockDbChain.returning
        .mockResolvedValueOnce([{
          id: 'ph-1',
          document_id: documentId,
          field_name: 'placeholder1',
          field_type: 'text',
          original_text: '[PLACEHOLDER1]',
          position: 1,
          validation_status: ValidationStatus.PENDING,
          confidence: 0,
        }])
        .mockResolvedValueOnce([{
          id: 'ph-2',
          document_id: documentId,
          field_name: 'placeholder2',
          field_type: 'text',
          original_text: '[PLACEHOLDER2]',
          position: 2,
          validation_status: ValidationStatus.PENDING,
          confidence: 0,
        }]);

      const placeholders = await documentService.extractPlaceholders(documentId, testUserId);

      expect(placeholders).toHaveLength(2);
      expect(placeholders[0].fieldName).toBe('placeholder1');
      expect(placeholders[1].fieldName).toBe('placeholder2');
    });

    it('should return empty array if no placeholders found', async () => {
      const mockText = 'Document with no placeholders';
      (parseDocx as jest.Mock).mockResolvedValue(mockText);

      // Mock database responses
      mockDbChain.first.mockResolvedValueOnce({
        id: documentId,
        user_id: testUserId,
        filename: 'test-extract.docx',
        file_path: mockFilePath,
        status: DocumentStatus.READY,
      });

      const mockExtractionTask = {
        id: 'task-789',
        agentId: 'agent-456',
        taskType: TaskType.EXTRACT_PLACEHOLDERS,
        inputData: { documentId, text: mockText },
        outputData: { placeholders: [] },
        status: TaskStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockAIAgentService.runAgent = jest.fn().mockResolvedValue(mockExtractionTask);

      const placeholders = await documentService.extractPlaceholders(documentId, testUserId);

      expect(placeholders).toHaveLength(0);
    });

    it('should throw error if document does not exist', async () => {
      // Mock database response - document not found
      mockDbChain.first.mockResolvedValueOnce(undefined);

      await expect(
        documentService.extractPlaceholders('non-existent-doc', testUserId)
      ).rejects.toThrow('Document not found');
    });
  });

  describe('getDocument', () => {
    it('should retrieve document by id', async () => {
      const documentId = 'doc-789';

      // Mock database response
      mockDbChain.first.mockResolvedValueOnce({
        id: documentId,
        user_id: testUserId,
        filename: 'test.docx',
        file_path: '/path/to/test.docx',
        upload_date: new Date(),
        status: DocumentStatus.READY,
        completion_percentage: 50,
        metadata: {},
      });

      const document = await documentService.getDocument(documentId, testUserId);

      expect(document).toBeDefined();
      expect(document.id).toBe(documentId);
      expect(document.filename).toBe('test.docx');
      expect(document.userId).toBe(testUserId);
    });

    it('should throw error if document does not exist', async () => {
      // Mock database response - document not found
      mockDbChain.first.mockResolvedValueOnce(undefined);

      await expect(
        documentService.getDocument('non-existent-doc', testUserId)
      ).rejects.toThrow('Document not found');
    });

    it('should throw error if user does not own document', async () => {
      // Mock database response - document not found (due to user mismatch)
      mockDbChain.first.mockResolvedValueOnce(undefined);

      await expect(
        documentService.getDocument('doc-789', 'other-user-id')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('getDocuments', () => {
    it('should retrieve all documents for a user', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          user_id: testUserId,
          filename: 'doc1.docx',
          file_path: '/path/to/doc1.docx',
          upload_date: new Date(),
          status: DocumentStatus.READY,
          completion_percentage: 100,
          metadata: {},
        },
        {
          id: 'doc-2',
          user_id: testUserId,
          filename: 'doc2.docx',
          file_path: '/path/to/doc2.docx',
          upload_date: new Date(),
          status: DocumentStatus.UPLOADED,
          completion_percentage: 0,
          metadata: {},
        },
      ];

      // Mock database response
      mockDbChain.orderBy.mockResolvedValueOnce(mockDocuments);

      const documents = await documentService.getDocuments(testUserId);

      expect(documents).toHaveLength(2);
      expect(documents.every(doc => doc.userId === testUserId)).toBe(true);
    });

    it('should return empty array if user has no documents', async () => {
      // Mock database response - no documents
      mockDbChain.orderBy.mockResolvedValueOnce([]);

      const documents = await documentService.getDocuments('user-no-docs');

      expect(documents).toHaveLength(0);
    });
  });
});
