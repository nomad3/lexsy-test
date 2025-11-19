import { useRef, useState } from 'react'
import Button from './ui/Button'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isUploading?: boolean
}

function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const validateAndUpload = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.docx')) {
      alert('Please upload a .docx file')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div>
          <p className="text-lg font-medium text-gray-900">
            {isUploading ? 'Uploading...' : 'Drop your document here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">or click to browse</p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={handleClick}
          disabled={isUploading}
          isLoading={isUploading}
        >
          Select .docx File
        </Button>

        <p className="text-xs text-gray-500">
          Supported format: .docx • Max size: 10MB
        </p>
      </div>
    </div>
  )
}

export default FileUpload
