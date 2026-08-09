import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useLanguage } from '../i18n.jsx'
import { useInactivityLogout } from '../hooks/useInactivityLogout'

const getNav = (role, t) => ({
  PROVIDER: [
    { to: '/provider', icon: '◧', label: t('provider.dashboard'), end: true },
    { to: '/provider/patients', icon: '👥', label: t('provider.myPatients') },
    { to: '/provider/appointments', icon: '📅', label: t('nav.appointments') },
    { to: '/provider/profile', icon: '👤', label: t('common.profile') },
  ],
  ADMIN: [
    { to: '/admin', icon: '◧', label: t('admin.dashboard'), end: true },
    { to: '/admin/users', icon: '👥', label: t('admin.manageUsers') },
    { to: '/admin/facilities', icon: '🏥', label: t('admin.manageFacilities') },
    { to: '/admin/audit', icon: '📋', label: t('admin.viewAudit') },
    { to: '/admin/profile', icon: '👤', label: t('common.profile') },
  ],
})

export function Layout({ role }) {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // FR-008: auto-logout after 15 min of no activity
  useInactivityLogout()

  const items = (getNav(role, t) || {})[role] || []
  const pageTitle = items.find(i => i.end ? location.pathname === i.to : location.pathname.startsWith(i.to))?.label || t('nav.dashboard')

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-slate-900">MtotoCare</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{role} Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2 text-xs text-slate-500">
            <div className="font-semibold text-slate-700">{user?.fullName}</div>
            <div className="truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium text-left"
          >
            ↩ {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs font-medium rounded ${language === 'en' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🇬🇧 EN
                </button>
                <button
                  onClick={() => setLanguage('sw')}
                  className={`px-2 py-1 text-xs font-medium rounded ${language === 'sw' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  🇹🇿 SW
                </button>
              </div>
              <span className="badge-green">● {role === 'ADMIN' ? t('admin.dashboard') : t('provider.dashboard')}</span>
              <span className="text-sm text-slate-600">{user?.fullName}</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
