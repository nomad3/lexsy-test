import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, documentsAPI } from '../lib/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Dashboard() {
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsAPI.getDashboardMetrics,
  })

  const { data: documentsData, isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsAPI.getAll,
  })

  const stats = dashboardData?.data
  const documents = Array.isArray(documentsData?.data) ? documentsData.data : []
  const recentDocuments = documents.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-5xl">📊</span>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Your document automation workspace</p>
        </div>
        <Link to="/documents">
          <Button className="bg-black hover:bg-gray-800 text-white hover-scale">
            <span>📤</span> Upload Document
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-fade-in-delay-1 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : stats?.totalDocuments || 0}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg text-2xl">
              📄
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in-delay-2 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {statsLoading ? '...' : stats?.completedDocuments || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-2xl">
              ✅
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in-delay-3 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {statsLoading ? '...' : stats?.inProgressDocuments || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full text-2xl animate-bounce-slow">
              ⏳
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in-delay-4 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : stats?.averageHealthScore?.toFixed(0) || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full text-2xl">
              💚
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Documents */}
      <div className="animate-fade-in-delay-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Recent Documents
          </h2>
          <Link to="/documents" className="text-sm text-gray-900 hover:text-gray-700 font-medium underline">
            View all →
          </Link>
        </div>

        {docsLoading ? (
          <Card>
            <p className="text-gray-500 text-center py-8">Loading documents...</p>
          </Card>
        ) : recentDocuments.length === 0 ? (
          <Card>
            <div className="text-center py-12 animate-bounce-slow">
              <span className="text-6xl block mb-4">📭</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
              <div className="mt-6">
                <Link to="/documents">
                  <Button variant="primary">Upload Your First Document</Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recentDocuments.map((doc, index) => (
              <Link key={doc.id} to={`/documents/${doc.id}`}>
                <Card hover className={`animate-fade-in-delay-${Math.min(index + 1, 5)} hover-scale transition-transform`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg text-xl">
                        📄
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                        <p className="text-sm text-gray-500">
                          {doc.documentType || 'Unknown type'} • {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                        doc.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                        doc.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{doc.completionPercentage}%</p>
                        <p className="text-xs text-gray-500">Complete</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
