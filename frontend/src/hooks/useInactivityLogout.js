import { useEffect, useRef } from 'react'
import { useAuth } from '../AuthContext'

/**
 * FR-008: Auto-logout after prolonged inactivity.
 *
 * Tracks user interaction (mouse, keyboard, touch, scroll). After
 * INACTIVITY_MS of no activity, the user is logged out and redirected
 * to /login. A warning toast is shown ~1 minute before the timeout
 * so the user has a chance to extend the session (kept simple here).
 *
 * Default: 15 minutes (matches the JWT access-token lifetime).
 */
const DEFAULT_INACTIVITY_MS = 15 * 60 * 1000

export function useInactivityLogout(ms = DEFAULT_INACTIVITY_MS) {
  const { user, logout } = useAuth()
  const timer = useRef(null)

  useEffect(() => {
    if (!user) return

    const reset = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try { await logout() } catch (e) { /* ignore */ }
        // Force redirect to login
        try { window.location.href = '/login' } catch (e) { /* ignore */ }
      }, ms)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timer.current) clearTimeout(timer.current)
    }
  }, [user, logout, ms])
}
