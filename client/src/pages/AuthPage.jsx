import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const toggle = () => {
    setIsLogin(!isLogin)
    setError('')
  }
  const fillDemo = (type) => {
    setEmail(type === 'admin' ? 'admin@demo.com' : 'member@demo.com')
    setPassword('password123')
    setIsLogin(true)
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-navy-900">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-neon-blue/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-purple/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-neon-pink/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="relative w-full max-w-md glass p-8 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-4xl gradient-text mb-2">TaskFlow</h1>
          <p className="text-white/40 text-sm">Team Task Manager</p>
        </div>
        <div className="flex mb-6 p-1 rounded-xl bg-white/5">
          <button
            onClick={() => { setIsLogin(true); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-white/50 mb-1.5">Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/50 mb-1.5">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/50 mb-1.5">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-neon-red/10 border border-neon-red/20 animate-shake">
              <p className="text-sm text-neon-red">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold text-sm hover:shadow-xl hover:shadow-neon-blue/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? 'Log In' : 'Create Account'
            )}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-white/30 text-center mb-3">Quick demo access</p>
          <div className="flex gap-2">
            <button
              onClick={() => fillDemo('admin')}
              className="flex-1 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-medium hover:bg-neon-purple/20 transition-all"
            >
              👑 Demo Admin
            </button>
            <button
              onClick={() => fillDemo('member')}
              className="flex-1 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-medium hover:bg-neon-blue/20 transition-all"
            >
              👤 Demo Member
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
