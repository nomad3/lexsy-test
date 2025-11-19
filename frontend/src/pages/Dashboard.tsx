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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your document overview.</p>
        </div>
        <Link to="/documents">
          <Button variant="primary">Upload Document</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : stats?.totalDocuments || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {statsLoading ? '...' : stats?.completedDocuments || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {statsLoading ? '...' : stats?.inProgressDocuments || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {statsLoading ? '...' : stats?.averageHealthScore?.toFixed(0) || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
          <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>

        {docsLoading ? (
          <Card>
            <p className="text-gray-500 text-center py-8">Loading documents...</p>
          </Card>
        ) : recentDocuments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
            {recentDocuments.map((doc) => (
              <Link key={doc.id} to={`/documents/${doc.id}`}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
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
