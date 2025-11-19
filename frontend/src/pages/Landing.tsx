import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl">
              L
            </div>
            <span className="text-2xl font-bold text-gray-900">Lexsy</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
          AI-Powered Legal
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Document Automation
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
          Fill legal documents faster with intelligent placeholder detection, conversational filling, and cross-document intelligence powered by AI.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link to="/register">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Demo Badge */}
        <div className="mt-8 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <span className="mr-2">🎯</span>
          Try the demo: <span className="ml-1 font-mono font-semibold">demo@lexsy.com</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Powered by 11 Specialized AI Agents
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">
              🤖
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Smart Document Analysis
            </h3>
            <p className="text-gray-600">
              AI automatically classifies your legal documents and extracts all fillable fields with 95%+ accuracy.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl">
              💬
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Conversational Filling
            </h3>
            <p className="text-gray-600">
              Fill documents through natural dialogue. AI asks the right questions and validates your answers in real-time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-2xl">
              🔗
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Cross-Document Intelligence
            </h3>
            <p className="text-gray-600">
              Changes in one document automatically suggest updates in related documents. Never miss a consistency issue.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-2xl">
              📊
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Document Health Scores
            </h3>
            <p className="text-gray-600">
              Real-time 0-100 scoring for completeness, compliance, and quality. Know exactly what needs attention.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-2xl">
              🔍
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Natural Language Search
            </h3>
            <p className="text-gray-600">
              Search documents using plain English: "Show me all SAFEs for TechCo with cap over $10M"
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-2xl">
              📚
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Knowledge Graph
            </h3>
            <p className="text-gray-600">
              Learns from every document you upload. Get smarter suggestions and auto-populated values over time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to transform your legal workflow?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
            Join leading law firms using AI to automate document processing and save hours every week.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2 font-semibold text-gray-900">Lexsy - AI-Powered Legal Document Automation</p>
          <p className="text-sm">Built with 11 specialized AI agents and enterprise-grade security</p>
          <p className="mt-4 text-sm">© 2025 Lexsy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
