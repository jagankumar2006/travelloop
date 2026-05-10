import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tripAPI } from '../services/api'

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      tripAPI.getById(id).then(r => {
        const t = r.data
        setForm({
          name: t.name,
          description: t.description || '',
          start_date: t.start_date?.split('T')[0] || '',
          end_date: t.end_date?.split('T')[0] || '',
        })
        if (t.cover_photo) setCoverPreview(t.cover_photo)
      }).catch(console.error)
    }
  }, [id])

  const handleCover = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    if (!form.name.trim()) return 'Trip name is required'
    if (!form.start_date) return 'Start date is required'
    if (!form.end_date) return 'End date is required'
    if (new Date(form.start_date) > new Date(form.end_date)) return 'Start date must be before end date'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (coverFile) fd.append('cover_photo', coverFile)

      if (isEdit) {
        await tripAPI.update(id, fd)
        navigate(`/trips/${id}/view`)
      } else {
        const res = await tripAPI.create(fd)
        navigate(`/trips/${res.data.trip.id}/builder`)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save trip')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-1">{isEdit ? '✏️ Edit Trip' : '✈️ Plan New Trip'}</h1>
        <p className="section-sub mb-8">{isEdit ? 'Update your trip details' : 'Start your travel adventure'}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover photo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cover Photo (optional)</label>
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('cover-input').click()}>
              <div className={`w-full h-40 rounded-2xl border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:border-primary-500/50 ${coverPreview ? '' : 'bg-dark-800'}`}>
                {coverPreview
                  ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  : <div className="text-center text-slate-500">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm">Click to upload cover photo</div>
                    </div>
                }
              </div>
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Change Photo</span>
                </div>
              )}
            </div>
            <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={handleCover} />
          </div>

          {/* Trip name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Trip Name *</label>
            <input id="trip-name" type="text" className="input" placeholder="e.g. Europe Summer Adventure"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea id="trip-desc" className="input min-h-[100px] resize-none" placeholder="What's this trip about?"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
              <input id="trip-start" type="date" className="input" value={form.start_date}
                onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date *</label>
              <input id="trip-end" type="date" className="input" value={form.end_date}
                min={form.start_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} required />
            </div>
          </div>

          {form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date) && (
            <div className="flex items-center gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <span className="text-primary-400">📅</span>
              <span className="text-primary-400 text-sm">
                {Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60 * 24))} days trip
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button id="save-trip-btn" type="submit" className="btn-primary flex-1 py-3" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </span>
              ) : isEdit ? '💾 Save Changes' : '🗺️ Create & Build Itinerary'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
