import { useEffect, useState } from 'react'
import { auditApi } from '../../api'
import { useToast } from '../../components/Toast.jsx'

const ACTION_GROUPS = {
  CREATE: { label: 'Created', color: 'bg-emerald-100 text-emerald-700' },
  UPDATE: { label: 'Updated', color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Deleted', color: 'bg-red-100 text-red-700' },
  ACTIVATE: { label: 'Activated', color: 'bg-emerald-100 text-emerald-700' },
  DEACTIVATE: { label: 'Deactivated', color: 'bg-amber-100 text-amber-700' },
  RESET: { label: 'Reset', color: 'bg-amber-100 text-amber-700' },
  ASSIGN: { label: 'Role added', color: 'bg-indigo-100 text-indigo-700' },
  REMOVE: { label: 'Role removed', color: 'bg-orange-100 text-orange-700' },
  LOGIN: { label: 'Sign-in', color: 'bg-slate-100 text-slate-700' },
  DEFAULT: { label: 'Action', color: 'bg-slate-100 text-slate-700' },
}

function badgeFor(action) {
  if (!action) return ACTION_GROUPS.DEFAULT
  const key = Object.keys(ACTION_GROUPS).find(k => action.toUpperCase().includes(k))
  return ACTION_GROUPS[key] || ACTION_GROUPS.DEFAULT
}

export function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const { showError, showInfo } = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await auditApi.getAll() || []
      setLogs(Array.isArray(data) ? data : [])
    } catch (e) {
      setLogs([])
      showError(e?.message || 'Could not load activity log')
    } finally {
      setLoading(false)
    }
  }

  // Distinct action types for filter chips
  const actionTypes = Array.from(new Set((logs || []).map(l => l.action).filter(Boolean))).sort()

  const filtered = (logs || []).filter(l => {
    if (actionFilter && l.action !== actionFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (l.userEmail || '').toLowerCase().includes(q) ||
           (l.action || '').toLowerCase().includes(q) ||
           (l.entityType || '').toLowerCase().includes(q) ||
           (l.details || '').toLowerCase().includes(q) ||
           (l.ipAddress || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Activity Log</h2>
            <p className="text-sm text-slate-500">
              Every change that admins, providers, and parents make is recorded here for safety.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary text-sm">↻ Refresh</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input
            className="input flex-1 min-w-[180px]"
            placeholder="Search by user, action, or detail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-auto"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All actions</option>
            {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-sm text-slate-500 whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {actionTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {actionTypes.map(a => {
              const b = badgeFor(a)
              return (
                <button
                  key={a}
                  onClick={() => setActionFilter(actionFilter === a ? '' : a)}
                  className={`text-xs px-2 py-1 rounded border ${actionFilter === a ? 'border-slate-900' : 'border-transparent'} ${b.color}`}
                >
                  {a}
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm text-slate-500">
              {logs.length === 0
                ? 'No activity yet. Once you or your team make changes, they will appear here.'
                : 'No entries match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">When</th>
                  <th className="table-th">Who</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Details</th>
                  <th className="table-th">From</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const b = badgeFor(l.action)
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="table-td text-xs text-slate-600 whitespace-nowrap">
                        {l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="table-td">
                        <div className="text-sm font-medium text-slate-800">{l.userEmail || `User #${l.userId}`}</div>
                        {l.userId && <div className="text-xs text-slate-500">ID #{l.userId}</div>}
                      </td>
                      <td className="table-td">
                        <span className={`text-xs px-2 py-0.5 rounded ${b.color}`}>
                          {l.action}
                        </span>
                        {l.entityType && (
                          <div className="text-xs text-slate-500 mt-1">
                            {l.entityType} {l.entityId ? `#${l.entityId}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="table-td text-sm text-slate-600 max-w-md">
                        {l.details || '—'}
                      </td>
                      <td className="table-td text-xs text-slate-500 font-mono">
                        {l.ipAddress || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
