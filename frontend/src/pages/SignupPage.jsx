import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email format'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('password', form.password)
      await signup(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally { setLoading(false) }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold text-white mb-2">Create your account ✨</h2>
      <p className="text-slate-400 mb-8">Start planning amazing journeys today</p>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input id="signup-name" type="text" className="input" placeholder="John Doe"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input id="signup-email" type="email" className="input" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <input id="signup-password" type={showPass ? 'text' : 'password'} className="input pr-12"
              placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="mt-2 flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? ['','bg-red-500','bg-yellow-500','bg-green-500'][strength] : 'bg-white/10'}`} />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
          <input id="signup-confirm" type="password" className="input" placeholder="Repeat password"
            value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
        </div>

        <button id="signup-btn" type="submit" className="btn-primary w-full py-3 text-base mt-2" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...
            </span>
          ) : 'Create Account →'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-slate-500">Already have an account? </span>
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </motion.div>
  )
}
