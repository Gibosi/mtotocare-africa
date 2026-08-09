import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiClient } from '../api'
import { useToast } from '../components/Toast.jsx'

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phoneNumber || '')
  const [saving, setSaving] = useState(false)
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const saveProfile = async () => {
    setSaving(true); setMessage(null); setError(null)
    try {
      const res = await apiClient.put(`/users/${user.id}`, {
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
      })
      const updated = res.data?.data
      if (updated) updateUser(updated)
      setMessage('Profile updated successfully')
      showSuccess('Profile saved')
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Could not save profile'
      setError(msg)
      showError(msg)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setError(null)
    if (!pwCurrent || !pwNew) {
      const msg = 'Please enter your current and new password'
      setError(msg); showError(msg); return
    }
    if (pwNew.length < 8) {
      const msg = 'New password must be at least 8 characters'
      setError(msg); showError(msg); return
    }
    if (pwNew !== pwConfirm) {
      const msg = 'New passwords do not match'
      setError(msg); showError(msg); return
    }
    setPwSaving(true)
    try {
      // Correct endpoint: POST /auth/change-password (not /users/me/change-password)
      await apiClient.post('/auth/change-password', {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      })
      // Clear local session and redirect to login
      showSuccess('Password changed. Please sign in again.')
      setPwCurrent(''); setPwNew(''); setPwConfirm('')
      // Logout (clears tokens + Redux) then go to login
      try { await logout() } catch { /* ignore */ }
      navigate('/login', { replace: true })
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Could not change password'
      setError(msg)
      showError(msg)
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-1">Profile</h3>
        <p className="text-sm text-slate-500 mb-4">Update your personal information.</p>

        {message && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{message}</div>}
        {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}

        <div className="space-y-3">
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input bg-slate-50" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="label">Roles</label>
            <div className="flex flex-wrap gap-1">
              {(user?.roles || []).map(r => (
                <span key={r} className={
                  r === 'ADMIN' ? 'badge-red' :
                  r === 'DOCTOR' || r === 'NURSE' ? 'badge-blue' : 'badge-gray'
                }>{r}</span>
              ))}
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-1">Change Password</h3>
        <p className="text-sm text-slate-500 mb-4">Use a strong password with at least 8 characters. You will be signed out after.</p>
        <div className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            onClick={changePassword}
            disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
            className="btn-danger"
          >
            {pwSaving ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </div>
    </div>
  )
}
