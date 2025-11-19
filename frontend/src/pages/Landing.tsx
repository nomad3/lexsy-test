import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 shadow-lg transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">L</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Lexsy
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="md" className="hover:bg-gray-50">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="md" className="shadow-md hover:shadow-lg transition-shadow">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-gray-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10"></div>
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>

        <div className="container mx-auto px-6 py-24 text-center md:py-32">
          {/* Announcement Badge */}
          <div className="mb-8 inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:shadow-md transition-shadow">
            <span className="mr-2 text-lg">✨</span>
            <span>Powered by 11 Specialized AI Agents</span>
          </div>

          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block">AI-Powered Legal</span>
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Document Automation
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-xl text-gray-600 leading-relaxed md:text-2xl">
            Fill legal documents 10x faster with <span className="font-semibold text-gray-900">intelligent placeholder detection</span>, <span className="font-semibold text-gray-900">conversational filling</span>, and <span className="font-semibold text-gray-900">cross-document intelligence</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
                <span className="flex items-center">
                  Start Free Trial
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-gray-50">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Demo Badge */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 px-6 py-4 shadow-md">
            <div className="flex items-center">
              <span className="mr-2 text-2xl">🎯</span>
              <span className="text-sm font-medium text-gray-700">Try the demo:</span>
            </div>
            <div className="font-mono text-sm font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
              demo@lexsy.com
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">11</div>
              <div className="text-sm text-gray-600 mt-1">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">19</div>
              <div className="text-sm text-gray-600 mt-1">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600 mt-1">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">10x</div>
              <div className="text-sm text-gray-600 mt-1">Faster</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Legal Teams Love Lexsy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your workflow with AI-powered features designed specifically for legal professionals
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-blue-50 opacity-50"></div>
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-3xl shadow-lg transform group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Smart Document Analysis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  AI automatically classifies your legal documents and extracts all fillable fields with 95%+ accuracy.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-purple-50 opacity-50"></div>
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-3xl shadow-lg transform group-hover:scale-110 transition-transform">
                  💬
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Conversational Filling
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Fill documents through natural dialogue. AI asks the right questions and validates answers in real-time.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-green-50 opacity-50"></div>
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-3xl shadow-lg transform group-hover:scale-110 transition-transform">
                  🔗
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Cross-Document Intelligence
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Changes in one document automatically suggest updates in related documents. Never miss a consistency issue.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-yellow-50 opacity-50"></div>
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-3xl shadow-lg transform group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Document Health Scores
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Real-time 0-100 scoring for completeness, compliance, and quality. Know exactly what needs attention.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-pink-50 opacity-50"></div>
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-3xl shadow-lg transform group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Natural Language Search
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Search documents using plain English: "Show me all SAFEs for TechCo with cap over $10M"
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-indigo-50 opacity-50"></div>
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-3xl shadow-lg transform group-hover:scale-110 transition-transform">
                  📚
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Knowledge Graph
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Learns from every document you upload. Get smarter suggestions and auto-populated values over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-24">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 h-full w-full opacity-10">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-pink-300 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
            Ready to Transform Your Legal Workflow?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-50 leading-relaxed">
            Join leading law firms using AI to automate document processing and save hours every week. Get started in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 shadow-2xl transform hover:scale-105 transition-all">
                <span className="flex items-center">
                  Start Free Trial
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10">
                Sign In to Demo
              </Button>
            </Link>
          </div>

          <p className="text-blue-100 text-sm">
            No credit card required • Start in 2 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-3 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl shadow-md">
                  L
                </div>
                <span className="text-2xl font-bold text-gray-900">Lexsy</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                AI-Powered Legal Document Automation built with 11 specialized AI agents and enterprise-grade security.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Link to="/register" className="hover:text-blue-600 transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link></li>
                <li><span className="text-gray-400">Features (Coming Soon)</span></li>
                <li><span className="text-gray-400">Pricing (Coming Soon)</span></li>
              </ul>
            </div>

            {/* Technology */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Technology</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> 11 AI Agents
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> OpenAI GPT-4
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Enterprise Security
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Docker Deployment
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Lexsy. All rights reserved. Built with React, TypeScript, and AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
