import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const ToastContext = createContext({
  showToast: () => {},
  showError: () => {},
  showSuccess: () => {},
})

export const useToast = () => useContext(ToastContext)

const TYPES = {
  success: { bg: 'bg-emerald-600', icon: '✓' },
  error:   { bg: 'bg-red-600',     icon: '✕' },
  info:    { bg: 'bg-slate-700',   icon: 'ℹ' },
  warning: { bg: 'bg-amber-500',   icon: '⚠' },
}

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const remove = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
    const tm = timers.current[id]
    if (tm) { clearTimeout(tm); delete timers.current[id] }
  }, [])

  const show = useCallback((type, message, opts = {}) => {
    if (!message) return
    const id = ++_id
    const ttl = opts.ttl ?? (type === 'error' ? 5000 : 3000)
    setToasts((cur) => [...cur, { id, type, message }])
    timers.current[id] = setTimeout(() => remove(id), ttl)
  }, [remove])

  const showToast  = useCallback((m, o) => show('info', m, o), [show])
  const showSuccess = useCallback((m, o) => show('success', m, o), [show])
  const showError   = useCallback((m, o) => show('error', m, o), [show])

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, show: (t, m, o) => show(t, m, o) }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => {
          const cfg = TYPES[t.type] || TYPES.info
          return (
            <div
              key={t.id}
              className={`${cfg.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in`}
              role="alert"
            >
              <span className="text-lg leading-none flex-shrink-0">{cfg.icon}</span>
              <span className="text-sm flex-1 break-words">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-white/80 hover:text-white text-sm leading-none flex-shrink-0"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
