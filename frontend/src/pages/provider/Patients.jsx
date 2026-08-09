import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { patientApi } from '../../api'

export function ProviderPatients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      setPatients(await patientApi.getAll() || [])
    } finally {
      setLoading(false)
    }
  }

  const filtered = patients.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.fullName?.toLowerCase().includes(q) ||
           p.firstName?.toLowerCase().includes(q) ||
           p.lastName?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between gap-4 mb-4">
          <input
            className="input flex-1"
            placeholder="Search patients by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-sm text-slate-500 whitespace-nowrap">
            {filtered.length} of {patients.length}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-12 text-center">Loading patients…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center">No patients found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Gender</th>
                  <th className="table-th">Age</th>
                  <th className="table-th">Blood Group</th>
                  <th className="table-th">Birth Weight</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                          {p.gender === 'FEMALE' ? '♀' : '♂'}
                        </div>
                        <div>
                          <div className="font-medium">{p.fullName}</div>
                          <div className="text-xs text-slate-500">ID: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="badge-gray">{p.gender}</span>
                    </td>
                    <td className="table-td">{p.ageInMonths} months</td>
                    <td className="table-td">
                      {p.bloodGroup ? <span className="badge-red">{p.bloodGroup}</span> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="table-td">
                      {p.birthWeightKg ? `${p.birthWeightKg} kg` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="table-td text-right">
                      <Link
                        to={`/provider/patients/${p.id}`}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                      >
                        View details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
