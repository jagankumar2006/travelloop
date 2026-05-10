import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-primary-500/40 animate-float">
            ✈
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Travel<span className="gradient-text">oop</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-sm leading-relaxed">
            Personalized Travel Planning Made Easy. Build multi-city itineraries, track your budget, and explore the world.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: '🗺️', title: 'Multi-City Planning', desc: 'Build complex itineraries with drag & drop' },
              { icon: '💰', title: 'Smart Budgeting', desc: 'Real-time cost tracking and alerts' },
              { icon: '📋', title: 'Packing Lists', desc: 'Never forget essentials again' },
              { icon: '🔗', title: 'Easy Sharing', desc: 'Share trips with friends instantly' },
            ].map(f => (
              <div key={f.title} className="glass p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-white text-sm font-semibold">{f.title}</h3>
                <p className="text-slate-500 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-dark-900">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-xl">✈</div>
            <span className="font-bold text-white text-xl">Traveloop</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
