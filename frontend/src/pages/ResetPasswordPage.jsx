import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

/**
 * Web reset-password page. Reached by clicking the web link in the email:
 *   ${appBaseUrl}/reset-password?token=...
 *
 * For parents, this is a stopover: we show a "Continue in mobile app" button
 * that opens the deep link mtotocare://reset-password?token=... so the user
 * can finish on their phone. The form below also works for any user who
 * happens to have the reset link open on web.
 */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // nothing
  }, [token])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('Missing or invalid token. Please request a new reset link.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  const openInApp = () => {
    const url = `mtotocare://reset-password?token=${encodeURIComponent(token)}`
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-3">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MtotoCare</h1>
          <p className="text-sm text-slate-600 mt-1">Set a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          {done ? (
            <div>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1 text-center">Password updated</h2>
              <p className="text-sm text-slate-600 text-center mb-4">
                Your password has been changed. You can now sign in.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-700"
              >
                Sign in
              </button>
            </div>
          ) : (
            <>
              {token && (
                <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-slate-700">
                  We recommend finishing this on your phone in the MtotoCare app.
                  <button
                    type="button"
                    onClick={openInApp}
                    className="block mt-1 w-full text-left font-medium text-brand-700 hover:text-brand-800"
                  >
                    📱 Open in MtotoCare app →
                  </button>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Or set it here</h2>
                <p className="text-xs text-slate-500 mb-3">Enter a new password for your account.</p>

                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">New password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Confirm new password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
                >
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>

                <div className="text-center mt-3">
                  <Link to="/login" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    ← Back to Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">© {new Date().getFullYear()} MtotoCare Africa</p>
      </div>
    </div>
  )
}
