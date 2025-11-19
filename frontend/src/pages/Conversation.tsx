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
      <div className="flex items-center justify-between animate-fade-in">
        <Button variant="outline" onClick={() => navigate(`/documents/${documentId}`)}>
          ← Back to Document
        </Button>
      </div>

      {/* Document Info Card */}
      <Card className="animate-fade-in-delay-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">💬</span>
              Fill Document with AI Assistant
            </h1>
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
      <Card className="flex flex-col h-[600px] animate-fade-in-delay-2">
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
              {messages.map((msg, index) => (
                <div key={msg.id} className={`animate-fade-in-delay-${Math.min(index + 1, 5)}`}>
                  <MessageBubble message={msg} />
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex justify-end animate-fade-in">
                  <div className="bg-gray-900 text-white rounded-lg px-4 py-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">🤖 AI is thinking</span>
                      <span className="animate-bounce-slow">...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-12 animate-bounce-slow">
              <span className="text-6xl block mb-4">💬</span>
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
              className="bg-black hover:bg-gray-800 text-white disabled:bg-gray-400 hover-scale"
              disabled={!message.trim() || !conversationId}
              isLoading={sendMessageMutation.isPending}
            >
              <span>✉️</span> Send
            </Button>
          </form>
          {completionPercentage === 100 && (
            <div className="mt-3 flex justify-center animate-fade-in">
              <Button
                className="w-full bg-black hover:bg-gray-800 text-white hover-scale"
                onClick={handleCompleteConversation}
              >
                <span>✅</span> Complete & View Document
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Conversation
