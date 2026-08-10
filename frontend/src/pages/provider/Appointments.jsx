import { useEffect, useState } from 'react'
import { appointmentApi, doctorApi } from '../../api'
import { useToast } from '../../components/Toast.jsx'

const STATUS = {
  SCHEDULED: 'badge-yellow',
  CONFIRMED: 'badge-blue',
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
  NO_SHOW: 'badge-red',
}

export function ProviderAppointments() {
  const { showSuccess, showError } = useToast()
  const [appointments, setAppointments] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [busy, setBusy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notesModal, setNotesModal] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const a = await doctorApi.myAppointments().catch(() => [])
      setAppointments((a || []).sort((x, y) => new Date(x.appointmentDatetime) - new Date(y.appointmentDatetime)))
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (apt, status) => {
    if (status === 'complete' && !notes.trim()) {
      setNotesModal(apt)
      return
    }
    setBusy(apt.id)
    try {
      if (status === 'confirm') {
        await appointmentApi.confirm(apt.id)
        showSuccess('Appointment confirmed')
      } else if (status === 'start') {
        await appointmentApi.start(apt.id)
        showSuccess('Appointment started')
      } else if (status === 'complete') {
        await appointmentApi.complete(apt.id, notes || 'Completed')
        showSuccess('Appointment completed')
      } else if (status === 'no-show') {
        await appointmentApi.complete(apt.id, 'No-show')
        showSuccess('Marked as no-show')
      } else if (status === 'cancel') {
        await appointmentApi.cancel(apt.id, 'Cancelled by provider')
        showSuccess('Appointment cancelled')
      }
      setNotes('')
      setNotesModal(null)
      await load()
    } catch (e) {
      showError(e.message || 'Could not update appointment')
    } finally {
      setBusy(null)
    }
  }

  const confirmCancel = (apt) => {
    if (window.confirm('Cancel this appointment?')) {
      updateStatus(apt, 'cancel')
    }
  }

  const now = new Date()
  const upcoming = appointments.filter(a => new Date(a.appointmentDatetime) >= now && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED'))
  const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW')
  const visible = tab === 'upcoming' ? upcoming : past

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tab === 'upcoming' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-600'
              }`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tab === 'past' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-600'
              }`}
            >
              Past ({past.length})
            </button>
          </div>
          <button onClick={load} className="btn-secondary text-sm">↻ Refresh</button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            {tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Date / Time</th>
                <th className="table-th">Patient</th>
                <th className="table-th">Type</th>
                <th className="table-th">Reason</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="table-td">
                    <div className="font-medium">{new Date(a.appointmentDatetime).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{new Date(a.appointmentDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="table-td font-medium">{a.childName || `Child #${a.childId}`}</td>
                  <td className="table-td">{a.appointmentType}</td>
                  <td className="table-td text-slate-600">{a.reason || '—'}</td>
                  <td className="table-td">
                    <span className={STATUS[a.status] || 'badge-gray'}>{a.status}</span>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === 'SCHEDULED' && (
                        <button
                          onClick={() => updateStatus(a, 'confirm')}
                          disabled={busy === a.id}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                        <button
                          onClick={() => updateStatus(a, 'start')}
                          disabled={busy === a.id}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => updateStatus(a, 'complete')}
                          disabled={busy === a.id}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                        <button
                          onClick={() => confirmCancel(a)}
                          disabled={busy === a.id}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Notes modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-slate-900 mb-1">Complete Appointment</h3>
            <p className="text-sm text-slate-500 mb-4">
              Add notes for {notesModal.childName || 'this patient'}.
            </p>
            <textarea
              className="input min-h-[100px]"
              placeholder="Diagnosis, treatment, follow-up notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setNotesModal(null); setNotes('') }}
                className="btn-secondary"
              >Cancel</button>
              <button
                onClick={() => updateStatus(notesModal, 'complete')}
                disabled={busy === notesModal.id}
                className="btn-primary"
              >
                {busy === notesModal.id ? 'Saving…' : 'Save & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
