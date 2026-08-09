import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n.jsx'
import { useToast } from '../../components/Toast.jsx'
import apiClient from '../../api'

const FACILITY_TYPES = [
  'HOSPITAL',
  'HEALTH_CENTER',
  'CLINIC',
  'DISPENSARY',
  'PHARMACY',
  'LABORATORY',
  'OTHER',
]

export function AdminFacilities() {
  const { t } = useLanguage()
  const { showSuccess, showError } = useToast()
  const [facilities, setFacilities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    facilityType: 'HEALTH_CENTER',
    address: '',
    region: '',
    district: '',
    phoneNumber: '',
    operatingHours: '24/7',
  })
  const [savingForm, setSavingForm] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/facilities')
      const data = res.data?.data
      setFacilities(Array.isArray(data) ? data : [])
    } catch (e) {
      showError(e.message || 'Could not load facilities')
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = (Array.isArray(facilities) ? facilities : []).filter(f => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return f.name?.toLowerCase().includes(q) ||
           f.city?.toLowerCase().includes(q) ||
           f.region?.toLowerCase().includes(q) ||
           f.district?.toLowerCase().includes(q)
  })

  const openCreate = () => {
    setForm({
      name: '',
      facilityType: 'HEALTH_CENTER',
      address: '',
      region: '',
      district: '',
      phoneNumber: '',
      operatingHours: '24/7',
    })
    setCreating(true)
  }

  const submitCreate = async () => {
    if (!form.name.trim()) { showError('Name is required'); return }
    if (!form.region.trim()) { showError('Region is required'); return }
    setSavingForm(true)
    try {
      const res = await apiClient.post('/admin/facilities', form)
      const created = res.data?.data
      showSuccess(`Facility "${created?.name || form.name}" added`)
      setCreating(false)
      await load()
    } catch (e) {
      showError(e.message || 'Could not create facility')
    } finally {
      setSavingForm(false)
    }
  }

  const removeFacility = async (f) => {
    if (!window.confirm(`Delete facility "${f.name}"? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/admin/facilities/${f.id}`)
      showSuccess(`Facility "${f.name}" deleted`)
      await load()
    } catch (e) {
      showError(e.message || 'Could not delete facility')
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <input
            className="input flex-1"
            placeholder="Search facilities by name, city, or region…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={load} className="btn-secondary text-sm">↻ Refresh</button>
          <button onClick={openCreate} className="btn-primary text-sm">
            + {t('users.addUser') ? 'Add facility' : 'Add facility'}
          </button>
          <span className="text-sm text-slate-500 whitespace-nowrap">{filtered.length} of {facilities.length}</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-2">🏥</div>
            <p className="text-sm text-slate-500">No facilities yet.</p>
            <button onClick={openCreate} className="btn-primary mt-4">+ Add facility</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="font-medium text-slate-900">{f.name}</div>
                      <div className="text-xs text-slate-500">{f.address}</div>
                    </td>
                    <td className="table-td">
                      <span className="badge-blue">{f.facilityType || '—'}</span>
                    </td>
                    <td className="table-td">
                      <div className="text-sm">{f.district || f.city || '—'}</div>
                      <div className="text-xs text-slate-500">{f.region}</div>
                    </td>
                    <td className="table-td text-sm text-slate-600">
                      {f.phoneNumber && <div>📞 {f.phoneNumber}</div>}
                      {f.operatingHours && <div className="text-xs">🕐 {f.operatingHours}</div>}
                    </td>
                    <td className="table-td">
                      {f.active !== false
                        ? <span className="badge-green">Active</span>
                        : <span className="badge-gray">Inactive</span>}
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => removeFacility(f)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Delete facility"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create facility modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-slate-900 mb-1">Add facility</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter the facility details. The facility will be created active and visible to all users.
            </p>

            <div className="space-y-3">
              <div>
                <label className="label">Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amana Regional Hospital"
                />
              </div>
              <div>
                <label className="label">Type *</label>
                <select
                  className="input"
                  value={form.facilityType}
                  onChange={(e) => setForm({ ...form, facilityType: e.target.value })}
                >
                  {FACILITY_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="label">Region *</label>
                <input
                  className="input"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="e.g. Dar es Salaam"
                />
              </div>
              <div>
                <label className="label">District / City</label>
                <input
                  className="input"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="e.g. Ilala"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+255 ..."
                  keyboardType="phone-pad"
                />
              </div>
              <div>
                <label className="label">Operating hours</label>
                <input
                  className="input"
                  value={form.operatingHours}
                  onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                  placeholder="e.g. Mon–Fri 8am–5pm, or 24/7"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setCreating(false)} className="btn-secondary" disabled={savingForm}>
                Cancel
              </button>
              <button onClick={submitCreate} disabled={savingForm} className="btn-primary">
                {savingForm ? 'Saving…' : 'Add facility'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
