import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastContainer } from './components/ui/Toast'
import Conversation from './pages/Conversation'
import Dashboard from './pages/Dashboard'
import DataRoom from './pages/DataRoom'
import DocumentDetail from './pages/DocumentDetail'
import Documents from './pages/Documents'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuthStore } from './stores/authStore'

function App() {
  const { token } = useAuthStore()

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected routes */}
          <Route element={token ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/conversation/:documentId" element={<Conversation />} />
            <Route path="/dataroom" element={<DataRoom />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
