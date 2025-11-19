import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Lexsy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-black hover:bg-gray-800 text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-gray-700">11 AI Agents • Live Now</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 animate-fade-in">
              Legal documents,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">filled instantly</span>
                <span className="absolute bottom-2 left-0 right-0 h-4 bg-yellow-200 -rotate-1 animate-slide-in-left"></span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Stop wasting hours on document templates. Let AI fill your SAFEs, NDAs, and contracts in minutes—with perfect accuracy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/register">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium">
                  Start for Free →
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  Try Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-gray-500 mb-16">
              No credit card • 2-minute setup • <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">demo@lexsy.com</span>
            </p>

            {/* Product Screenshot Placeholder */}
            <div className="relative max-w-5xl mx-auto">
              <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-2xl">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-600 font-medium">Document Processing Interface</p>
                    <p className="text-sm text-gray-500 mt-2">Upload → Analyze → Fill → Download</p>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm animate-bounce-slow">
                ✨ 95% Accurate
              </div>
              <div className="absolute -bottom-4 -left-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm hover-scale">
                ⚡ 10x Faster
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - Focused on Must-Haves */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-xl text-gray-600">
              Five core features that save hours every day
            </p>
          </div>

          <div className="space-y-6">
            {/* Feature 1: Upload */}
            <div className="flex items-start gap-6 bg-white rounded-xl p-8 border border-gray-200 hover:border-black hover:shadow-lg transition-all animate-fade-in-delay-1 group">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Any Legal Document</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Drag and drop your .docx files. SAFEs, NDAs, employment contracts—anything. Upload in seconds.
                </p>
              </div>
              <div className="hidden md:block text-5xl group-hover:scale-110 transition-transform">📤</div>
            </div>

            {/* Feature 2: AI Detection */}
            <div className="flex items-start gap-6 bg-white rounded-xl p-8 border border-gray-200 hover:border-black hover:shadow-lg transition-all group">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Finds Every Blank</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Our AI scans your document and identifies every fillable field—names, dates, amounts, addresses. No manual setup required.
                </p>
              </div>
              <div className="hidden md:block text-5xl group-hover:scale-110 transition-transform">🤖</div>
            </div>

            {/* Feature 3: Conversational Fill */}
            <div className="flex items-start gap-6 bg-white rounded-xl p-8 border border-gray-200 hover:border-black hover:shadow-lg transition-all group">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Fill Through Conversation</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Chat with AI to complete your document. No forms. Just natural conversation. AI validates every answer as you go.
                </p>
              </div>
              <div className="hidden md:block text-5xl group-hover:scale-110 transition-transform">💬</div>
            </div>

            {/* Feature 4: Download */}
            <div className="flex items-start gap-6 bg-white rounded-xl p-8 border border-gray-200 hover:border-black hover:shadow-lg transition-all group">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Download Ready-to-Sign</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Get your completed document instantly. All fields filled, validated, and ready for signatures. Takes minutes, not hours.
                </p>
              </div>
              <div className="hidden md:block text-5xl group-hover:scale-110 transition-transform">⬇️</div>
            </div>

            {/* Feature 5: Data Room */}
            <div className="flex items-start gap-6 bg-white rounded-xl p-8 border border-gray-200 hover:border-black hover:shadow-lg transition-all group">
              <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Build Your Knowledge Base</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Upload company documents once. AI remembers everything—names, amounts, dates. Future documents auto-populate from your data room.
                </p>
              </div>
              <div className="hidden md:block text-5xl group-hover:scale-110 transition-transform">📚</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-y border-gray-200">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            From template to signed document in 3 minutes
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            The fastest way to fill legal documents. Period.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1.</div>
              <h3 className="font-bold text-gray-900 mb-1">Upload</h3>
              <p className="text-gray-600">Drop your .docx template</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">2.</div>
              <h3 className="font-bold text-gray-900 mb-1">Chat</h3>
              <p className="text-gray-600">AI asks questions, you answer</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">3.</div>
              <h3 className="font-bold text-gray-900 mb-1">Download</h3>
              <p className="text-gray-600">Get your completed document</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop filling documents manually
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join law firms saving 10+ hours per week with AI automation
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-10 py-4 text-lg font-semibold">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-4 text-lg">
                Try Demo
              </Button>
            </Link>
          </div>

          <p className="text-gray-400 text-sm mt-8">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold">
                L
              </div>
              <span className="text-xl font-bold text-gray-900">Lexsy</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <Link to="/register" className="hover:text-gray-900 transition-colors font-medium">Get Started</Link>
              <Link to="/login" className="hover:text-gray-900 transition-colors font-medium">Sign In</Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Powered by 11 AI Agents</span>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2025 Lexsy
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
