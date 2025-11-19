import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import Button from './ui/Button'

function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Documents', path: '/documents' },
    { name: 'Data Room', path: '/dataroom' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Lexsy</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-right">
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-gray-500 text-xs">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="text-sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
