import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useLanguage } from '../i18n.jsx'

const ROLE_HOME = {
  ADMIN: '/admin',
  DOCTOR: '/provider', NURSE: '/provider', MIDWIFE: '/provider',
  CHW: '/provider', HEALTHCARE_PROVIDER: '/provider',
}

// Web translations. Same strings as the mobile en.json/sw.json, but
// scoped to what the web actually shows.
const STRINGS = {
  en: {
    tagline: 'Provider & Admin Portal',
    signIn: 'Sign in',
    subtitle: 'Use your provider or admin credentials.',
    email: 'Email',
    password: 'Password',
    forgot: 'Forgot?',
    signingIn: 'Signing in…',
    chooseLanguage: 'Language',
    loginFailed: 'Login failed',
    footer: 'MtotoCare Africa',
  },
  sw: {
    tagline: 'Mlango wa Mtoa Huduma na Msimamizi',
    signIn: 'Ingia',
    subtitle: 'Tumia vitambulisho vyako vya mtoa huduma au msimamizi.',
    email: 'Barua pepe',
    password: 'Nenosiri',
    forgot: 'Umesahau?',
    signingIn: 'Inaingia…',
    chooseLanguage: 'Lugha',
    loginFailed: 'Kuingia kumeshindwa',
    footer: 'MtotoCare Afrika',
  },
}

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    try { localStorage.setItem('mc_lang', language) } catch {}
  }, [language])

  if (user) {
    const role = (user.roles || []).find(r => ROLE_HOME[r]) || 'PARENT'
    return <Navigate to={ROLE_HOME[role] || '/login'} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const u = await login(email.trim(), password)
      const role = (u.roles || []).find(r => ROLE_HOME[r]) || 'PARENT'
      navigate(ROLE_HOME[role] || '/', { replace: true })
    } catch (err) {
      setError(err.message || t.loginFailed)
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
          <p className="text-sm text-slate-600 mt-1">{t('common.tagline')}</p>
        </div>

        {/* Language toggle */}
        <div className="flex justify-center mb-3 gap-2">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${language === 'en' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('sw')}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${language === 'sw' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-300'}`}
          >
            🇹🇿 Kiswahili
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('common.signIn')}</h2>
          <p className="text-xs text-slate-500 mb-4">{language === 'sw' ? 'Tumia vitambulisho vyako vya mtoa huduma au msimamizi.' : 'Use your provider or admin credentials.'}</p>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{t.email}</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder={language === 'sw' ? 'wewe@example.com' : 'you@example.com'}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">{t.password}</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {t.forgot}
                </button>
              </div>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? t('common.signingIn') : t('common.signIn')}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">© {new Date().getFullYear()} {t.footer}</p>
      </div>
    </div>
  )
}

// No demo accounts are seeded. Only the admin account created by DataInitializer.
export const DEMO_ACCOUNTS = [];
