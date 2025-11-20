import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NeuralNetworkBackground from '../components/NeuralNetworkBackground'
import { Button } from '../components/ui/Button'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[30%] h-[30%] rounded-full bg-violet-900/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Lexsy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white text-slate-950 hover:bg-slate-200 shadow-lg shadow-white/10 transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 z-10 overflow-hidden">
        <NeuralNetworkBackground />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm mb-8 backdrop-blur-sm animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-indigo-200 font-medium">Trusted by Legal Professionals</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8 animate-fade-in-delay-1">
                Your Legal Documents, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
                  Done in Minutes.
                </span>
              </h1>

              <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-in-delay-2">
                Stop spending hours on manual data entry. Lexsy ensures your contracts, NDAs, and agreements are filled accurately and consistently, every single time.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-delay-3">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 border-0">
                    Start Free Trial →
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white px-8 py-6 text-lg backdrop-blur-sm">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 animate-fade-in-delay-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Zero Data Retention</span>
                </div>
              </div>
            </div>

            {/* Visual/Graphic */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none animate-fade-in-delay-2">
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden group">
                {/* Abstract UI Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5" />

                {/* Floating Cards */}
                <div className="absolute top-1/4 left-1/4 right-8 p-6 rounded-xl border border-white/10 bg-slate-800/80 backdrop-blur-md shadow-xl transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl text-indigo-400">📄</div>
                    <div>
                      <div className="text-white font-medium">Non-Disclosure Agreement</div>
                      <div className="text-slate-400 text-sm">Ready for review</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-700/50 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-700/50 rounded"></div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>100% Compliant</span>
                  </div>
                </div>

                {/* Chat Bubble */}
                <div className="absolute bottom-1/4 left-8 right-1/4 p-4 rounded-xl border border-white/10 bg-slate-800/90 backdrop-blur-md shadow-xl transform transition-transform duration-500 delay-100 group-hover:translate-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">I've filled in the client details from your previous documents. Everything looks correct.</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    </div>
                  </div>
                </div>

                {/* Glow Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                See Lexsy in Action
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to save you time and eliminate errors.
            </p>
          </div>

          <div className="space-y-32">
            {/* Feature 1: Conversational Filling */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
                  <span className="text-xl">💬</span> Guided Completion
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white">
                  Fill documents like you're <br />
                  <span className="text-indigo-400">chatting with a colleague.</span>
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Forget complex forms. Lexsy's AI guides you through every field with natural questions. It provides contextual examples and validates your answers in real-time, ensuring 100% accuracy.
                </p>
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                    Contextual examples for every field
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                    Real-time progress tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                    Instant error detection
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-indigo-500/30 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 pointer-events-none" />
                  <img
                    src="/videos/conversation.webp"
                    alt="AI Conversation Demo"
                    className="w-full h-auto rounded-xl shadow-lg transform transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>

            {/* Feature 2: Data Room */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
                  <span className="text-xl">📚</span> Smart Knowledge Base
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white">
                  Never type the same <br />
                  <span className="text-purple-400">client details twice.</span>
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Upload your past documents to the Data Room. Lexsy automatically extracts entities like company names, addresses, and dates, building a secure knowledge graph for future use.
                </p>
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">✓</div>
                    Automatic entity extraction
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">✓</div>
                    Secure document storage
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">✓</div>
                    Smart auto-suggestions
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-purple-500/30 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
                  <img
                    src="/videos/dataroom.webp"
                    alt="Data Room Demo"
                    className="w-full h-auto rounded-xl shadow-lg transform transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>

            {/* Feature 3: Dashboard */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
                  <span className="text-xl">📊</span> Complete Oversight
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white">
                  Manage your entire <br />
                  <span className="text-blue-400">workflow in one place.</span>
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Track the status of every document, see what needs attention, and manage your team's workload from a single, intuitive dashboard.
                </p>
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">✓</div>
                    Visual status tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">✓</div>
                    Recent activity feed
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">✓</div>
                    One-click document access
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-blue-500/30 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
                  <img
                    src="/videos/dashboard.webp"
                    alt="Dashboard Demo"
                    className="w-full h-auto rounded-xl shadow-lg transform transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Documents Processed", value: "10k+" },
              { label: "Time Saved", value: "85%" },
              { label: "Accuracy Rate", value: "99.9%" },
              { label: "AI Agents", value: "11" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                  {stat.value}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-indigo-950/30 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Ready to modernize your practice?
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join the next generation of legal professionals using Lexsy to automate their workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register">
              <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-200 px-12 py-6 text-lg font-bold shadow-xl shadow-white/10 hover:scale-105 transition-all">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold">
                L
              </div>
              <span className="text-xl font-bold text-slate-200">Lexsy</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2025 Lexsy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
