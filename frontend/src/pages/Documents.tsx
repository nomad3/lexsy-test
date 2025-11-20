import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import DocumentCard from '../components/DocumentCard'
import FileUpload from '../components/FileUpload'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { toast } from '../components/ui/Toast'
import { documentsAPI, handleApiError } from '../lib/api'

function Documents() {
  const [showUpload, setShowUpload] = useState(false)
  const queryClient = useQueryClient()

  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsAPI.getAll,
  })

  const documents = Array.isArray(documentsData) ? documentsData : []

  const uploadMutation = useMutation({
    mutationFn: documentsAPI.upload,
    onMutate: () => {
      // Mutation started
    },
    onSuccess: async (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setShowUpload(false)
      toast.success('Document uploaded successfully!')

      // Automatically trigger full flow: Analyze -> Extract Placeholders
      if (newDoc && newDoc.id) {
        try {
          await documentsAPI.analyze(newDoc.id)
          await documentsAPI.extractPlaceholders(newDoc.id)
          queryClient.invalidateQueries({ queryKey: ['documents'] })
          toast.success('Document analyzed and ready!')
        } catch (error) {
          console.error('Full flow failed:', error)
          toast.error('Document uploaded but analysis failed')
        }
      }
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error(`Upload failed: ${apiError.message}`)
    },
  })

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 flex-col">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          <h3 className="font-bold">Error loading documents</h3>
          <p>{error.message}</p>
          <pre className="text-xs mt-2 text-left">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-6xl">📄</span>
            Documents
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage and fill your legal documents</p>
        </div>
        <Button
          className="bg-black hover:bg-gray-800 text-white hover-scale"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? 'Cancel' : <><span>📤</span> Upload Document</>}
        </Button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card className="animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📂</span>
            Upload New Document
          </h2>
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
            <div className="text-center py-12 animate-bounce-slow">
              <span className="text-6xl block mb-4">📭</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
              <div className="mt-6">
                <Button className="bg-black hover:bg-gray-800 text-white" onClick={() => setShowUpload(true)}>
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
            {documents.map((doc, index) => (
              <div key={doc.id} className={`animate-fade-in-delay-${Math.min(index + 1, 5)}`}>
                <DocumentCard document={doc} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents
