import axios, { AxiosError } from 'axios'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Document,
  Placeholder,
  Conversation,
  Message,
  DataRoomDocument,
  DocumentStats,
  ApiResponse,
  ApiError,
} from './types'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Helper function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    if (axiosError.response?.data) {
      return axiosError.response.data
    }
    return {
      code: 'NETWORK_ERROR',
      message: axiosError.message || 'Network error occurred',
    }
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  }
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', userData)
    return data
  },
}

// Documents API
export const documentsAPI = {
  getAll: async (): Promise<Document[]> => {
    const { data } = await api.get<ApiResponse<Document[]>>('/documents')
    return data.data || []
  },

  getById: async (id: string): Promise<Document> => {
    const { data } = await api.get<ApiResponse<Document>>(`/documents/${id}`)
    if (!data.data) throw new Error('Document not found')
    return data.data
  },

  upload: async (file: File): Promise<Document> => {
    const formData = new FormData()
    formData.append('document', file)
    const { data } = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (!data.data) throw new Error('Upload failed')
    return data.data
  },

  analyze: async (id: string): Promise<Document> => {
    const { data } = await api.post<ApiResponse<Document>>(`/documents/${id}/analyze`)
    if (!data.data) throw new Error('Analysis failed')
    return data.data
  },

  extractPlaceholders: async (id: string): Promise<Placeholder[]> => {
    const { data } = await api.post<ApiResponse<Placeholder[]>>(`/documents/${id}/placeholders`)
    return data.data || []
  },

  getPlaceholders: async (documentId: string): Promise<Placeholder[]> => {
    const { data } = await api.get<ApiResponse<Placeholder[]>>(`/documents/${documentId}/placeholders`)
    return data.data || []
  },

  updatePlaceholder: async (documentId: string, placeholderId: string, value: string): Promise<Placeholder> => {
    const { data } = await api.patch<ApiResponse<Placeholder>>(
      `/documents/${documentId}/placeholders/${placeholderId}`,
      { value }
    )
    if (!data.data) throw new Error('Update failed')
    return data.data
  },
}

// Conversations API
export const conversationsAPI = {
  start: async (documentId: string): Promise<Conversation> => {
    const { data } = await api.post<ApiResponse<Conversation>>('/conversations', { documentId })
    if (!data.data) throw new Error('Failed to start conversation')
    return data.data
  },

  getById: async (id: string): Promise<Conversation> => {
    const { data } = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`)
    if (!data.data) throw new Error('Conversation not found')
    return data.data
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const { data } = await api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, {
      content,
    })
    if (!data.data) throw new Error('Failed to send message')
    return data.data
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await api.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`)
    return data.data || []
  },
}

// Data Room API
export const dataRoomAPI = {
  upload: async (file: File, category?: string): Promise<DataRoomDocument> => {
    const formData = new FormData()
    formData.append('document', file)
    if (category) formData.append('category', category)

    const { data } = await api.post<ApiResponse<DataRoomDocument>>('/dataroom/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (!data.data) throw new Error('Upload failed')
    return data.data
  },

  getAll: async (): Promise<DataRoomDocument[]> => {
    const { data } = await api.get<ApiResponse<DataRoomDocument[]>>('/dataroom')
    return data.data || []
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/dataroom/${id}`)
  },
}

// Analytics API
export const analyticsAPI = {
  getDashboardMetrics: async () => {
    const { data } = await api.get<ApiResponse<any>>('/analytics/dashboard')
    return data
  },

  getStats: async (): Promise<DocumentStats> => {
    const { data } = await api.get<ApiResponse<DocumentStats>>('/analytics/stats')
    if (!data.data) throw new Error('Failed to fetch stats')
    return data.data
  },

  getDocumentInsights: async (documentId: string) => {
    const { data } = await api.get<ApiResponse<any>>(`/analytics/documents/${documentId}/insights`)
    return data
  },

  getCompanyAnalytics: async (companyName: string) => {
    const { data } = await api.get<ApiResponse<any>>(`/analytics/companies/${companyName}`)
    return data
  },
}

export default api
