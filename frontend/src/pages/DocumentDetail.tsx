import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsAPI, handleApiError } from '../lib/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useState } from 'react'

function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingPlaceholder, setEditingPlaceholder] = useState<string | null>(null)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})

  const { data: document, isLoading: docLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsAPI.getById(id!),
    enabled: !!id,
  })

  const { data: placeholders, isLoading: placeholdersLoading } = useQuery({
    queryKey: ['placeholders', id],
    queryFn: async () => {
      if (!id) return []
      try {
        return await documentsAPI.getPlaceholders(id)
      } catch (error) {
        // If placeholders haven't been extracted yet, return empty array
        return []
      }
    },
    enabled: !!id,
  })

  const extractMutation = useMutation({
    mutationFn: (documentId: string) => documentsAPI.extractPlaceholders(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeholders', id] })
      queryClient.invalidateQueries({ queryKey: ['document', id] })
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Extraction failed: ${apiError.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ placeholderId, value }: { placeholderId: string; value: string }) =>
      documentsAPI.updatePlaceholder(id!, placeholderId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeholders', id] })
      queryClient.invalidateQueries({ queryKey: ['document', id] })
      setEditingPlaceholder(null)
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Update failed: ${apiError.message}`)
    },
  })

  const handleExtractPlaceholders = () => {
    if (id) {
      extractMutation.mutate(id)
    }
  }

  const handleUpdatePlaceholder = (placeholderId: string) => {
    const value = placeholderValues[placeholderId]
    if (value !== undefined) {
      updateMutation.mutate({ placeholderId, value })
    }
  }

  const handleEditPlaceholder = (placeholderId: string, currentValue?: string) => {
    setEditingPlaceholder(placeholderId)
    setPlaceholderValues({ ...placeholderValues, [placeholderId]: currentValue || '' })
  }

  if (docLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading document...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Document not found</p>
        <Button variant="primary" onClick={() => navigate('/documents')} className="mt-4">
          Back to Documents
        </Button>
      </div>
    )
  }

  const completedPlaceholders = placeholders?.filter(p => p.isCompleted).length || 0
  const totalPlaceholders = placeholders?.length || 0
  const completionPercentage = totalPlaceholders > 0 ? Math.round((completedPlaceholders / totalPlaceholders) * 100) : 0

  const handleDownload = () => {
    // Generate a simple text representation of the filled document
    const filledFields = placeholders?.filter(p => p.value).map(p =>
      `${p.fieldName}: ${p.value}`
    ).join('\n') || 'No fields filled yet'

    const unfilledFields = placeholders?.filter(p => !p.value).map(p =>
      `${p.fieldName}: [NOT FILLED]`
    ).join('\n') || ''

    const content = `
FILLED DOCUMENT: ${document?.originalName || document?.filename}
Generated: ${new Date().toLocaleString()}
Completion: ${completionPercentage}%

==================== FILLED FIELDS ====================
${filledFields}

==================== UNFILLED FIELDS ====================
${unfilledFields || 'All fields completed!'}

===========================================================
This is a simple text representation.
Full DOCX generation coming soon!
    `.trim()

    // Create a blob and download it
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${document?.originalName || 'document'}_filled.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleStartConversation = () => {
    navigate(`/conversation/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/documents')}>
          ← Back to Documents
        </Button>
        <div className="flex space-x-2">
          {placeholders && placeholders.length > 0 && (
            <>
              <Button
                variant="secondary"
                onClick={handleStartConversation}
              >
                Fill with AI Chat
              </Button>
              <Button
                variant="primary"
                onClick={handleDownload}
              >
                Download Filled Document
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{(document as any).originalName || document.filename}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>{document.documentType || 'Unknown type'}</span>
              <span>•</span>
              <span>Uploaded {new Date((document as any).createdAt || document.uploadDate).toLocaleDateString()}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                document.status === 'completed' ? 'bg-green-100 text-green-700' :
                document.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                document.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {document.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          {(document as any).healthScore !== undefined && (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{(document as any).healthScore}%</div>
              <div className="text-sm text-gray-500">Health Score</div>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      {(document.status === 'analyzed' || document.status === 'uploaded') && !placeholders?.length && (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Extract Placeholders</h3>
            <p className="text-gray-600 mb-4">
              Use AI to automatically extract all placeholders from this document
            </p>
            <Button
              variant="primary"
              onClick={handleExtractPlaceholders}
              isLoading={extractMutation.isPending}
            >
              Extract Placeholders with AI
            </Button>
          </div>
        </Card>
      )}

      {/* Placeholders */}
      {placeholdersLoading ? (
        <Card>
          <p className="text-gray-500 text-center py-8">Loading placeholders...</p>
        </Card>
      ) : placeholders && placeholders.length > 0 ? (
        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Document Fields</h2>
              <span className="text-sm text-gray-600">
                {completedPlaceholders} of {totalPlaceholders} completed ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {placeholders.map((placeholder) => (
              <div key={placeholder.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{placeholder.fieldName}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {placeholder.fieldType}
                      </span>
                      {placeholder.isRequired && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                          Required
                        </span>
                      )}
                      {placeholder.isCompleted && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    {placeholder.description && (
                      <p className="text-sm text-gray-600 mt-1">{placeholder.description}</p>
                    )}
                    {placeholder.suggestedValue && (
                      <p className="text-sm text-primary-600 mt-1">
                        Suggested: {placeholder.suggestedValue}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  {editingPlaceholder === placeholder.id ? (
                    <div className="flex space-x-2">
                      <Input
                        value={placeholderValues[placeholder.id] || ''}
                        onChange={(e) =>
                          setPlaceholderValues({
                            ...placeholderValues,
                            [placeholder.id]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${placeholder.fieldName.toLowerCase()}`}
                      />
                      <Button
                        variant="primary"
                        onClick={() => handleUpdatePlaceholder(placeholder.id)}
                        isLoading={updateMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingPlaceholder(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900">
                        {placeholder.value || <span className="text-gray-400 italic">Not filled</span>}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlaceholder(placeholder.id, placeholder.value)}
                      >
                        {placeholder.value ? 'Edit' : 'Fill'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

export default DocumentDetail
