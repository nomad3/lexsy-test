export enum DocumentStatus {
  UPLOADED = 'uploaded',
  ANALYZING = 'analyzing',
  READY = 'ready',
  FILLING = 'filling',
  COMPLETED = 'completed'
}

export interface Document {
  id: string;
  filename: string;
  originalName?: string;  // Original filename before upload
  filePath: string;
  uploadDate: Date;
  createdAt?: string;  // Creation timestamp
  status: DocumentStatus;
  documentType: string;
  aiClassificationConfidence?: number;
  riskScore?: number;
  completionPercentage: number;
  fileSize?: number;  // File size in bytes
  healthScore?: number;  // Document health score
  metadata?: Record<string, any>;
  userId: string;
}
