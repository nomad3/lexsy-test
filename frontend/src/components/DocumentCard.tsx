import { Link } from 'react-router-dom'
import Card from './ui/Card'
import type { Document } from '../lib/types'

interface DocumentCardProps {
  document: Document
}

function DocumentCard({ document }: DocumentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'ready':
      case 'analyzed':
        return 'bg-blue-100 text-blue-700'
      case 'in_progress':
      case 'analyzing':
      case 'extracting':
        return 'bg-yellow-100 text-yellow-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Link to={`/documents/${document.id}`}>
      <Card hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0 p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{document.originalName}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500">
                  {document.documentType || 'Unknown type'}
                </p>
                <span className="text-gray-300">•</span>
                <p className="text-sm text-gray-500">
                  {formatFileSize(document.fileSize)}
                </p>
                <span className="text-gray-300">•</span>
                <p className="text-sm text-gray-500">
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(document.status)}`}>
              {document.status.replace('_', ' ').toUpperCase()}
            </span>
            {document.healthScore !== undefined && (
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{document.healthScore}%</p>
                <p className="text-xs text-gray-500">Health</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default DocumentCard
