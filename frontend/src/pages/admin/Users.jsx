import { useEffect, useState } from 'react'
import { userApi, facilityApi } from '../../api'
import { useLanguage } from '../../i18n.jsx'
import { useToast } from '../../components/Toast.jsx'

const ALL_ROLES = ['PARENT', 'DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER', 'ADMIN']
const CLINICAL_ROLES = ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW']

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  preferredLanguage: 'en',
  roles: ['PARENT'],
  licenseNumber: '',
  specialization: '',
  facilityId: '',
}

export function AdminUsers() {
  const { t } = useLanguage()
  const { showSuccess, showError } = useToast()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [savingForm, setSavingForm] = useState(false)
  const [facilities, setFacilities] = useState([])

  useEffect(() => { load() }, [])
  useEffect(() => { facilityApi.getAll().then(setFacilities).catch(() => setFacilities([])) }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await userApi.getAll()
      const list = Array.isArray(data) ? data : (data?.content || [])
      setUsers(list)
    } catch (e) {
      const msg = e?.message || 'Failed to load users'
      setError(msg)
      showError(msg)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = (Array.isArray(users) ? users : []).filter(u => {
    if (roleFilter && !(u.roles || []).includes(roleFilter)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  const toggleActive = async (u) => {
    setBusy(u.id)
    try {
      if (u.active) await userApi.deactivate(u.id)
      else await userApi.activate(u.id)
      showSuccess(u.active ? t('users.deactivate') + ' ✓' : t('users.activate') + ' ✓')
      await load()
    } catch (e) {
      showError(e.message || 'Could not update user')
    } finally {
      setBusy(null)
    }
  }

  const toggleVerified = async (u) => {
    setBusy(`verify-${u.doctorId}`)
    try {
      if (u.credentialsVerified) await userApi.unverifyDoctor(u.doctorId)
      else await userApi.verifyDoctor(u.doctorId)
      showSuccess(u.credentialsVerified ? 'Marked as unverified' : 'Credentials verified ✓')
      await load()
    } catch (e) {
      showError(e.message || 'Could not update verification status')
    } finally {
      setBusy(null)
    }
  }

  const deleteUser = async (u) => {
    if (!window.confirm(t('users.confirmDelete'))) return
    setBusy(u.id)
    try {
      await userApi.delete(u.id)
      showSuccess(t('users.userDeleted'))
      await load()
    } catch (e) {
      showError(e.message || 'Could not delete user')
    } finally {
      setBusy(null)
    }
  }

  const saveRoles = async () => {
    if (!editing) return
    setBusy(editing.id)
    try {
      const current = new Set(editing.roles || [])
      const next = new Set(editing._newRoles || [])
      // Add new roles
      for (const r of next) {
        if (!current.has(r)) await userApi.assignRole(editing.id, r)
      }
      // Remove old roles
      for (const r of current) {
        if (!next.has(r)) await userApi.removeRole(editing.id, r)
      }
      showSuccess(t('users.saveRoles') + ' ✓')
      setEditing(null)
      await load()
    } catch (e) {
      showError(e.message || 'Could not save roles')
    } finally {
      setBusy(null)
    }
  }

  // ===== Create user =====
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setCreating(true)
  }
  const closeCreate = () => {
    setCreating(false)
    setForm(EMPTY_FORM)
  }
  const toggleFormRole = (role) => {
    setForm(f => {
      const has = (f.roles || []).includes(role)
      return { ...f, roles: has ? f.roles.filter(r => r !== role) : [...(f.roles || []), role] }
    })
  }
  const submitCreate = async () => {
    // Light validation
    if (!form.fullName.trim()) { showError('Full name is required'); return }
    if (!form.email.trim()) { showError('Email is required'); return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { showError('Please enter a valid email'); return }
    if (!form.password || form.password.length < 8) { showError('Password must be at least 8 characters'); return }
    if (!form.roles || form.roles.length === 0) { showError('Pick at least one role'); return }
    const isClinical = form.roles.some(r => CLINICAL_ROLES.includes(r))
    if (isClinical && !form.licenseNumber.trim()) { showError('A license number is required for clinical roles'); return }

    setSavingForm(true)
    try {
      const created = await userApi.create({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
        preferredLanguage: form.preferredLanguage,
        roles: form.roles,
        licenseNumber: isClinical ? form.licenseNumber.trim() : undefined,
        specialization: isClinical ? form.specialization.trim() || undefined : undefined,
        facilityId: isClinical && form.facilityId ? Number(form.facilityId) : undefined,
      })
      showSuccess(t('users.userCreated') + (created?.email ? ` — ${created.email}` : ''))
      closeCreate()
      await load()
    } catch (e) {
      showError(e.message || 'Could not create user')
    } finally {
      setSavingForm(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <input
            className="input flex-1"
            placeholder={t('users.searchPlaceholder') || 'Search by name or email…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-auto"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">{t('users.allRoles') || 'All roles'}</option>
            {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={load}
            className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
            title="Refresh"
          >
            ↻ {t('common.refresh') || 'Refresh'}
          </button>
          <button
            onClick={openCreate}
            className="btn-primary text-sm"
          >
            + {t('users.addUser') || 'Add user'}
          </button>
          <span className="text-sm text-slate-500 whitespace-nowrap">{filtered.length} {t('nav.users') || 'users'}</span>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm text-slate-500">{t('users.empty') || 'No users found.'}</p>
            <button onClick={openCreate} className="btn-primary mt-4">
              + {t('users.addUser') || 'Add user'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">{t('users.name') || 'Name'}</th>
                  <th className="table-th">{t('common.email')}</th>
                  <th className="table-th">{t('users.phone') || 'Phone'}</th>
                  <th className="table-th">{t('users.roles') || 'Roles'}</th>
                  <th className="table-th">{t('users.status') || 'Status'}</th>
                  <th className="table-th text-right">{t('users.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{u.fullName || '—'}</td>
                    <td className="table-td text-slate-600">{u.email}</td>
                    <td className="table-td text-slate-600">{u.phoneNumber || '—'}</td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles || []).map(r => (
                          <span key={r} className={
                            r === 'ADMIN' ? 'badge-red' :
                            r === 'DOCTOR' || r === 'NURSE' ? 'badge-blue' : 'badge-gray'
                          }>{r}</span>
                        ))}
                      </div>
                      {u.doctorId && (
                        <button
                          onClick={() => toggleVerified(u)}
                          disabled={busy === `verify-${u.doctorId}`}
                          className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            u.credentialsVerified
                              ? 'text-green-700 bg-green-50 border-green-200'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}
                          title={u.licenseNumber ? `License: ${u.licenseNumber}` : ''}
                        >
                          {u.credentialsVerified ? '✓ Credentials verified' : '⚠ Unverified — click to verify'}
                        </button>
                      )}
                    </td>
                    <td className="table-td">
                      {u.active ? <span className="badge-green">{t('users.active') || 'Active'}</span> : <span className="badge-gray">{t('users.inactive') || 'Inactive'}</span>}
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => setEditing({ ...u, _newRoles: [...(u.roles || [])] })}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {t('users.editRoles') || 'Edit roles'}
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={busy === u.id}
                          className={`text-xs px-2 py-1 rounded disabled:opacity-50 ${
                            u.active
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {u.active ? (t('users.deactivate') || 'Deactivate') : (t('users.activate') || 'Activate')}
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          disabled={busy === u.id}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          title="Delete user"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit roles modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-slate-900 mb-1">{t('users.editRoles') || 'Edit roles'}</h3>
            <p className="text-sm text-slate-500 mb-4">{editing.fullName} ({editing.email})</p>
            <div className="space-y-2">
              {ALL_ROLES.map(r => {
                const checked = editing._newRoles?.includes(r)
                return (
                  <label key={r} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked || false}
                      onChange={(e) => {
                        const next = new Set(editing._newRoles || [])
                        if (e.target.checked) next.add(r)
                        else next.delete(r)
                        setEditing({ ...editing, _newRoles: Array.from(next) })
                      }}
                      className="w-4 h-4 text-brand-600"
                    />
                    <span className="text-sm text-slate-700">{r}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="btn-secondary">{t('common.cancel')}</button>
              <button
                onClick={saveRoles}
                disabled={busy === editing.id}
                className="btn-primary"
              >
                {busy === editing.id ? (t('common.saving') || 'Saving…') : (t('users.saveRoles') || 'Save roles')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-slate-900 mb-1">{t('users.addUserTitle') || 'Create a new user'}</h3>
            <p className="text-sm text-slate-500 mb-4">
              {t('users.addUserSubtitle') || 'Enter the user details. They will be created active and can sign in immediately.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="label">{t('users.fullName') || 'Full name'} *</label>
                <input
                  className="input"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Amina Juma"
                />
              </div>
              <div>
                <label className="label">{t('users.emailLabel') || 'Email'} *</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="label">{t('users.phone') || 'Phone'}</label>
                <input
                  className="input"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+255 700 000 000"
                />
              </div>
              <div>
                <label className="label">{t('users.passwordLabel') || 'Initial password'} *</label>
                <input
                  className="input"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('users.passwordHint') || 'At least 8 characters. Share with the user through a secure channel.'}
                </p>
              </div>
              <div>
                <label className="label">{t('users.preferredLanguage') || 'Preferred language'}</label>
                <select
                  className="input"
                  value={form.preferredLanguage}
                  onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                </select>
              </div>
              <div>
                <label className="label">{t('users.pickRoles') || 'Assign roles'} *</label>
                <div className="space-y-1 border border-slate-200 rounded-lg p-2">
                  {ALL_ROLES.map(r => {
                    const checked = (form.roles || []).includes(r)
                    return (
                      <label key={r} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFormRole(r)}
                          className="w-4 h-4 text-brand-600"
                        />
                        <span className="text-sm text-slate-700">{r}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {form.roles.length} selected. PARENT = family app, DOCTOR/NURSE/MIDWIFE/CHW/HEALTHCARE_PROVIDER = clinic staff, ADMIN = portal.
                </p>
              </div>

              {form.roles.some(r => CLINICAL_ROLES.includes(r)) && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 space-y-3">
                  <p className="text-xs text-amber-700 font-medium">
                    Clinical role selected — a real medical license number is required.
                    The account starts as unverified; verify it from the users list after
                    checking the license against the licensing body.
                  </p>
                  <div>
                    <label className="label">License number *</label>
                    <input
                      className="input"
                      value={form.licenseNumber}
                      onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                      placeholder="e.g. TZ-MED-12345"
                    />
                  </div>
                  <div>
                    <label className="label">Specialization</label>
                    <input
                      className="input"
                      value={form.specialization}
                      onChange={e => setForm({ ...form, specialization: e.target.value })}
                      placeholder="e.g. Pediatrics"
                    />
                  </div>
                  <div>
                    <label className="label">Primary facility</label>
                    <select
                      className="input"
                      value={form.facilityId}
                      onChange={e => setForm({ ...form, facilityId: e.target.value })}
                    >
                      <option value="">— Select a facility —</option>
                      {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeCreate} className="btn-secondary" disabled={savingForm}>
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={submitCreate}
                disabled={savingForm}
                className="btn-primary"
              >
                {savingForm ? (t('common.saving') || 'Saving…') : (t('users.addUser') || 'Add user')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
