import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
      <section className="relative pt-40 pb-32 px-6 z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm mb-8 backdrop-blur-sm animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-indigo-200 font-medium">Powered by 11 AI Agents</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8 animate-fade-in-delay-1">
                Legal Intelligence, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
                  Reimagined.
                </span>
              </h1>

              <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-in-delay-2">
                Transform static documents into intelligent data. Lexsy combines advanced AI with legal precision to automate your workflow instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-delay-3">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 border-0">
                    Start Automating →
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white px-8 py-6 text-lg backdrop-blur-sm">
                    View Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 animate-fade-in-delay-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>SOC2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>99.9% Accuracy</span>
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
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">🤖</div>
                    <div>
                      <div className="h-2 w-24 bg-slate-600 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-700/50 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-700/50 rounded"></div>
                    <div className="h-2 w-4/6 bg-slate-700/50 rounded"></div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <div className="h-8 w-20 bg-indigo-600/20 rounded border border-indigo-500/30"></div>
                  </div>
                </div>

                {/* Chat Bubble */}
                <div className="absolute bottom-1/4 left-8 right-1/4 p-4 rounded-xl border border-white/10 bg-slate-800/90 backdrop-blur-md shadow-xl transform transition-transform duration-500 delay-100 group-hover:translate-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">I found 3 missing clauses in the NDA. Shall I add them?</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
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

      {/* Features Grid */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Intelligence at every step
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our multi-agent system handles the complexity, so you can focus on the strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🧠",
                title: "Neural Analysis",
                desc: "Advanced NLP models understand the context, intent, and nuances of every legal document you upload."
              },
              {
                icon: "💬",
                title: "Conversational Filling",
                desc: "Forget static forms. Interact with your documents naturally. AI guides you through every placeholder."
              },
              {
                icon: "🔐",
                title: "Secure Data Room",
                desc: "Enterprise-grade security for your sensitive data. Build a knowledge graph that gets smarter with every upload."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
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
