import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { tripAPI } from '../services/api'
import { format } from 'date-fns'

export default function MyTripsPage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at')
  const [deleting, setDeleting] = useState(null)

  const fetchTrips = () => {
    setLoading(true)
    tripAPI.getAll({ search, sort }).then(r => setTrips(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTrips() }, [search, sort])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return
    setDeleting(id)
    await tripAPI.delete(id)
    setTrips(p => p.filter(t => t.id !== id))
    setDeleting(null)
  }

  const statusBadge = (trip) => {
    const now = new Date()
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    if (now < start) return { label: 'Upcoming', cls: 'bg-primary-500/20 text-primary-400 border-primary-500/30' }
    if (now <= end)  return { label: 'Ongoing', cls: 'bg-green-500/20 text-green-400 border-green-500/30' }
    return { label: 'Completed', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="section-title text-3xl">✈️ My Trips</h1>
          <p className="section-sub">Manage all your travel plans</p>
        </div>
        <Link to="/trips/new" id="new-trip-btn" className="btn-primary inline-flex items-center gap-2 self-start">
          + Plan New Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input id="trip-search" type="text" className="input pl-10" placeholder="Search trips..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>
        <select id="trip-sort" className="input sm:w-48" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="created_at">Newest First</option>
          <option value="start_date">By Date</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="glass h-56 animate-pulse rounded-2xl" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="glass p-16 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-white text-xl font-semibold mb-2">{search ? 'No trips found' : 'No trips yet'}</h3>
          <p className="text-slate-400 mb-6">{search ? 'Try a different search term' : 'Start planning your first adventure!'}</p>
          {!search && <Link to="/trips/new" className="btn-primary inline-flex">Plan Your First Trip</Link>}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip, i) => {
              const badge = statusBadge(trip)
              return (
                <motion.div key={trip.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  className="glass group hover:border-primary-500/40 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 overflow-hidden">
                  {/* Cover */}
                  <div className="h-36 bg-gradient-to-br from-primary-900/50 to-secondary-900/50 overflow-hidden relative cursor-pointer"
                    onClick={() => navigate(`/trips/${trip.id}/view`)}>
                    {trip.cover_photo
                      ? <img src={trip.cover_photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">✈️</div>}
                    <div className="absolute top-3 right-3">
                      <span className={`badge border ${badge.cls}`}>{badge.label}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white truncate text-lg mb-1 cursor-pointer hover:text-primary-400 transition-colors"
                      onClick={() => navigate(`/trips/${trip.id}/view`)}>{trip.name}</h3>
                    <p className="text-slate-500 text-xs mb-3">
                      📅 {format(new Date(trip.start_date), 'MMM d')} – {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-400 text-xs">🌍 {trip.stop_count || 0} cities</span>
                      <span className="text-slate-400 text-xs">
                        💰 {trip.total_budget > 0 ? `$${parseFloat(trip.total_budget).toLocaleString()}` : 'No budget set'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/trips/${trip.id}/builder`)} className="btn-secondary flex-1 text-xs py-2">
                        🗺️ Builder
                      </button>
                      <button onClick={() => navigate(`/trips/${trip.id}/edit`)} className="btn-secondary flex-1 text-xs py-2">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(trip.id)} disabled={deleting === trip.id}
                        className="btn-danger text-xs py-2 px-3">
                        {deleting === trip.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
