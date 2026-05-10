import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cityAPI } from '../services/api'

const SEASONS = ['', 'Spring', 'Summer', 'Autumn', 'Winter', 'Any Season']
const REGIONS  = ['', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Middle East']

export default function CitySearchPage() {
  const [cities, setCities] = useState([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(new Set())
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => fetchCities(), 300)
    return () => clearTimeout(timer)
  }, [search, region])

  useEffect(() => {
    cityAPI.getSaved().then(r => setSaved(new Set(r.data.map(c => c.id)))).catch(() => {})
  }, [])

  const fetchCities = async () => {
    setLoading(true)
    const r = await cityAPI.search({ search, region, limit: 20 })
    setCities(r.data)
    setLoading(false)
  }

  const toggleSave = async (city) => {
    if (saved.has(city.id)) {
      await cityAPI.unsave(city.id)
      setSaved(p => { const n = new Set(p); n.delete(city.id); return n })
    } else {
      await cityAPI.save(city.id)
      setSaved(p => new Set([...p, city.id]))
    }
  }

  const costLabel = (ci) => {
    if (ci < 50) return { label: 'Budget', cls: 'bg-green-500/20 text-green-400 border-green-500/30' }
    if (ci < 100) return { label: 'Moderate', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    return { label: 'Expensive', cls: 'bg-red-500/20 text-red-400 border-red-500/30' }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-3xl">🌍 Explore Cities</h1>
        <p className="section-sub">Discover and save amazing destinations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input id="city-search" type="text" className="input pl-10" placeholder="Search any city or country..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>
        <select id="region-filter" className="input sm:w-44" value={region} onChange={e => setRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r} value={r}>{r || 'All Regions'}</option>)}
        </select>
      </div>

      {/* City grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="glass h-64 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cities.map((city, i) => {
            const cost = costLabel(city.cost_index)
            return (
              <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass group overflow-hidden hover:border-primary-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer"
                onClick={() => setSelected(selected?.id === city.id ? null : city)}>
                {/* Image */}
                <div className="h-40 overflow-hidden relative">
                  <img src={city.image_url} alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                  <button onClick={e => { e.stopPropagation(); toggleSave(city) }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${saved.has(city.id) ? 'bg-red-500 text-white' : 'bg-black/50 text-slate-300 hover:bg-red-500 hover:text-white'}`}>
                    {saved.has(city.id) ? '♥' : '♡'}
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-bold text-lg leading-none">{city.name}</h3>
                    <p className="text-slate-300 text-xs">{city.country}</p>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge border text-xs ${cost.cls}`}>{cost.label}</span>
                    <span className="text-slate-500 text-xs">~${city.cost_index}/day</span>
                    {city.suggested_season && (
                      <span className="badge bg-secondary-500/20 text-secondary-400 border-secondary-500/30 text-xs">
                        {city.suggested_season}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* City detail panel */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-6 border-primary-500/40">
          <div className="flex flex-col md:flex-row gap-6">
            <img src={selected.image_url} alt={selected.name}
              className="w-full md:w-64 h-40 object-cover rounded-2xl flex-shrink-0"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400' }} />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                  <p className="text-slate-400">{selected.country}{selected.region ? ` • ${selected.region}` : ''}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              {selected.description && <p className="text-slate-400 text-sm mb-4">{selected.description}</p>}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass p-3 text-center">
                  <div className="text-primary-400 text-lg font-bold">${selected.cost_index}</div>
                  <div className="text-slate-500 text-xs">Cost/day</div>
                </div>
                <div className="glass p-3 text-center">
                  <div className="text-accent-400 text-lg font-bold">#{selected.popularity}</div>
                  <div className="text-slate-500 text-xs">Popularity</div>
                </div>
                <div className="glass p-3 text-center">
                  <div className="text-secondary-400 text-sm font-semibold">{selected.suggested_season || 'Any'}</div>
                  <div className="text-slate-500 text-xs">Best season</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {cities.length === 0 && !loading && (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-3">🌐</div>
          <p className="text-slate-400">No cities found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}
