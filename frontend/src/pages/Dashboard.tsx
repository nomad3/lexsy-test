import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { documentsAPI } from '../lib/api'
import { Document } from '../lib/types'

function Dashboard() {
  const navigate = useNavigate()
  // The original dashboardData query is removed as stats are now calculated from documentsData
  // const { data: dashboardData, isLoading: statsLoading } = useQuery({
  //   queryKey: ['dashboard'],
  //   queryFn: analyticsAPI.getDashboardMetrics,
  // })

  const { data: documentsData, isLoading: docsLoading } = useQuery<Document[]>({ // Explicitly type documentsData as Document[]
    queryKey: ['documents'],
    queryFn: documentsAPI.getAll,
  })

  // Combine loading states
  const isLoading = docsLoading; // Only docsLoading is relevant now

  // The 'stats' variable is no longer needed as stats are calculated directly
  // const stats = dashboardData?.data

  // Fix: documentsData is already the array, no need for .data access
  const documents = Array.isArray(documentsData) ? documentsData : []
  const recentDocuments = documents.slice(0, 5)

  // Calculate stats from documents
  const totalDocuments = documents.length
  const completedDocuments = documents.filter((d: Document) => d.status === 'completed').length
  const pendingDocuments = documents.filter((d: Document) => d.status === 'filling' || d.status === 'analyzing').length
  const attentionNeeded = documents.filter((d: Document) => d.healthScore && d.healthScore < 70).length

  // Placeholder for user, assuming it comes from a context or prop
  const user = { fullName: 'User' };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* New Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName}. Here's what's happening with your documents.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <div className="text-2xl">📄</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {documents.length > 0 ? '+2 from last week' : 'No documents yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <div className="text-2xl">⏳</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {pendingDocuments > 0 ? 'Documents require attention' : 'All caught up'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="text-2xl">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {totalDocuments > 0
                ? `${Math.round((completedDocuments / totalDocuments) * 100)}% completion rate`
                : '0% completion rate'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attention Needed</CardTitle>
            <div className="text-2xl">⚠️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attentionNeeded}</div>
            <p className="text-xs text-muted-foreground">
              Documents with low health score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
          <Button variant="outline" onClick={() => navigate('/documents')}>
            View All
          </Button>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-4xl text-muted-foreground/50">📄</div>
              <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload your first document to get started with AI-powered automation.
              </p>
              <Button onClick={() => navigate('/documents')}>
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocuments.map((doc, index) => (
              <Card key={doc.id || index}>
                <CardHeader>
                  <CardTitle className="text-lg">{doc.filename}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                      }`}>
                      {doc.status}
                    </span>
                    <span className="text-sm font-medium">{doc.completionPercentage}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
