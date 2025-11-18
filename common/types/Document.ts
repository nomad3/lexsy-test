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
  filePath: string;
  uploadDate: Date;
  status: DocumentStatus;
  documentType: string;
  aiClassificationConfidence?: number;
  riskScore?: number;
  completionPercentage: number;
  metadata?: Record<string, any>;
  userId: string;
}
