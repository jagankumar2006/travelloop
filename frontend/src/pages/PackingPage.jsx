import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { packingAPI } from '../services/api'

const CATEGORIES = ['Clothing', 'Documents', 'Electronics', 'Medicines', 'Toiletries', 'Accessories', 'General']
const CAT_ICONS  = { Clothing:'👕', Documents:'📄', Electronics:'📱', Medicines:'💊', Toiletries:'🧴', Accessories:'👜', General:'📦' }

export default function PackingPage() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ name: '', category: 'General' })
  const [filter, setFilter] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    packingAPI.get(id).then(r => setItems(r.data)).finally(() => setLoading(false))
  }, [id])

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.name.trim()) return
    const r = await packingAPI.add({ trip_id: id, ...newItem })
    setItems(p => [...p, r.data.item])
    setNewItem(p => ({ ...p, name: '' }))
  }

  const toggle = async (item) => {
    const updated = { ...item, is_packed: !item.is_packed }
    setItems(p => p.map(i => i.id === item.id ? updated : i))
    await packingAPI.update(item.id, { is_packed: !item.is_packed })
  }

  const deleteItem = async (id) => {
    setItems(p => p.filter(i => i.id !== id))
    await packingAPI.delete(id)
  }

  const resetAll = async () => {
    if (!window.confirm('Reset all items to unpacked?')) return
    setResetting(true)
    await packingAPI.reset(id)
    setItems(p => p.map(i => ({ ...i, is_packed: 0 })))
    setResetting(false)
  }

  const filtered = filter ? items.filter(i => i.category === filter) : items
  const packed   = items.filter(i => i.is_packed).length
  const pct      = items.length > 0 ? Math.round((packed / items.length) * 100) : 0

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl">🧳 Packing List</h1>
          <p className="section-sub">Stay organized for your trip</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} disabled={resetting} className="btn-secondary text-sm py-2">
            {resetting ? '...' : '↺ Reset'}
          </button>
          <Link to={`/trips/${id}/view`} className="btn-secondary text-sm py-2">← Back</Link>
        </div>
      </div>

      {/* Progress */}
      <div className="glass p-5">
        <div className="flex justify-between mb-2">
          <span className="text-white font-semibold">{packed} / {items.length} packed</span>
          <span className={`font-bold ${pct === 100 ? 'text-green-400' : 'text-primary-400'}`}>{pct}%</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'}`} />
        </div>
        {pct === 100 && <p className="text-green-400 text-sm mt-2 text-center">🎉 All packed! You're ready to go!</p>}
      </div>

      {/* Add item form */}
      <form onSubmit={addItem} className="glass p-4 flex gap-3">
        <input id="packing-item-input" type="text" className="input flex-1" placeholder="Add item..."
          value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
        <select id="packing-category-select" className="input w-36 text-sm" value={newItem.category}
          onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button id="add-packing-item-btn" type="submit" className="btn-primary px-4">+ Add</button>
      </form>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filter ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          All ({items.length})
        </button>
        {CATEGORIES.filter(c => items.some(i => i.category === c)).map(c => (
          <button key={c} onClick={() => setFilter(filter === c ? '' : c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === c ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {CAT_ICONS[c]} {c} ({items.filter(i => i.category === c).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass p-10 text-center text-slate-500">Loading items...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass p-10 text-center">
          <div className="text-5xl mb-3">🧳</div>
          <p className="text-slate-400">{filter ? `No ${filter} items` : 'No items yet. Add your first packing item!'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="glass p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                {CAT_ICONS[cat]} {cat}
                <span className="text-xs text-slate-500 font-normal">({catItems.filter(i => i.is_packed).length}/{catItems.length})</span>
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {catItems.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                      <button id={`pack-item-${item.id}`} onClick={() => toggle(item)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.is_packed ? 'bg-primary-500 border-primary-500 text-white' : 'border-white/20 hover:border-primary-500'}`}>
                        {item.is_packed && <span className="text-xs">✓</span>}
                      </button>
                      <span className={`flex-1 text-sm transition-all ${item.is_packed ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                        {item.name}
                      </span>
                      <button onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs">✕</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
