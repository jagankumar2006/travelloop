import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']
const CHART_STYLE = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return null

  const topCities = stats.popular_cities.slice(0, 8).map((c, i) => ({ name: c.name, visits: c.visit_count, fill: COLORS[i % COLORS.length] }))
  const monthlyData = [...stats.monthly_trips].reverse()
  const growthData  = [...stats.user_growth].reverse()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">⚙️ Admin Dashboard</h1>
        <p className="text-slate-400">Platform analytics and user management</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'from-primary-500 to-primary-600' },
          { label: 'Total Trips', value: stats.total_trips, icon: '✈️', color: 'from-secondary-500 to-secondary-600' },
          { label: 'Popular Cities', value: stats.popular_cities.length, icon: '🌍', color: 'from-emerald-500 to-teal-600' },
          { label: 'Activities Used', value: stats.popular_activities.reduce((s, a) => s + a.use_count, 0), icon: '🎯', color: 'from-accent-500 to-orange-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly trips */}
        <div className="glass p-5">
          <h3 className="text-white font-semibold mb-4">📈 Monthly Trips Created</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={CHART_STYLE} />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 3 }} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User growth */}
        <div className="glass p-5">
          <h3 className="text-white font-semibold mb-4">👥 User Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={CHART_STYLE} />
              <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular cities */}
        <div className="glass p-5">
          <h3 className="text-white font-semibold mb-4">🌍 Popular Destinations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCities} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v) => [v, 'Trips']} />
              <Bar dataKey="visits" radius={[0,4,4,0]}>
                {topCities.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular activities */}
        <div className="glass p-5">
          <h3 className="text-white font-semibold mb-4">🎯 Popular Activities</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {stats.popular_activities.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{a.name}</div>
                  <div className="text-xs text-slate-500">{a.category}</div>
                </div>
                <div className="text-primary-400 text-sm font-semibold">{a.use_count}×</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="glass p-5">
        <h3 className="text-white font-semibold mb-4">👥 Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Name</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Email</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Role</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.users.slice(0, 15).map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-2 px-3 text-white">{u.name}</td>
                  <td className="py-2 px-3 text-slate-400">{u.email}</td>
                  <td className="py-2 px-3">
                    <span className={`badge border text-xs ${u.role === 'admin' ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-primary-500/20 text-primary-400 border-primary-500/30'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
