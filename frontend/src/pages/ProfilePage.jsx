import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

const LANGUAGES = [
  { code: 'ta', label: '🇮🇳 Tamil' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'hi', label: '🇮🇳 Hindi' },
]

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', language: user?.language || 'en' })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handlePhoto = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('email', form.email)
      fd.append('language', form.language)
      if (photoFile) fd.append('profile_photo', photoFile)
      const r = await authAPI.updateProfile(fd)
      updateUser(r.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account and all your trips.')) return
    await authAPI.deleteAccount()
    logout()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-3xl">👤 Profile & Settings</h1>
        <p className="section-sub">Manage your account preferences</p>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* Profile photo */}
      <div className="glass p-6">
        <h2 className="text-white font-semibold mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current.click()}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 overflow-hidden flex items-center justify-center text-3xl font-bold text-white">
              {photoPreview
                ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                : user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
              <span className="text-white text-xs">📷</span>
            </div>
          </div>
          <div>
            <button onClick={() => fileRef.current.click()} className="btn-secondary text-sm py-2 mb-1">
              Upload Photo
            </button>
            <p className="text-slate-500 text-xs">JPG, PNG, GIF up to 5MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      {/* Personal info */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-white font-semibold">Personal Information</h2>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Full Name</label>
          <input id="profile-name" type="text" className="input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Email Address</label>
          <input id="profile-email" type="email" className="input" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
      </div>

      {/* Preferences */}
      <div className="glass p-6">
        <h2 className="text-white font-semibold mb-4">Preferences</h2>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Language</label>
          <select id="profile-language" className="input" value={form.language}
            onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Account info */}
      <div className="glass p-6">
        <h2 className="text-white font-semibold mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-slate-500">Role:</span>
            <span className={`ml-2 badge ${user?.role === 'admin' ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-primary-500/20 text-primary-400 border-primary-500/30'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button id="save-profile-btn" onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3">
          {saving ? '...' : saved ? '✓ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="glass p-5 border-red-500/20">
        <h2 className="text-red-400 font-semibold mb-3">⚠️ Danger Zone</h2>
        <p className="text-slate-500 text-sm mb-3">Deleting your account will permanently remove all your trips, notes, and data.</p>
        <button id="delete-account-btn" onClick={handleDelete} className="btn-danger">
          🗑️ Delete My Account
        </button>
      </div>
    </div>
  )
}
