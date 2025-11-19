import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataRoomAPI, handleApiError } from '../lib/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function DataRoom() {
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('')

  // Get all data room documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['dataroom'],
    queryFn: dataRoomAPI.getAll,
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data: { file: File; category?: string }) =>
      dataRoomAPI.upload(data.file, data.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataroom'] })
      setSelectedFile(null)
      setUploadCategory('')
      alert('Document uploaded successfully! Processing to extract entities...')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Upload failed: ${apiError.message}`)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataRoomAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataroom'] })
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Delete failed: ${apiError.message}`)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        alert('Please select a .docx file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({
        file: selectedFile,
        category: uploadCategory || undefined,
      })
    }
  }

  const handleDelete = (id: string, filename: string) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-6xl">🗄️</span>
          Data Room
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Upload company documents to build your knowledge graph for intelligent auto-suggestions
        </p>
      </div>

      {/* Upload Section */}
      <Card className="animate-fade-in-delay-1">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📂</span>
          Upload Company Document
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Document (.docx)
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose File
                <input
                  type="file"
                  className="sr-only"
                  accept=".docx"
                  onChange={handleFileSelect}
                />
              </label>
              {selectedFile && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              placeholder="e.g., Contracts, Financial, Legal"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <Button
              className="bg-black hover:bg-gray-800 text-white disabled:bg-gray-400 hover-scale"
              onClick={handleUpload}
              disabled={!selectedFile}
              isLoading={uploadMutation.isPending}
            >
              <span>⬆️</span> Upload & Process Document
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-gray-900">What happens after upload?</h3>
              <p className="text-sm text-gray-700 mt-1">
                Our AI will analyze your document to extract company information, entities, and relationships.
                This data will be added to your knowledge graph and used to provide intelligent suggestions
                when filling out legal documents.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <div className="animate-fade-in-delay-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          Your Data Room Documents
        </h2>

        {isLoading ? (
          <Card>
            <p className="text-gray-500 text-center py-8">Loading documents...</p>
          </Card>
        ) : !documents || documents.length === 0 ? (
          <Card>
            <div className="text-center py-12 animate-bounce-slow">
              <span className="text-6xl block mb-4">📭</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your first company document to start building your knowledge graph.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc, index) => (
              <Card key={doc.id} hover className={`animate-fade-in-delay-${Math.min(index + 1, 5)} hover-scale transition-transform`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-gray-100 rounded-lg text-xl">
                      📄
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.originalName}</h3>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        {doc.category && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {doc.category}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 hover-scale"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.originalName)}
                      isLoading={deleteMutation.isPending}
                    >
                      <span>🗑️</span> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge Graph Info */}
      {documents && documents.length > 0 && (
        <Card className="animate-fade-in-delay-3">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gray-100 rounded-lg text-2xl">
              🧠
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <span className="text-xl">✨</span>
                Knowledge Graph Active
              </h3>
              <p className="text-gray-600 mt-1">
                Your data room contains {documents.length} document{documents.length !== 1 ? 's' : ''}.
                Entities extracted from these documents will be used to provide intelligent auto-suggestions
                when you fill out legal documents.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-sm text-gray-600">Entities Extracted</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-sm text-gray-600">Suggestions Made</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default DataRoom
