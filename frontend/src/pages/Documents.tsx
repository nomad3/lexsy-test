import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsAPI, handleApiError } from '../lib/api'
import DocumentCard from '../components/DocumentCard'
import FileUpload from '../components/FileUpload'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Documents() {
  const [showUpload, setShowUpload] = useState(false)
  const queryClient = useQueryClient()

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsAPI.getAll,
  })

  const uploadMutation = useMutation({
    mutationFn: documentsAPI.upload,
    onSuccess: async (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setShowUpload(false)

      // Automatically trigger analysis after upload
      try {
        await documentsAPI.analyze(newDoc.id)
        queryClient.invalidateQueries({ queryKey: ['documents'] })
      } catch (error) {
        console.error('Analysis failed:', error)
      }
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Upload failed: ${apiError.message}`)
    },
  })

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage and fill your legal documents</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? 'Cancel' : 'Upload Document'}
        </Button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h2>
          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={uploadMutation.isPending}
          />
          {uploadMutation.isPending && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Uploading and analyzing document... This may take a few moments.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Documents List */}
      <div>
        {isLoading ? (
          <Card>
            <p className="text-gray-500 text-center py-8">Loading documents...</p>
          </Card>
        ) : !documents || documents.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
              <div className="mt-6">
                <Button variant="primary" onClick={() => setShowUpload(true)}>
                  Upload Your First Document
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents
