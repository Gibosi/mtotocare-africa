import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { patientApi, vaccinationApi, growthApi, medicationApi, appointmentApi } from '../../api'
import { useToast } from '../../components/Toast.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function ProviderPatientDetail() {
  const { id } = useParams()
  const { showSuccess, showError } = useToast()
  const [patient, setPatient] = useState(null)
  const [vaccinations, setVaccinations] = useState([])
  const [schedules, setSchedules] = useState([])
  const [growth, setGrowth] = useState([])
  const [medications, setMedications] = useState([])
  const [appointments, setAppointments] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [showRecordVaccination, setShowRecordVaccination] = useState(false)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showAddGrowth, setShowAddGrowth] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    setLoading(true)
    try {
      const [p, v, s, g, m, a] = await Promise.all([
        patientApi.getById(id),
        vaccinationApi.forChild(id).catch(() => []),
        vaccinationApi.schedules().catch(() => []),
        growthApi.forChild(id).catch(() => []),
        medicationApi.forChild(id).catch(() => []),
        appointmentApi.getAll().catch(() => []),
      ])
      setPatient(p)
      setVaccinations(v || [])
      setSchedules(s || [])
      setGrowth((g || []).sort((a, b) => new Date(a.measurementDate) - new Date(b.measurementDate)))
      setMedications(m || [])
      setAppointments((a || []).filter(x => x.childId === Number(id)))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>
  if (!patient) return (
    <div className="card">
      <p className="text-slate-500">Patient not found.</p>
      <Link to="/provider/patients" className="text-brand-600 text-sm mt-2 inline-block">← Back to patients</Link>
    </div>
  )

  const growthChart = growth.map(g => ({
    date: g.measurementDate,
    weight: g.weightKg,
    height: g.heightCm,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/provider/patients" className="hover:text-slate-700">Patients</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{patient.fullName}</span>
      </div>

      {/* Patient header card */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-3xl">
            {patient.gender === 'FEMALE' ? '♀' : '♂'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{patient.fullName}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
              <span>ID: {patient.id}</span>
              <span>·</span>
              <span>{patient.gender}</span>
              <span>·</span>
              <span>{patient.ageInMonths} months old</span>
              {patient.bloodGroup && <>
                <span>·</span>
                <span className="badge-red">{patient.bloodGroup}</span>
              </>}
            </div>
          </div>
        </div>
        <Link to={`/provider/appointments?childId=${patient.id}`} className="btn-primary">
          📅 Book Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1">
        {['overview', 'growth', 'vaccinations', 'medications', 'appointments'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'vaccinations' && vaccinations.length > 0 && (
              <span className="ml-2 badge-gray">{vaccinations.length}</span>
            )}
            {t === 'appointments' && appointments.length > 0 && (
              <span className="ml-2 badge-gray">{appointments.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">Personal Information</h3>
            <Row label="Full Name" value={patient.fullName} />
            <Row label="Date of Birth" value={patient.dateOfBirth} />
            <Row label="Gender" value={patient.gender} />
            <Row label="Blood Group" value={patient.bloodGroup || '—'} />
            <Row label="Birth Weight" value={patient.birthWeightKg ? `${patient.birthWeightKg} kg` : '—'} />
            <Row label="Birth Height" value={patient.birthHeightCm ? `${patient.birthHeightCm} cm` : '—'} />
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <Mini icon="📏" label="Growth records" value={growth.length} />
              <Mini icon="💉" label="Vaccinations" value={vaccinations.length} />
              <Mini icon="💊" label="Active medications" value={medications.filter(m => m.active).length} />
              <Mini icon="📅" label="Appointments" value={appointments.length} />
            </div>
          </div>
        </div>
      )}

      {tab === 'growth' && (
        <div className="space-y-4">
          {growth.length > 0 && (() => {
            const latest = growth[growth.length - 1]
            const riskColor = {
              CRITICAL: 'text-red-700 bg-red-50 border-red-200',
              HIGH: 'text-red-700 bg-red-50 border-red-200',
              MODERATE: 'text-amber-700 bg-amber-50 border-amber-200',
              LOW: 'text-green-700 bg-green-50 border-green-200',
            }[latest.riskLevel] || 'text-slate-600 bg-slate-50 border-slate-200'
            return (
              <div className="card">
                <h3 className="font-semibold text-slate-900 mb-3">WHO Growth Assessment</h3>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <ZScoreBox label="WAZ" value={latest.weightForAgeZ} />
                  <ZScoreBox label="HAZ" value={latest.heightForAgeZ} />
                  <ZScoreBox label="WHZ" value={latest.weightForHeightZ} />
                  <ZScoreBox label="BAZ" value={latest.bmiForAgeZ} />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded border ${riskColor}`}>
                    {latest.riskLevel || 'UNKNOWN'} risk
                  </span>
                  {latest.nutritionStatus && (
                    <span className="badge-gray text-xs">{latest.nutritionStatus.replace(/_/g, ' ')}</span>
                  )}
                  {latest.healthScore != null && (
                    <span className="badge-gray text-xs">Health score {latest.healthScore}/100</span>
                  )}
                  {latest.growthTrend && latest.growthTrend !== 'INSUFFICIENT_DATA' && (
                    <span className="badge-gray text-xs capitalize">{latest.growthTrend.toLowerCase()}</span>
                  )}
                  {(latest.emergencyFlag || latest.referralRecommended) && (
                    <span className="text-xs font-semibold px-2 py-1 rounded border text-red-700 bg-red-50 border-red-200">
                      {latest.emergencyFlag ? '⚠ Urgent — seek care now' : 'Referral recommended'}
                    </span>
                  )}
                </div>
                {latest.aiSummary && (
                  <p className="text-sm text-slate-600">{latest.aiSummary}</p>
                )}
              </div>
            )
          })()}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Growth Trend</h3>
              <button onClick={() => setShowAddGrowth(true)} className="btn-primary">
                + Add Measurement
              </button>
            </div>
            {growthChart.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No growth records</p>
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={growthChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'cm', angle: 90, position: 'insideRight', fontSize: 11 }} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
                    <Line yAxisId="right" type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Height (cm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">All Measurements</h3>
            {growth.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No measurements recorded</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Date</th>
                    <th className="table-th">Weight</th>
                    <th className="table-th">Height</th>
                    <th className="table-th">Head</th>
                    <th className="table-th">WAZ</th>
                    <th className="table-th">HAZ</th>
                    <th className="table-th">WHZ</th>
                    <th className="table-th">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {growth.slice().reverse().map(g => (
                    <tr key={g.id}>
                      <td className="table-td">{g.measurementDate}</td>
                      <td className="table-td font-semibold">{g.weightKg} kg</td>
                      <td className="table-td font-semibold">{g.heightCm} cm</td>
                      <td className="table-td">{g.headCircumferenceCm ? `${g.headCircumferenceCm} cm` : '—'}</td>
                      <td className="table-td">{g.weightForAgeZ != null ? g.weightForAgeZ.toFixed(2) : '—'}</td>
                      <td className="table-td">{g.heightForAgeZ != null ? g.heightForAgeZ.toFixed(2) : '—'}</td>
                      <td className="table-td">{g.weightForHeightZ != null ? g.weightForHeightZ.toFixed(2) : '—'}</td>
                      <td className="table-td text-slate-500 text-xs">{g.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'vaccinations' && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Vaccinations</h3>
            <button onClick={() => setShowRecordVaccination(true)} className="btn-primary">
              + Record Vaccination
            </button>
          </div>
          {vaccinations.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No vaccinations recorded</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Vaccine</th>
                  <th className="table-th">Dose</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date Given</th>
                  <th className="table-th">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map(v => (
                  <tr key={v.id}>
                    <td className="table-td font-medium">{v.vaccineName || v.vaccineCode}</td>
                    <td className="table-td">{v.doseNumber || 1}</td>
                    <td className="table-td">
                      <span className={
                        v.status === 'COMPLETED' ? 'badge-green' :
                        v.status === 'OVERDUE' ? 'badge-red' : 'badge-yellow'
                      }>{v.status}</span>
                    </td>
                    <td className="table-td">{v.administeredAt || '—'}</td>
                    <td className="table-td">{v.nextDoseDue || v.scheduledDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'medications' && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Medications</h3>
            <button onClick={() => setShowAddMedication(true)} className="btn-primary">
              + Add Medication
            </button>
          </div>
          {medications.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No medications</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Dosage</th>
                  <th className="table-th">Frequency</th>
                  <th className="table-th">Start Date</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {medications.map(m => (
                  <tr key={m.id}>
                    <td className="table-td font-medium">{m.name}</td>
                    <td className="table-td">{m.dosage}</td>
                    <td className="table-td">{m.frequency}</td>
                    <td className="table-td">{m.startDate}</td>
                    <td className="table-td">
                      {m.active ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="card">
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No appointments</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Reason</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td className="table-td">{new Date(a.appointmentDatetime).toLocaleString()}</td>
                    <td className="table-td">{a.appointmentType}</td>
                    <td className="table-td">{a.reason || '—'}</td>
                    <td className="table-td">
                      <span className={
                        a.status === 'COMPLETED' ? 'badge-green' :
                        a.status === 'CANCELLED' || a.status === 'NO_SHOW' ? 'badge-red' : 'badge-yellow'
                      }>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showRecordVaccination && (
        <RecordVaccinationModal
          childId={patient.id}
          schedules={schedules}
          existing={vaccinations}
          onClose={() => setShowRecordVaccination(false)}
          onSaved={() => { setShowRecordVaccination(false); load(); showSuccess('Vaccination recorded') }}
          onError={(msg) => showError(msg)}
        />
      )}

      {showAddMedication && (
        <AddMedicationModal
          childId={patient.id}
          onClose={() => setShowAddMedication(false)}
          onSaved={() => { setShowAddMedication(false); load(); showSuccess('Medication added') }}
          onError={(msg) => showError(msg)}
        />
      )}

      {showAddGrowth && (
        <AddGrowthModal
          childId={patient.id}
          onClose={() => setShowAddGrowth(false)}
          onSaved={() => { setShowAddGrowth(false); load(); showSuccess('Growth measurement recorded') }}
          onError={(msg) => showError(msg)}
        />
      )}
    </div>
  )
}

function RecordVaccinationModal({ childId, schedules, existing, onClose, onSaved, onError }) {
  const [scheduleId, setScheduleId] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [clinicName, setClinicName] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Only offer vaccines that don't already have a COMPLETED record for this child
  const available = schedules.filter(s =>
    !existing.some(e => e.status === 'COMPLETED' && (e.scheduleId === s.id || e.vaccineCode === s.vaccineCode))
  )

  const submit = async () => {
    if (!scheduleId) { onError('Please choose a vaccine'); return }
    setSaving(true)
    try {
      await vaccinationApi.record(childId, {
        scheduleId,
        administeredAt: date,
        clinicName: clinicName.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      onSaved()
    } catch (e) {
      onError(e?.response?.data?.message || 'Could not record vaccination')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-1">Record Vaccination</h3>
        <p className="text-sm text-slate-500 mb-4">Mark a scheduled dose as administered.</p>

        <label className="text-sm text-slate-600 mb-1 block">Vaccine</label>
        {available.length === 0 ? (
          <p className="text-sm text-slate-500 mb-3">All scheduled vaccines for this child are already recorded.</p>
        ) : (
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {available.map(s => (
              <label
                key={s.id}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${
                  scheduleId === s.id ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>
                  <span className="text-sm font-medium text-slate-800">{s.vaccineName}</span>
                  <span className="text-xs text-slate-500 ml-2">{s.vaccineCode}</span>
                </span>
                <input type="radio" name="schedule" checked={scheduleId === s.id} onChange={() => setScheduleId(s.id)} />
              </label>
            ))}
          </div>
        )}

        <label className="text-sm text-slate-600 mb-1 block">Date administered</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input mb-3 w-full" />

        <label className="text-sm text-slate-600 mb-1 block">Clinic (optional)</label>
        <input value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Clinic name" className="input mb-3 w-full" />

        <label className="text-sm text-slate-600 mb-1 block">Batch number (optional)</label>
        <input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="Batch #" className="input mb-3 w-full" />

        <label className="text-sm text-slate-600 mb-1 block">Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input mb-4 w-full" rows={2} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={saving || !scheduleId} className="btn-primary">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddMedicationModal({ childId, onClose, onSaved, onError }) {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim()) { onError('Please enter a medication name'); return }
    setSaving(true)
    try {
      await medicationApi.create(childId, {
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        active: true,
        notes: notes.trim() || undefined,
      })
      onSaved()
    } catch (e) {
      onError(e?.response?.data?.message || 'Could not add medication')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-1">Add Medication</h3>
        <p className="text-sm text-slate-500 mb-4">Prescribe or record a medication for this child.</p>

        <label className="text-sm text-slate-600 mb-1 block">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amoxicillin" className="input mb-3 w-full" />

        <label className="text-sm text-slate-600 mb-1 block">Dosage</label>
        <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 250mg" className="input mb-3 w-full" />

        <label className="text-sm text-slate-600 mb-1 block">Frequency</label>
        <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g. Twice daily" className="input mb-3 w-full" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Start date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">End date (optional)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input w-full" />
          </div>
        </div>

        <label className="text-sm text-slate-600 mb-1 block">Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input mb-4 w-full" rows={2} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddGrowthModal({ childId, onClose, onSaved, onError }) {
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().slice(0, 10))
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('')
  const [muacCm, setMuacCm] = useState('')
  const [oedema, setOedema] = useState(false)
  const [severeDehydration, setSevereDehydration] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const w = weightKg ? parseFloat(weightKg) : undefined
    const h = heightCm ? parseFloat(heightCm) : undefined
    if (w === undefined && h === undefined) {
      onError('Please enter at least weight or height')
      return
    }
    setSaving(true)
    try {
      const payload = { measurementDate }
      if (w !== undefined) payload.weightKg = w
      if (h !== undefined) payload.heightCm = h
      if (headCircumferenceCm) payload.headCircumferenceCm = parseFloat(headCircumferenceCm)
      if (muacCm) payload.muacCm = parseFloat(muacCm)
      if (oedema) payload.oedema = true
      if (severeDehydration) payload.severeDehydration = true
      if (notes.trim()) payload.notes = notes.trim()
      await growthApi.add(childId, payload)
      onSaved()
    } catch (e) {
      onError(e?.response?.data?.message || 'Could not save measurement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-1">Add Growth Measurement</h3>
        <p className="text-sm text-slate-500 mb-4">
          WAZ/HAZ/WHZ/BAZ and a WHO growth assessment are computed automatically from this.
        </p>

        <label className="text-sm text-slate-600 mb-1 block">Measurement date</label>
        <input type="date" value={measurementDate} onChange={e => setMeasurementDate(e.target.value)} className="input mb-3 w-full" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Weight (kg)</label>
            <input value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 12.4" className="input w-full" />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Height (cm)</label>
            <input value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 90" className="input w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Head circumference (cm, optional)</label>
            <input value={headCircumferenceCm} onChange={e => setHeadCircumferenceCm(e.target.value)} placeholder="e.g. 47" className="input w-full" />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">MUAC (cm, optional)</label>
            <input value={muacCm} onChange={e => setMuacCm(e.target.value)} placeholder="e.g. 13.5" className="input w-full" />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Clinical danger signs (optional)</p>
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-sm text-slate-700">Oedema present</span>
            <input type="checkbox" checked={oedema} onChange={e => setOedema(e.target.checked)} className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-sm text-slate-700">Signs of severe dehydration</span>
            <input type="checkbox" checked={severeDehydration} onChange={e => setSevereDehydration(e.target.checked)} className="w-4 h-4" />
          </label>
          <p className="text-xs text-slate-400 mt-1">These trigger an urgent-care recommendation in the assessment.</p>
        </div>

        <label className="text-sm text-slate-600 mb-1 block">Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input mb-4 w-full" rows={2} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ZScoreBox({ label, value }) {
  const abnormal = value != null && (value < -2 || value > 2)
  const color = value == null ? 'text-slate-400 border-slate-200' : abnormal ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'
  return (
    <div className={`rounded-lg border p-2 text-center ${color}`}>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="text-lg font-bold">{value != null ? value.toFixed(2) : '—'}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

function Mini({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}
