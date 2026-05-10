import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h2>
      <p className="text-slate-400 mb-8">Sign in to continue your travel journey</p>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input id="login-email" type="email" className="input" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <input id="login-password" type={showPass ? 'text' : 'password'} className="input pr-12"
              placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer transition-colors">Forgot password?</span>
        </div>

        <button id="login-btn" type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...
            </span>
          ) : 'Sign In →'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-slate-500">Don't have an account? </span>
        <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Create one free
        </Link>
      </div>

      {/* Demo hint */}
      <div className="mt-6 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
        <p className="text-xs text-slate-500 text-center">
          Admin demo: <span className="text-primary-400">admin@traveloop.com</span> / <span className="text-primary-400">Admin@123</span>
        </p>
      </div>
    </motion.div>
  )
}
