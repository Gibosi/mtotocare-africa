import { useEffect, useState } from 'react'
import { userApi, facilityApi, appointmentApi, patientApi } from '../../api'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, facilities: 0, appointments: 0, patients: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [users, facilities, apts, patients] = await Promise.all([
        userApi.getAll().catch(() => []),
        facilityApi.getAll().catch(() => []),
        appointmentApi.getAll().catch(() => []),
        patientApi.getAll().catch(() => []),
      ])
      setStats({
        users: (users || []).length,
        facilities: (facilities || []).length,
        appointments: (apts || []).length,
        patients: (patients || []).length,
      })
      setRecentUsers((users || []).slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900">System Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Live metrics from the MtotoCare platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.users} icon="👥" color="bg-blue-50 text-blue-600" link="/admin/users" />
        <StatCard label="Facilities" value={stats.facilities} icon="🏥" color="bg-green-50 text-green-600" link="/admin/facilities" />
        <StatCard label="Patients" value={stats.patients} icon="👶" color="bg-purple-50 text-purple-600" />
        <StatCard label="Appointments" value={stats.appointments} icon="📅" color="bg-yellow-50 text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Users</h3>
            <Link to="/admin/users" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No users yet</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {(u.roles || []).map(r => (
                      <span key={r} className="badge-blue">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/admin/users" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700">
              👥 Manage users and roles
            </Link>
            <Link to="/admin/facilities" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700">
              🏥 Manage healthcare facilities
            </Link>
            <Link to="/admin/audit" className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700">
              📋 View audit log
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, link }) {
  const inner = (
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
  return link ? <Link to={link}>{inner}</Link> : inner
}
