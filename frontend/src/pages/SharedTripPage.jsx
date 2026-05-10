import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { shareAPI } from '../services/api'
import { format, differenceInDays } from 'date-fns'

export default function SharedTripPage() {
  const { token } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    shareAPI.getPublic(token)
      .then(r => setTrip(r.data))
      .catch(() => setError('This shared itinerary was not found or has been removed.'))
      .finally(() => setLoading(false))
  }, [token])

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=Check out my travel itinerary on Traveloop!&url=${encodeURIComponent(window.location.href)}`, '_blank')
  const shareOnWhatsApp = () => window.open(`https://wa.me/?text=Check out my trip: ${encodeURIComponent(window.location.href)}`, '_blank')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400">Loading itinerary...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="glass p-10 text-center max-w-md">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-white text-xl font-bold mb-2">Itinerary Not Found</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    </div>
  )

  const totalDays = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1

  return (
    <div className="min-h-screen bg-dark-900 p-4 md:p-8">
      {/* Header banner */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-xl">✈</div>
          <div>
            <span className="text-white font-bold">Traveloop</span>
            <span className="text-slate-500 text-sm ml-2">• Shared Itinerary</span>
          </div>
        </div>

        {/* Trip header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass overflow-hidden rounded-3xl mb-6">
          {trip.cover_photo && (
            <div className="h-48 relative">
              <img src={trip.cover_photo} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-primary-400 text-sm mb-1">Shared by {trip.author_name}</p>
                <h1 className="text-3xl font-black text-white mb-2">{trip.name}</h1>
                {trip.description && <p className="text-slate-400 mb-4">{trip.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                  <span>📅 {format(new Date(trip.start_date), 'MMM d')} – {format(new Date(trip.end_date), 'MMM d, yyyy')}</span>
                  <span>⏱ {totalDays} days</span>
                  <span>🌍 {trip.stops?.length || 0} cities</span>
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <button onClick={copyUrl} className="btn-secondary text-sm py-2">
                {copied ? '✓ Copied!' : '🔗 Copy Link'}
              </button>
              <button onClick={shareOnTwitter} className="btn-secondary text-sm py-2">🐦 Twitter</button>
              <button onClick={shareOnWhatsApp} className="btn-secondary text-sm py-2">💬 WhatsApp</button>
            </div>
          </div>
        </motion.div>

        {/* Stops timeline */}
        <div className="relative pl-8">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-secondary-500/20" />

          {(trip.stops || []).map((stop, i) => (
            <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="relative mb-6">
              <div className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-primary-500 border-4 border-dark-900 shadow-lg shadow-primary-500/50 z-10" />

              <div className="glass p-5 ml-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-primary-400 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-full">Stop {i + 1}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{stop.city_name}</h3>
                    <p className="text-slate-500 text-sm">{stop.country}</p>
                    {stop.arrival_date && (
                      <p className="text-slate-600 text-xs mt-1">
                        {format(new Date(stop.arrival_date), 'MMM d')}
                        {stop.departure_date && ` – ${format(new Date(stop.departure_date), 'MMM d, yyyy')}`}
                      </p>
                    )}
                  </div>
                  {stop.city_image && (
                    <img src={stop.city_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                </div>

                {stop.activities?.length > 0 && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <h4 className="text-slate-400 text-xs font-medium mb-2">Activities ({stop.activities.length})</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {stop.activities.map(a => (
                        <div key={a.id} className="flex items-center gap-2 p-2 bg-white/3 rounded-lg">
                          <span className="text-sm">{{ Adventure:'🏔️', Food:'🍜', Sightseeing:'👁️', Culture:'🏛️', Shopping:'🛍️' }[a.category] || '🎯'}</span>
                          <div>
                            <div className="text-white text-xs font-medium">{a.name}</div>
                            <div className="text-slate-600 text-xs">{a.duration_hrs}h • ${parseFloat(a.custom_cost ?? a.base_cost ?? 0).toFixed(0)}</div>
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

        {/* Budget summary */}
        {trip.budget?.total_budget > 0 && (
          <div className="glass p-5 mt-4">
            <h3 className="text-white font-semibold mb-3">💰 Budget Overview</h3>
            <div className="text-2xl font-bold text-primary-400">${parseFloat(trip.budget.total_budget).toLocaleString()}</div>
            <p className="text-slate-500 text-sm">Estimated total budget</p>
          </div>
        )}

        <div className="text-center mt-8 text-slate-600 text-sm">
          <p>Created with <span className="text-primary-400">Traveloop</span> – Personalized Travel Planning Made Easy</p>
        </div>
      </div>
    </div>
  )
}
