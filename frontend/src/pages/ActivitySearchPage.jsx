import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { activityAPI } from '../services/api'

const CATEGORIES = ['', 'Adventure', 'Food', 'Sightseeing', 'Culture', 'Shopping', 'Wellness', 'Nightlife']
const CAT_ICONS = { Adventure:'🏔️', Food:'🍜', Sightseeing:'👁️', Culture:'🏛️', Shopping:'🛍️', Wellness:'🧘', Nightlife:'🌙', Other:'🎯' }

export default function ActivitySearchPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [maxCost, setMaxCost] = useState('')
  const [maxDuration, setMaxDuration] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const t = setTimeout(fetch, 300)
    return () => clearTimeout(t)
  }, [search, category, maxCost, maxDuration])

  const fetch = async () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    if (maxCost) params.max_cost = maxCost
    if (maxDuration) params.max_duration = maxDuration
    const r = await activityAPI.getAll(params)
    setActivities(r.data)
    setLoading(false)
  }

  const costColor = (cost) => {
    if (cost === 0) return 'text-green-400'
    if (cost < 30) return 'text-primary-400'
    if (cost < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-3xl">🎯 Browse Activities</h1>
        <p className="section-sub">Discover things to do on your trip</p>
      </div>

      {/* Filters */}
      <div className="glass p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <input id="activity-search" type="text" className="input pl-10 text-sm" placeholder="Search activities..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          </div>
          <select id="category-filter" className="input text-sm" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <input id="max-cost-filter" type="number" className="input text-sm" placeholder="Max cost ($)"
            value={maxCost} onChange={e => setMaxCost(e.target.value)} min="0" />
          <input id="max-duration-filter" type="number" className="input text-sm" placeholder="Max duration (hrs)"
            value={maxDuration} onChange={e => setMaxDuration(e.target.value)} min="0" />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.filter(Boolean).map(cat => (
          <button key={cat} onClick={() => setCategory(category === cat ? '' : cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
            <span>{CAT_ICONS[cat]}</span>{cat}
          </button>
        ))}
      </div>

      <p className="text-slate-500 text-sm">{activities.length} activities found</p>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="glass h-48 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act, i) => (
            <motion.div key={act.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(selected?.id === act.id ? null : act)}
              className={`glass group cursor-pointer hover:border-primary-500/40 transition-all duration-300 p-5 ${selected?.id === act.id ? 'border-primary-500/50' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  {CAT_ICONS[act.category] || '🎯'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{act.name}</h3>
                  <span className="text-xs text-slate-500">{act.category}</span>
                </div>
              </div>

              {act.description && <p className="text-slate-400 text-xs mb-3 line-clamp-2">{act.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <span className="text-slate-400 text-xs">⏱ {act.duration_hrs}h</span>
                  <span className={`text-xs font-semibold ${costColor(act.estimated_cost)}`}>
                    {act.estimated_cost === 0 ? 'Free' : `$${act.estimated_cost}`}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selected?.id === act.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                  {selected?.id === act.id ? 'Selected' : 'Preview'}
                </span>
              </div>

              {/* Expanded preview */}
              {selected?.id === act.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-slate-300 text-xs">{act.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-slate-500">Duration</div>
                      <div className="text-white font-medium">{act.duration_hrs} hours</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-slate-500">Est. Cost</div>
                      <div className={`font-medium ${costColor(act.estimated_cost)}`}>
                        {act.estimated_cost === 0 ? 'Free' : `$${act.estimated_cost}`}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-3">Add this activity from the Itinerary Builder → select a city stop → click Activities.</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activities.length === 0 && !loading && (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-slate-400">No activities found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}
