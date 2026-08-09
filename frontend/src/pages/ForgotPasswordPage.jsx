import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

/**
 * Web forgot-password page. Sends a real email via the backend.
 * The email contains a deep link: mtotocare://reset-password?token=...
 * which opens the mobile app. For web users, the email also includes a
 * web link: ${appBaseUrl}/reset-password?token=... — show it for testing.
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send reset email')
    } finally {
      setLoading(false)
    }
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
          <p className="text-sm text-slate-600 mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          {sent ? (
            <div>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1 text-center">Check your email</h2>
              <p className="text-sm text-slate-600 text-center mb-4">
                If <strong>{email}</strong> is registered, a reset link has been sent. The link expires in 1 hour.
              </p>
              <p className="text-xs text-slate-500 text-center mb-4">
                Open the link in the MtotoCare mobile app, or paste the token on the reset-password screen.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-700"
              >
                Back to Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Forgot password?</h2>
              <p className="text-xs text-slate-500 mb-4">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <div className="text-center mt-3">
                <Link to="/login" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  ← Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">© {new Date().getFullYear()} MtotoCare Africa</p>
      </div>
    </div>
  )
}
