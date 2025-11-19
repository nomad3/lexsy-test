// User types
export enum UserRole {
  LAWYER = 'lawyer',
  ADMIN = 'admin',
}

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  organization?: string
  createdAt: string
  lastLogin?: string
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role: UserRole
  organization?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

// Document types
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  ANALYZING = 'analyzing',
  ANALYZED = 'analyzed',
  EXTRACTING = 'extracting',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface Document {
  id: string
  userId: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  status: DocumentStatus
  documentType?: string
  category?: string
  healthScore?: number
  createdAt: string
  updatedAt: string
  analyzedAt?: string
  completedAt?: string
}

// Placeholder types
export enum PlaceholderType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  EMAIL = 'email',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  ADDRESS = 'address',
  PHONE = 'phone',
  NAME = 'name',
  COMPANY = 'company',
}

export interface Placeholder {
  id: string
  documentId: string
  fieldName: string
  fieldType: PlaceholderType
  description?: string
  value?: string
  confidence?: number
  suggestedValue?: string
  suggestionSource?: string
  position: number
  isRequired: boolean
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

// Conversation types
export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  documentId: string
  userId: string
  status: 'active' | 'completed' | 'abandoned'
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// Data room types
export interface DataRoomDocument {
  id: string
  userId: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  category?: string
  uploadedAt: string
}

// Analytics types
export interface DocumentStats {
  totalDocuments: number
  completedDocuments: number
  inProgressDocuments: number
  averageHealthScore: number
  recentDocuments: Document[]
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp?: string
  requestId?: string
}
