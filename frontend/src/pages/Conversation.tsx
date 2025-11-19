import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { conversationsAPI, documentsAPI, handleApiError } from '../lib/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import MessageBubble from '../components/conversation/MessageBubble'

function Conversation() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get document details
  const { data: document, isLoading: docLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentsAPI.getById(documentId!),
    enabled: !!documentId,
  })

  // Start or get existing conversation
  const startConversationMutation = useMutation({
    mutationFn: (docId: string) => conversationsAPI.start(docId),
    onSuccess: (data) => {
      setConversationId(data.id)
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Failed to start conversation: ${apiError.message}`)
    },
  })

  // Get messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationsAPI.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  })

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => conversationsAPI.sendMessage(conversationId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['document', documentId] })
      setMessage('')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      alert(`Failed to send message: ${apiError.message}`)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start conversation on mount
  useEffect(() => {
    if (documentId && !conversationId && !startConversationMutation.isPending) {
      startConversationMutation.mutate(documentId)
    }
  }, [documentId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && conversationId) {
      sendMessageMutation.mutate(message.trim())
    }
  }

  const handleCompleteConversation = () => {
    navigate(`/documents/${documentId}`)
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

  const completionPercentage = document.completionPercentage || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/documents/${documentId}`)}>
          ← Back to Document
        </Button>
      </div>

      {/* Document Info Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fill Document with AI Assistant</h1>
            <p className="text-gray-600 mt-1">{document.filename}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{completionPercentage}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {startConversationMutation.isPending ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Starting conversation...</p>
            </div>
          ) : messagesLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex justify-end">
                  <div className="bg-gray-900 text-white rounded-lg px-4 py-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Sending...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Start the conversation</h3>
              <p className="mt-1 text-sm text-gray-500">
                The AI assistant will help you fill out this document by asking questions.
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your response..."
              disabled={!conversationId || sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white disabled:bg-gray-400"
              disabled={!message.trim() || !conversationId}
              isLoading={sendMessageMutation.isPending}
            >
              Send
            </Button>
          </form>
          {completionPercentage === 100 && (
            <div className="mt-3 flex justify-center">
              <Button
                className="w-full bg-black hover:bg-gray-800 text-white"
                onClick={handleCompleteConversation}
              >
                Complete & View Document
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Conversation
