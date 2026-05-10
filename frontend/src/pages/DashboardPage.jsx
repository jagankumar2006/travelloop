import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { tripAPI, cityAPI } from '../services/api'
import { format, differenceInDays } from 'date-fns'

const DESTINATIONS = [
  { name: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', tag: 'Budget Friendly' },
  { name: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', tag: 'Cultural' },
  { name: 'Santorini', country: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400', tag: 'Romantic' },
  { name: 'Bangkok', country: 'Thailand', img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400', tag: 'Adventure' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tripAPI.getAll().then(r => setTrips(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const upcoming = trips.filter(t => new Date(t.start_date) >= new Date())
  const recent = trips.filter(t => new Date(t.start_date) < new Date()).slice(0, 3)
  const totalBudget = trips.reduce((s, t) => s + (parseFloat(t.total_budget) || 0), 0)

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: '✈️', color: 'from-primary-500 to-primary-600' },
    { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'from-secondary-500 to-secondary-600' },
    { label: 'Cities Visited', value: trips.reduce((s, t) => s + (t.stop_count || 0), 0), icon: '🌍', color: 'from-emerald-500 to-teal-600' },
    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, icon: '💰', color: 'from-accent-500 to-orange-500' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass p-8 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-slate-400 mb-6 max-w-lg">Ready to plan your next adventure? You have {upcoming.length} upcoming trip{upcoming.length !== 1 ? 's' : ''}.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/trips/new" id="plan-new-trip-btn" className="btn-primary inline-flex items-center gap-2">
              ✈ Plan New Trip
            </Link>
            <Link to="/cities" className="btn-secondary inline-flex items-center gap-2">
              🌍 Explore Cities
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass p-5 hover:scale-105 transition-transform duration-300">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming trips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming Trips</h2>
            <Link to="/trips" className="text-primary-400 text-sm hover:text-primary-300 transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="glass p-8 text-center text-slate-500">Loading trips...</div>
          ) : upcoming.length === 0 ? (
            <div className="glass p-8 text-center">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="text-slate-400 mb-4">No upcoming trips yet. Start planning!</p>
              <Link to="/trips/new" className="btn-primary inline-flex">Plan Your First Trip</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((trip, i) => (
                <motion.div key={trip.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass-hover p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.id}/view`)}>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/30 to-secondary-500/30 flex-shrink-0 overflow-hidden">
                    {trip.cover_photo
                      ? <img src={trip.cover_photo} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">✈️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{trip.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {format(new Date(trip.start_date), 'MMM d')} – {format(new Date(trip.end_date), 'MMM d, yyyy')}
                      {' • '}{trip.stop_count || 0} cities
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-primary-400 text-sm font-semibold">
                      {differenceInDays(new Date(trip.start_date), new Date())} days
                    </div>
                    <div className="text-slate-600 text-xs">to go</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended */}
        <div>
          <h2 className="section-title mb-4">Recommended</h2>
          <div className="space-y-3">
            {DESTINATIONS.map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-hover p-3 flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/cities')}>
                <img src={d.img} alt={d.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium">{d.name}</h3>
                  <p className="text-slate-500 text-xs">{d.country}</p>
                </div>
                <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs">{d.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/trips/new', icon: '✈️', label: 'New Trip', desc: 'Start planning' },
            { to: '/cities', icon: '🌍', label: 'Cities', desc: 'Explore destinations' },
            { to: '/activities', icon: '🎯', label: 'Activities', desc: 'Browse things to do' },
            { to: '/trips', icon: '📋', label: 'My Trips', desc: 'Manage your plans' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="glass-hover p-4 text-center group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{a.icon}</div>
              <div className="text-white text-sm font-medium">{a.label}</div>
              <div className="text-slate-500 text-xs mt-0.5">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
