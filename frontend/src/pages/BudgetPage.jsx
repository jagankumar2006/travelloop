import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { budgetAPI } from '../services/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ef4444']
const CATEGORIES = ['transport', 'stay', 'activities', 'meals', 'miscellaneous']
const CAT_LABELS  = { transport: '✈️ Transport', stay: '🏨 Stay', activities: '🎯 Activities', meals: '🍽️ Meals', miscellaneous: '📦 Misc' }

export default function BudgetPage() {
  const { id } = useParams()
  const [budget, setBudget] = useState(null)
  const [form, setForm] = useState({ total_budget: 0, transport: 0, stay: 0, activities: 0, meals: 0, miscellaneous: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    const r = await budgetAPI.get(id)
    setBudget(r.data)
    setForm({
      total_budget:  r.data.total_budget  || 0,
      transport:     r.data.transport     || 0,
      stay:          r.data.stay          || r.data.computed_stay_cost || 0,
      activities:    r.data.activities    || r.data.computed_activity_cost || 0,
      meals:         r.data.meals         || 0,
      miscellaneous: r.data.miscellaneous || 0,
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleSave = async () => {
    setSaving(true)
    await budgetAPI.update(id, form)
    await load()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const totalSpent = CATEGORIES.reduce((s, c) => s + parseFloat(form[c] || 0), 0)
  const remaining  = parseFloat(form.total_budget || 0) - totalSpent
  const overBudget = form.total_budget > 0 && remaining < 0
  const pct = form.total_budget > 0 ? Math.min(100, (totalSpent / form.total_budget) * 100) : 0

  const pieData  = CATEGORIES.filter(c => form[c] > 0).map((c, i) => ({ name: CAT_LABELS[c], value: parseFloat(form[c]), color: COLORS[i] }))
  const barData  = CATEGORIES.map((c, i) => ({ name: c.charAt(0).toUpperCase() + c.slice(1), amount: parseFloat(form[c] || 0), fill: COLORS[i] }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl">💰 Budget Planner</h1>
          <p className="section-sub">Track and optimize your travel spending</p>
        </div>
        <Link to={`/trips/${id}/view`} className="btn-secondary text-sm py-2">← Back to Trip</Link>
      </div>

      {/* Over budget alert */}
      {overBudget && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="text-red-400 font-semibold">Over Budget!</div>
            <div className="text-red-400/70 text-sm">You're ${Math.abs(remaining).toFixed(0)} over your total budget.</div>
          </div>
        </motion.div>
      )}

      {/* Budget progress */}
      <div className="glass p-6">
        <div className="flex justify-between mb-2">
          <span className="text-slate-400 text-sm">Spent: <span className="text-white font-semibold">${totalSpent.toFixed(0)}</span></span>
          <span className="text-slate-400 text-sm">Budget: <span className={`font-semibold ${overBudget ? 'text-red-400' : 'text-white'}`}>${parseFloat(form.total_budget).toFixed(0)}</span></span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden mb-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-colors ${overBudget ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'}`} />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{pct.toFixed(1)}% used</span>
          <span className={remaining >= 0 ? 'text-green-400' : 'text-red-400'}>
            {remaining >= 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget`}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input form */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Edit Budget</h2>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Total Budget ($)</label>
            <input id="total-budget" type="number" className="input" min="0"
              value={form.total_budget} onChange={e => setForm(p => ({ ...p, total_budget: e.target.value }))} />
          </div>
          {CATEGORIES.map((cat, i) => (
            <div key={cat}>
              <label className="text-sm text-slate-400 mb-2 block">{CAT_LABELS[cat]}</label>
              <input id={`budget-${cat}`} type="number" className="input" min="0"
                value={form[cat]} onChange={e => setForm(p => ({ ...p, [cat]: e.target.value }))} />
            </div>
          ))}
          <button id="save-budget-btn" onClick={handleSave} disabled={saving} className="btn-primary w-full py-3">
            {saving ? '...' : saved ? '✓ Saved!' : '💾 Save Budget'}
          </button>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {pieData.length > 0 && (
            <div className="glass p-5">
              <h3 className="text-white font-semibold mb-4">Spending Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass p-5">
            <h3 className="text-white font-semibold mb-4">Category Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${v}`, 'Amount']} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {barData.map((d, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Smart recommendations */}
      <div className="glass p-5">
        <h3 className="text-white font-semibold mb-4">💡 Budget Tips</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '🏨', tip: 'Book accommodations 3+ months early to save 20-40%.' },
            { icon: '🍜', tip: 'Eat at local markets and street food stalls to save on meals.' },
            { icon: '✈️', tip: 'Use budget airlines and book mid-week for cheaper flights.' },
          ].map((t, i) => (
            <div key={i} className="p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="text-slate-400 text-xs">{t.tip}</p>
            </div>
          ))}
        </div>

        {budget?.cheapest_recommendations?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-slate-300 text-sm font-medium mb-2">💰 Most Budget-Friendly Cities on Your Trip:</h4>
            <div className="flex flex-wrap gap-2">
              {budget.cheapest_recommendations.map((r, i) => (
                <span key={i} className="badge bg-green-500/20 text-green-400 border border-green-500/30">
                  {r.city} – ${r.cost_index}/day
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
