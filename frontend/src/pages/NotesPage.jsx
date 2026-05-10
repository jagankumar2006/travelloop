import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { noteAPI, tripAPI } from '../services/api'
import { format } from 'date-fns'

export default function NotesPage() {
  const { id } = useParams()
  const [notes, setNotes] = useState([])
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [stopId, setStopId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    loadData()
    tripAPI.getById(id).then(r => setStops(r.data.stops || []))
  }, [id])

  const loadData = async () => {
    const r = await noteAPI.get(id, { sort: sortDir })
    setNotes(r.data)
    setLoading(false)
  }

  useEffect(() => {
    noteAPI.get(id, { sort: sortDir }).then(r => setNotes(r.data))
  }, [sortDir])

  const addNote = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    const r = await noteAPI.create({ trip_id: id, content, stop_id: stopId || undefined })
    setNotes(p => sortDir === 'desc' ? [r.data.note, ...p] : [...p, r.data.note])
    setContent('')
    setStopId('')
  }

  const saveEdit = async (noteId) => {
    if (!editContent.trim()) return
    const r = await noteAPI.update(noteId, { content: editContent })
    setNotes(p => p.map(n => n.id === noteId ? r.data.note : n))
    setEditingId(null)
  }

  const deleteNote = async (noteId) => {
    await noteAPI.delete(noteId)
    setNotes(p => p.filter(n => n.id !== noteId))
  }

  const stopName = (stopId) => {
    const s = stops.find(s => s.id === stopId)
    return s ? `📍 ${s.city_name}` : null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl">📓 Trip Journal</h1>
          <p className="section-sub">Notes, reminders, and memories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSortDir(p => p === 'desc' ? 'asc' : 'desc')} className="btn-secondary text-sm py-2">
            {sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
          <Link to={`/trips/${id}/view`} className="btn-secondary text-sm py-2">← Back</Link>
        </div>
      </div>

      {/* Add note */}
      <form onSubmit={addNote} className="glass p-4 space-y-3">
        <textarea id="note-content" className="input min-h-[100px] resize-none" placeholder="Write a note, reminder, or memory..."
          value={content} onChange={e => setContent(e.target.value)} />
        <div className="flex gap-3">
          <select id="note-stop-select" className="input flex-1 text-sm" value={stopId} onChange={e => setStopId(e.target.value)}>
            <option value="">📌 Trip-level note</option>
            {stops.map(s => <option key={s.id} value={s.id}>📍 {s.city_name}</option>)}
          </select>
          <button id="add-note-btn" type="submit" className="btn-primary px-6">Add Note</button>
        </div>
      </form>

      {loading ? (
        <div className="glass p-10 text-center text-slate-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="glass p-10 text-center">
          <div className="text-5xl mb-3">📓</div>
          <p className="text-slate-400">No notes yet. Add your first travel note!</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-5 group hover:border-primary-500/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {note.stop_id && stopName(note.stop_id) && (
                    <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs">
                      {stopName(note.stop_id)}
                    </span>
                  )}
                  <span className="text-slate-600 text-xs">
                    {format(new Date(note.created_at), 'MMM d, yyyy • h:mm a')}
                    {note.updated_at !== note.created_at && ' • edited'}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button id={`edit-note-${note.id}`} onClick={() => { setEditingId(note.id); setEditContent(note.content) }}
                    className="text-slate-500 hover:text-primary-400 text-sm transition-colors">✏️</button>
                  <button id={`delete-note-${note.id}`} onClick={() => deleteNote(note.id)}
                    className="text-slate-500 hover:text-red-400 text-sm transition-colors">🗑️</button>
                </div>
              </div>

              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea className="input min-h-[80px] resize-none text-sm" value={editContent}
                    onChange={e => setEditContent(e.target.value)} autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(note.id)} className="btn-primary text-xs py-1.5 px-4">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1.5 px-4">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
