import { Document, DocumentStatus, Placeholder, PlaceholderFieldType, ValidationStatus } from '@lexsy/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/knex';
import { parseDocx } from '../utils/docxParser';
import { AIAgentService } from './AIAgentService';

export interface DocumentAnalysis {
  documentType: string;
  confidence: number;
  complexity: string;
  metadata: Record<string, any>;
}

/**
 * DocumentService
 * Handles all document-related operations including CRUD, analysis, and placeholder extraction
 */
export class DocumentService {
  private aiAgentService: AIAgentService;

  constructor() {
    this.aiAgentService = new AIAgentService();
  }

  /**
   * Upload a document to the system
   * @param userId - ID of the user uploading the document
   * @param file - Multer file object
   * @returns Promise<Document> - The created document record
   */
  async uploadDocument(userId: string, file: Express.Multer.File): Promise<Document> {
    // Validate input
    if (!file) {
      throw new Error('File is required');
    }

    // Check if user exists
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new Error('User not found');
    }

    // Create document record
    const documentId = uuidv4();
    const [dbDocument] = await db('documents').insert({
      id: documentId,
      user_id: userId,
      filename: file.originalname,
      file_path: file.path,
      status: DocumentStatus.UPLOADED,
      completion_percentage: 0,
      metadata: {},
    }).returning('*');

    return this.mapDbDocumentToDocument(dbDocument);
  }

  /**
   * Analyze a document using AI
   * @param documentId - ID of the document to analyze
   * @param userId - ID of the user requesting analysis
   * @returns Promise<DocumentAnalysis> - Analysis results
   */
  async analyzeDocument(documentId: string, userId: string): Promise<DocumentAnalysis> {
    // Get document and verify ownership
    const dbDocument = await db('documents')
      .where({ id: documentId, user_id: userId })
      .first();

    if (!dbDocument) {
      throw new Error('Document not found');
    }

    // Update status to analyzing
    await db('documents')
      .where({ id: documentId })
      .update({ status: DocumentStatus.ANALYZING });

    // Parse document text
    const text = await parseDocx(dbDocument.file_path);

    // Run analysis agent
    const analysisTask = await this.aiAgentService.runAgent('DocumentAnalyzer', {
      documentId,
      text,
    });

    const analysis = analysisTask.outputData as DocumentAnalysis;

    // Update document with analysis results
    await db('documents')
      .where({ id: documentId })
      .update({
        status: DocumentStatus.READY,
        document_type: analysis.documentType,
        ai_classification_confidence: analysis.confidence,
        metadata: JSON.stringify(analysis.metadata),
      });

    return analysis;
  }

  /**
   * Extract placeholders from a document using AI
   * @param documentId - ID of the document to extract placeholders from
   * @param userId - ID of the user requesting extraction
   * @returns Promise<Placeholder[]> - Array of extracted placeholders
   */
  async extractPlaceholders(documentId: string, userId: string): Promise<Placeholder[]> {
    // Get document and verify ownership
    const dbDocument = await db('documents')
      .where({ id: documentId, user_id: userId })
      .first();

    if (!dbDocument) {
      throw new Error('Document not found');
    }

    // Parse document text
    const text = await parseDocx(dbDocument.file_path);

    // Run placeholder extraction agent
    const extractionTask = await this.aiAgentService.runAgent('PlaceholderExtractor', {
      documentId,
      text,
    });

    const extractedData = extractionTask.outputData as { placeholders: any[] };
    const placeholdersData = extractedData.placeholders || [];

    // Store placeholders in database
    const placeholders: Placeholder[] = [];

    for (const placeholderData of placeholdersData) {
      const placeholderId = uuidv4();

      const [dbPlaceholder] = await db('placeholders').insert({
        id: placeholderId,
        document_id: documentId,
        field_name: placeholderData.fieldName,
        field_type: placeholderData.fieldType,
        original_text: placeholderData.originalText,
        position: placeholderData.position,
        validation_status: ValidationStatus.PENDING,
        confidence: 0,
      }).returning('*');

      placeholders.push(this.mapDbPlaceholderToPlaceholder(dbPlaceholder));
    }

    return placeholders;
  }

  /**
   * Get placeholders for a document
   * @param documentId - ID of the document
   * @param userId - ID of the user requesting placeholders
   * @returns Promise<Placeholder[]> - Array of placeholders
   */
  async getPlaceholders(documentId: string, userId: string): Promise<Placeholder[]> {
    // Verify document ownership
    const dbDocument = await db('documents')
      .where({ id: documentId, user_id: userId })
      .first();

    if (!dbDocument) {
      throw new Error('Document not found');
    }

    // Get placeholders from database
    const dbPlaceholders = await db('placeholders')
      .where({ document_id: documentId })
      .orderBy('position', 'asc');

    return dbPlaceholders.map(dbPlaceholder => this.mapDbPlaceholderToPlaceholder(dbPlaceholder));
  }

  /**
   * Get a single document by ID
   * @param documentId - ID of the document to retrieve
   * @param userId - ID of the user requesting the document
   * @returns Promise<Document> - The requested document
   */
  async getDocument(documentId: string, userId: string): Promise<Document> {
    const dbDocument = await db('documents')
      .where({ id: documentId, user_id: userId })
      .first();

    if (!dbDocument) {
      throw new Error('Document not found');
    }

    return this.mapDbDocumentToDocument(dbDocument);
  }

  /**
   * Get all documents for a user
   * @param userId - ID of the user
   * @returns Promise<Document[]> - Array of user's documents
   */
  async getDocuments(userId: string): Promise<Document[]> {
    const dbDocuments = await db('documents')
      .where({ user_id: userId })
      .orderBy('upload_date', 'desc');

    return dbDocuments.map(dbDoc => this.mapDbDocumentToDocument(dbDoc));
  }

  /**
   * Map database document row to Document type
   */
  private mapDbDocumentToDocument(dbDoc: any): Document {
    return {
      id: dbDoc.id,
      userId: dbDoc.user_id,
      filename: dbDoc.filename,
      originalName: dbDoc.filename,  // Use filename as originalName
      filePath: dbDoc.file_path,
      uploadDate: new Date(dbDoc.upload_date),
      createdAt: dbDoc.upload_date,  // Use upload_date as createdAt
      status: dbDoc.status as DocumentStatus,
      documentType: dbDoc.document_type || '',
      aiClassificationConfidence: dbDoc.ai_classification_confidence,
      riskScore: dbDoc.risk_score,
      completionPercentage: dbDoc.completion_percentage || 0,
      metadata: typeof dbDoc.metadata === 'string' ? JSON.parse(dbDoc.metadata) : dbDoc.metadata,
    };
  }

  /**
   * Map database placeholder row to Placeholder type
   */
  private mapDbPlaceholderToPlaceholder(dbPlaceholder: any): Placeholder {
    return {
      id: dbPlaceholder.id,
      documentId: dbPlaceholder.document_id,
      fieldName: dbPlaceholder.field_name,
      fieldType: dbPlaceholder.field_type as PlaceholderFieldType,
      originalText: dbPlaceholder.original_text,
      position: dbPlaceholder.position,
      filledValue: dbPlaceholder.filled_value,
      aiSuggestedValue: dbPlaceholder.ai_suggested_value,
      suggestionSource: dbPlaceholder.suggestion_source,
      confidence: dbPlaceholder.confidence || 0,
      validationStatus: dbPlaceholder.validation_status as ValidationStatus,
      validationNotes: dbPlaceholder.validation_notes,
    };
  }
}
