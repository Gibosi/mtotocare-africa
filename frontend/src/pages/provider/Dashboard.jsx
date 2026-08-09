import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../AuthContext'
import { doctorApi, patientApi, appointmentApi, analyticsApi } from '../../api'
import { useToast } from '../../components/Toast.jsx'

export function ProviderDashboard() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [providerStats, setProviderStats] = useState(null)
  const [onDuty, setOnDuty] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [p, a, s] = await Promise.all([
        patientApi.getAll().catch(() => []),
        appointmentApi.getAll().catch(() => []),
        analyticsApi.providerDashboard().catch(() => null),
      ])
      setPatients(p || [])
      setAppointments(a || [])
      setProviderStats(s || null)
    } finally {
      setLoading(false)
    }
  }

  const toggleOnDuty = async () => {
    const next = !onDuty
    setOnDuty(next)
    setSaving(true)
    try {
      await doctorApi.updateAvailability(next)
      showSuccess(next ? 'You are now on duty' : 'You are now off duty')
    } catch (e) {
      setOnDuty(!next)
      showError(e.message || 'Could not update status')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayApts = appointments.filter(a => (a.appointmentDatetime || '').startsWith(today))
  const upcoming = appointments
    .filter(a => new Date(a.appointmentDatetime) >= new Date() && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED'))
    .sort((a, b) => new Date(a.appointmentDatetime) - new Date(b.appointmentDatetime))
  const pending = appointments.filter(a => a.status === 'SCHEDULED').length
  const completed = appointments.filter(a => a.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* Welcome + status toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome, {user?.fullName?.split(' ')[0] || 'Doctor'}</h2>
          <p className="text-sm text-slate-500 mt-1">Here is your activity overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{onDuty ? 'On duty' : 'Off duty'}</span>
          <button
            onClick={toggleOnDuty}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              onDuty ? 'bg-brand-600' : 'bg-slate-300'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              onDuty ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Patients" value={patients.length} color="bg-blue-50 text-blue-600" />
        <StatCard icon="📅" label="Today's Appointments" value={todayApts.length} color="bg-purple-50 text-purple-600" />
        <StatCard icon="⏳" label="Pending" value={pending} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon="✅" label="Completed" value={completed} color="bg-green-50 text-green-600" />
      </div>

      {/* Nutrition status + vaccination coverage + high-risk children */}
      {providerStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4">Patient Panel — Nutrition Status</h3>
            {providerStats.assessedChildren === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No growth assessments recorded yet</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(providerStats.nutritionStatusCounts || {}).map(([status, count]) => (
                    <span key={status} className="badge-gray text-xs">
                      {status.replace(/_/g, ' ').toLowerCase()}: {count}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(providerStats.riskLevelCounts || {}).map(([risk, count]) => (
                    <span
                      key={risk}
                      className={`text-xs font-semibold px-2 py-1 rounded border ${
                        risk === 'CRITICAL' || risk === 'HIGH'
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : risk === 'MODERATE'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-green-700 bg-green-50 border-green-200'
                      }`}
                    >
                      {risk} risk: {count}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {providerStats.assessedChildren} of {providerStats.totalChildren} patients have a growth assessment on file
                </p>
              </>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">High-Risk Children</h3>
              {providerStats.vaccinationCoverage && (
                <span className="text-xs text-slate-500">
                  Vaccination coverage: {providerStats.vaccinationCoverage.coverageRate}%
                </span>
              )}
            </div>
            {(providerStats.highRiskChildren || []).length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No high-risk children right now</p>
            ) : (
              <div className="space-y-2">
                {providerStats.highRiskChildren.slice(0, 6).map(c => (
                  <Link
                    key={c.childId}
                    to={`/provider/patients/${c.childId}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
                  >
                    <div>
                      <div className="font-medium text-sm text-slate-900">
                        {c.childName} {c.emergencyFlag && <span className="text-red-600">⚠</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.ageMonths}mo · {(c.nutritionStatus || '').replace(/_/g, ' ').toLowerCase()}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border ${
                      c.riskLevel === 'CRITICAL' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {c.riskLevel}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upcoming Appointments</h3>
            <Link to="/provider/appointments" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No upcoming appointments</p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-slate-900">{a.childName || 'Child #' + a.childId}</div>
                    <div className="text-xs text-slate-500">{a.appointmentType} · {a.reason || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-700">
                      {new Date(a.appointmentDatetime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(a.appointmentDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Patients</h3>
            <Link to="/provider/patients" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : patients.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No patients yet</p>
          ) : (
            <div className="space-y-2">
              {patients.slice(0, 5).map(p => (
                <Link
                  key={p.id}
                  to={`/provider/patients/${p.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
                >
                  <div>
                    <div className="font-medium text-sm text-slate-900">{p.fullName}</div>
                    <div className="text-xs text-slate-500">{p.gender} · {p.ageInMonths}mo</div>
                  </div>
                  <span className="text-xs text-brand-600">View →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500 uppercase font-medium">{label}</div>
      </div>
    </div>
  )
}
