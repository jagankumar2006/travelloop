import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { tripAPI, shareAPI } from '../services/api'
import { format, differenceInDays } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function ItineraryViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('timeline') // timeline | list | calendar
  const [shareInfo, setShareInfo] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const contentRef = useRef()

  useEffect(() => {
    tripAPI.getById(id).then(r => {
      setTrip(r.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handleShare = async () => {
    setSharing(true)
    try {
      const res = await shareAPI.share(id)
      setShareInfo(res.data)
    } catch(e) { console.error(e) }
    finally { setSharing(false) }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const canvas = await html2canvas(contentRef.current, { backgroundColor: '#0f172a', scale: 1.5 })
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(img, 'PNG', 0, 0, w, Math.min(h, 297))
      pdf.save(`${trip?.name || 'itinerary'}.pdf`)
    } catch(e) { console.error(e) }
    finally { setExporting(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!trip) return <div className="glass p-8 text-center text-slate-400">Trip not found</div>

  const totalDays = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1
  const totalCost = trip.stops?.reduce((sum, stop) =>
    sum + (stop.activities?.reduce((s, a) => s + parseFloat(a.custom_cost ?? a.base_cost ?? 0), 0) || 0), 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative glass overflow-hidden rounded-3xl">
        {trip.cover_photo && (
          <div className="absolute inset-0">
            <img src={trip.cover_photo} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900 to-dark-900/60" />
          </div>
        )}
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
            <div>
              <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white text-sm mb-3 transition-colors">← Back</button>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{trip.name}</h1>
              {trip.description && <p className="text-slate-400 mb-4 max-w-lg">{trip.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  📅 {format(new Date(trip.start_date), 'MMM d')} – {format(new Date(trip.end_date), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-2 text-slate-300">⏱ {totalDays} days</span>
                <span className="flex items-center gap-2 text-slate-300">🌍 {trip.stops?.length || 0} cities</span>
                <span className="flex items-center gap-2 text-primary-400">💰 ${totalCost.toFixed(0)} activities</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/trips/${id}/builder`} className="btn-secondary text-sm py-2">✏️ Edit</Link>
              <Link to={`/trips/${id}/budget`} className="btn-secondary text-sm py-2">💰 Budget</Link>
              <button onClick={handleShare} disabled={sharing} className="btn-secondary text-sm py-2">
                {sharing ? '...' : '🔗 Share'}
              </button>
              <button onClick={handleExportPDF} disabled={exporting} className="btn-primary text-sm py-2">
                {exporting ? '...' : '📄 Export PDF'}
              </button>
            </div>
          </div>

          {shareInfo && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
              <span className="text-green-400 text-sm">🔗 Share link:</span>
              <code className="text-green-300 text-xs flex-1">http://localhost:5173/share/{shareInfo.public_token}</code>
              <button onClick={() => navigator.clipboard.writeText(`http://localhost:5173/share/${shareInfo.public_token}`)}
                className="btn-secondary text-xs py-1">Copy</button>
            </motion.div>
          )}
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2">
        {[['timeline', '📍 Timeline'], ['list', '📋 List'], ['calendar', '📅 Calendar']].map(([mode, label]) => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === mode ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'btn-secondary'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Itinerary content */}
      <div ref={contentRef}>
        {viewMode === 'timeline' && <TimelineView stops={trip.stops || []} />}
        {viewMode === 'list' && <ListView stops={trip.stops || []} />}
        {viewMode === 'calendar' && <CalendarView trip={trip} />}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { to: `/trips/${id}/packing`, icon: '🧳', label: 'Packing List' },
          { to: `/trips/${id}/notes`,   icon: '📓', label: 'Trip Notes' },
          { to: `/trips/${id}/budget`,  icon: '💰', label: 'Budget' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} className="glass-hover p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function TimelineView({ stops }) {
  if (stops.length === 0) return (
    <div className="glass p-10 text-center">
      <div className="text-5xl mb-3">📍</div>
      <p className="text-slate-400">No stops added yet. <Link to="builder" className="text-primary-400">Go to Builder</Link></p>
    </div>
  )

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-primary-500/20" />

      {stops.map((stop, i) => (
        <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
          className="relative mb-6 last:mb-0">
          {/* Dot */}
          <div className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-primary-500 border-4 border-dark-900 shadow-lg shadow-primary-500/50 z-10" />

          <div className="glass p-5 ml-4 hover:border-primary-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">Stop {i + 1}</span>
                  {stop.arrival_date && <span className="text-xs text-slate-500">{format(new Date(stop.arrival_date), 'MMM d')} – {stop.departure_date ? format(new Date(stop.departure_date), 'MMM d') : '?'}</span>}
                </div>
                <h3 className="text-xl font-bold text-white">{stop.city_name}</h3>
                <p className="text-slate-500 text-sm">{stop.country}</p>
              </div>
              {stop.city_image && (
                <img src={stop.city_image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
            </div>

            {stop.activities?.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-slate-500 text-xs font-medium">Activities ({stop.activities.length})</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {stop.activities.map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-2 bg-white/3 rounded-lg border border-white/5">
                      <span className="text-sm">{{'Adventure':'🏔️','Food':'🍜','Sightseeing':'👁️','Culture':'🏛️','Shopping':'🛍️','Wellness':'🧘'}[a.category] || '🎯'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{a.name}</div>
                        <div className="text-slate-500 text-xs">{a.duration_hrs}h • ${parseFloat(a.custom_cost ?? a.base_cost ?? 0).toFixed(0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ListView({ stops }) {
  return (
    <div className="space-y-4">
      {stops.map((stop, i) => (
        <motion.div key={stop.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
          className="glass p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">{i+1}</div>
            <div>
              <h3 className="text-white font-bold">{stop.city_name}, {stop.country}</h3>
              <p className="text-slate-500 text-xs">
                {stop.arrival_date && `${format(new Date(stop.arrival_date), 'MMM d, yyyy')} → `}
                {stop.departure_date && format(new Date(stop.departure_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {stop.activities?.length > 0 && (
            <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
              {stop.activities.map(a => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-slate-300">{a.name}</span>
                  <span className="text-slate-500">${parseFloat(a.custom_cost ?? a.base_cost ?? 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function CalendarView({ trip }) {
  const stops = trip.stops || []
  return (
    <div className="glass p-6">
      <h3 className="text-white font-semibold mb-4">📅 Trip Timeline</h3>
      <div className="space-y-3">
        {stops.map((stop, i) => {
          const days = (stop.arrival_date && stop.departure_date)
            ? differenceInDays(new Date(stop.departure_date), new Date(stop.arrival_date))
            : 1
          return (
            <div key={stop.id} className="flex items-center gap-4">
              <div className="w-24 text-slate-500 text-xs text-right flex-shrink-0">
                {stop.arrival_date ? format(new Date(stop.arrival_date), 'MMM d') : '—'}
              </div>
              <div className="flex-1 bg-dark-700 rounded-full h-8 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center px-3"
                  style={{ width: `${Math.min(100, (days / 20) * 100 + 20)}%` }}>
                  <span className="text-white text-xs font-medium truncate">{stop.city_name} ({days}d)</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
