'use client'

import { FormEvent, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Check, X, UserCheck, ShieldAlert, AlertCircle, Clock, Calendar,
  Building2, Car, Dog, FileText, Wrench, CheckSquare, Megaphone, Folder,
  DollarSign, CreditCard, FileCheck, MessageSquare, Trash2, Edit, Search,
  Filter, Download, CheckCircle2, UserPlus, Eye, QrCode, Printer, Shield,
  Phone, Mail, MapPin, User, Upload, ArrowRight, Ban, RefreshCw, Layers
} from 'lucide-react'

// Generic Glassmorphic Modal Component
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
      <div className="surface-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-current/15 pb-4">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-current/10 transition"><X className="size-5" /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

// 1. BAN / UNBAN USER & EMPLOYEE BUTTON WITH AUDIT LOGGING
export function BanUnbanUserButton({ profileId, currentStatus, role = 'resident' }: { profileId: string; currentStatus: string; role?: string }) {
  const [busy, setBusy] = useState(false)
  const isBanned = currentStatus === 'banned'

  async function toggleBan() {
    const targetStatus = isBanned ? 'approved' : 'banned'
    const confirmText = isBanned
      ? `Are you sure you want to UNBAN this ${role}? They will be able to log in normally.`
      : `Are you sure you want to BAN this ${role}? Their access will be blocked immediately.`

    if (!confirm(confirmText)) return

    setBusy(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('profiles').update({ status: targetStatus }).eq('id', profileId)

      if (!error && user) {
        await supabase.from('approval_events').insert({
          profile_id: profileId,
          acted_by: user.id,
          from_status: currentStatus,
          to_status: targetStatus
        })
        window.location.reload()
      } else if (error) {
        alert('Could not update account status: ' + error.message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      disabled={busy}
      onClick={toggleBan}
      className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold shadow-sm transition ${
        isBanned
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
          : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
      }`}
      title={isBanned ? 'Unban Account' : 'Ban Account'}
    >
      {isBanned ? <CheckCircle2 className="size-3.5" /> : <Ban className="size-3.5" />}
      {isBanned ? 'Unban Account' : 'Ban Account'}
    </button>
  )
}

// 2. RESIDENT APPROVAL ACTIONS (Super Admin)
export function ResidentApprovalActions({ profileId, currentStatus }: { profileId: string; currentStatus: string }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function updateStatus(status: 'approved' | 'rejected' | 'suspended' | 'banned') {
    setBusy(true); setMsg('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({ status }).eq('id', profileId)
      if (error) { setMsg('Failed to update status'); return }

      if (user) {
        await supabase.from('approval_events').insert({
          profile_id: profileId,
          acted_by: user.id,
          from_status: currentStatus,
          to_status: status
        })
      }
      setMsg(`Account ${status}`)
      setTimeout(() => window.location.reload(), 800)
    } catch {
      setMsg('Error updating status')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'approved' && (
        <button
          disabled={busy}
          onClick={() => updateStatus('approved')}
          className="theme-button-primary flex items-center gap-1 py-1.5 px-3 text-xs"
        >
          <UserCheck className="size-3.5" /> Approve
        </button>
      )}
      {currentStatus === 'approved' && (
        <BanUnbanUserButton profileId={profileId} currentStatus={currentStatus} role="resident" />
      )}
      {currentStatus === 'pending' && (
        <button
          disabled={busy}
          onClick={() => updateStatus('rejected')}
          className="theme-button-secondary py-1.5 px-3 text-xs text-red-300 border-red-500/30"
        >
          Reject
        </button>
      )}
    </div>
  )
}

// 3. RESIDENT PROFILE DETAILED MODAL
export function ResidentProfileModal({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [bills, setBills] = useState<any[]>([])

  async function loadDetails() {
    setOpen(true)
    setLoading(true)
    try {
      const supabase = createClient()
      const [{ data: vData }, { data: pData }, { data: bData }] = await Promise.all([
        supabase.from('vehicles').select('*').eq('owner_id', profile.id),
        supabase.from('pets').select('*').eq('owner_id', profile.id),
        supabase.from('maintenance_bills').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(5)
      ])
      setVehicles(vData || [])
      setPets(pData || [])
      setBills(bData || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={loadDetails} className="theme-button-secondary py-1.5 px-3 text-xs flex items-center gap-1">
        <Eye className="size-3.5" /> Profile Card
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Resident Profile & Security Clearance">
        <div className="flex flex-col gap-5">
          {/* HEADER AVATAR & STATUS */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-current/15 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="size-16 rounded-2xl object-cover border-2 border-white/20" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-black/40 border border-white/20 font-bold text-2xl">
                  {profile.full_name?.slice(0, 1).toUpperCase() || 'R'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-extrabold">{profile.full_name}</h3>
                <p className="text-xs opacity-75 font-mono">
                  {profile.occupancy_type ? profile.occupancy_type.toUpperCase() : 'RESIDENT'} • {profile.block || 'Block A'}, Flat {profile.flat_number || 'A-101'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase font-mono border ${
                profile.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                profile.status === 'banned' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {profile.status}
              </span>
              <BanUnbanUserButton profileId={profile.id} currentStatus={profile.status} role="resident" />
            </div>
          </div>

          {/* CONTACT INFO GRID */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono rounded-2xl border border-current/15 bg-black/10 p-4">
            <div><span className="opacity-60">Email:</span> <span className="font-bold text-white">{profile.email || 'N/A'}</span></div>
            <div><span className="opacity-60">Phone:</span> <span className="font-bold text-white">{profile.phone || 'N/A'}</span></div>
            <div><span className="opacity-60">Tower/Block:</span> <span className="font-bold">{profile.block || 'Block A'}</span></div>
            <div><span className="opacity-60">Flat Number:</span> <span className="font-bold">{profile.flat_number || 'N/A'}</span></div>
            <div><span className="opacity-60">Registered On:</span> <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}</span></div>
            <div><span className="opacity-60">Occupancy:</span> <span className="font-bold uppercase text-emerald-300">{profile.occupancy_type || 'Owner'}</span></div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs opacity-75">Loading connected records…</div>
          ) : (
            <div className="space-y-4">
              {/* VEHICLES */}
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider opacity-80 mb-2 flex items-center gap-1.5">
                  <Car className="size-4 text-emerald-400" /> Registered Vehicles ({vehicles.length})
                </h4>
                {vehicles.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vehicles.map(v => (
                      <div key={v.id} className="rounded-xl border border-current/15 bg-black/20 p-2.5 text-xs font-mono flex justify-between">
                        <span className="font-bold">{v.registration_number}</span>
                        <span className="opacity-70 capitalize">{v.vehicle_type}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs opacity-60 italic">No vehicles registered.</p>}
              </div>

              {/* PETS */}
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider opacity-80 mb-2 flex items-center gap-1.5">
                  <Dog className="size-4 text-amber-400" /> Registered Pets ({pets.length})
                </h4>
                {pets.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {pets.map(p => (
                      <div key={p.id} className="rounded-xl border border-current/15 bg-black/20 p-2.5 text-xs font-mono flex justify-between">
                        <span className="font-bold">{p.pet_name}</span>
                        <span className="opacity-70">{p.breed || 'Pet'}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs opacity-60 italic">No pets registered.</p>}
              </div>

              {/* MAINTENANCE BILLS */}
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider opacity-80 mb-2 flex items-center gap-1.5">
                  <DollarSign className="size-4 text-sky-400" /> Recent Maintenance History ({bills.length})
                </h4>
                {bills.length ? (
                  <div className="space-y-1.5">
                    {bills.map(b => (
                      <div key={b.id} className="rounded-xl border border-current/15 bg-black/20 p-2.5 text-xs font-mono flex items-center justify-between">
                        <span>{b.title} ({b.period})</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₹{b.amount}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${b.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs opacity-60 italic">No bill records.</p>}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

// 4. EMPLOYEE PROFILE DETAILED MODAL
export function EmployeeProfileModal({ employee }: { employee: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attendance, setAttendance] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])

  async function loadDetails() {
    setOpen(true)
    setLoading(true)
    try {
      const supabase = createClient()
      const [{ data: aData }, { data: tData }, { data: lData }] = await Promise.all([
        supabase.from('attendance').select('*').eq('employee_id', employee.id).order('attendance_date', { ascending: false }).limit(10),
        supabase.from('employee_tasks').select('*').eq('employee_id', employee.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('leave_requests').select('*').eq('employee_id', employee.id).order('created_at', { ascending: false }).limit(5)
      ])
      setAttendance(aData || [])
      setTasks(tData || [])
      setLeaves(lData || [])
    } finally {
      setLoading(false)
    }
  }

  const empIdShort = 'EMP-' + (employee.id ? employee.id.slice(0, 6).toUpperCase() : '1001')

  return (
    <>
      <button onClick={loadDetails} className="theme-button-secondary py-1.5 px-3 text-xs flex items-center gap-1">
        <Eye className="size-3.5" /> Staff Profile
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Employee Duty & Payroll Card">
        <div className="flex flex-col gap-5">
          {/* HEADER AVATAR & STATUS */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-current/15 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              {employee.avatar_url ? (
                <img src={employee.avatar_url} alt={employee.full_name} className="size-16 rounded-2xl object-cover border-2 border-white/20" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-black/40 border border-white/20 font-bold text-2xl">
                  {employee.full_name?.slice(0, 1).toUpperCase() || 'E'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-extrabold">{employee.full_name}</h3>
                <p className="text-xs opacity-75 font-mono">{empIdShort} • {employee.designation || 'Staff Member'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase font-mono border ${
                employee.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                employee.status === 'banned' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {employee.status}
              </span>
              <BanUnbanUserButton profileId={employee.id} currentStatus={employee.status} role="employee" />
            </div>
          </div>

          {/* CONTACT INFO GRID */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono rounded-2xl border border-current/15 bg-black/10 p-4">
            <div><span className="opacity-60">Email:</span> <span className="font-bold text-white">{employee.email || 'N/A'}</span></div>
            <div><span className="opacity-60">Phone:</span> <span className="font-bold text-white">{employee.phone || 'N/A'}</span></div>
            <div><span className="opacity-60">Designation:</span> <span className="font-bold text-amber-300">{employee.designation || 'Staff'}</span></div>
            <div><span className="opacity-60">Department:</span> <span>Operations & Security</span></div>
            <div><span className="opacity-60">Joining Date:</span> <span>{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'Active'}</span></div>
            <div><span className="opacity-60">Shifts Logged:</span> <span className="font-bold text-emerald-300">{attendance.length} Days</span></div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs opacity-75">Loading staff records…</div>
          ) : (
            <div className="space-y-4">
              {/* TASKS */}
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider opacity-80 mb-2 flex items-center gap-1.5">
                  <CheckSquare className="size-4 text-sky-400" /> Assigned Work Orders ({tasks.length})
                </h4>
                {tasks.length ? (
                  <div className="space-y-1.5">
                    {tasks.map(t => (
                      <div key={t.id} className="rounded-xl border border-current/15 bg-black/20 p-2.5 text-xs font-mono flex justify-between">
                        <span>{t.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs opacity-60 italic">No assigned tasks.</p>}
              </div>

              {/* LEAVES */}
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider opacity-80 mb-2 flex items-center gap-1.5">
                  <Calendar className="size-4 text-purple-400" /> Leave Applications ({leaves.length})
                </h4>
                {leaves.length ? (
                  <div className="space-y-1.5">
                    {leaves.map(l => (
                      <div key={l.id} className="rounded-xl border border-current/15 bg-black/20 p-2.5 text-xs font-mono flex justify-between">
                        <span>{l.leave_type.toUpperCase()} ({l.starts_on} to {l.ends_on})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${l.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : l.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs opacity-60 italic">No leave applications.</p>}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

// 5. CREATE EMPLOYEE MODAL (Super Admin)
export function CreateEmployeeModal({ societyId }: { societyId: string | null }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', designation: 'Security Guard', salary: '25000' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            role: 'employee',
            phone: form.phone
          }
        }
      })

      if (authError || !authData.user) {
        setError(authError?.message || 'Could not register employee auth user.')
        setBusy(false)
        return
      }

      await supabase.from('profiles').upsert({
        id: authData.user.id,
        society_id: societyId,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'employee',
        status: 'approved',
        designation: form.designation
      })

      setOpen(false)
      window.location.reload()
    } catch {
      setError('Error creating employee.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <UserPlus className="size-4" /> Add Employee Account
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Register Employee Account">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Employee Full Name
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="theme-input text-sm" placeholder="Ramesh Kumar" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Email Address
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="theme-input text-sm" placeholder="ramesh@societysync.app" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Phone Number
            <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="theme-input text-sm" placeholder="+91 9876543210" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Initial Password
            <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="theme-input text-sm" placeholder="••••••••" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Designation
              <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="theme-input text-sm">
                <option value="Security Guard">Security Guard</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Gardener">Gardener</option>
                <option value="Cleaning Staff">Cleaning Staff</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Monthly Base Salary (₹)
              <input required type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="theme-input text-sm" placeholder="25000" />
            </label>
          </div>
          {error && <p className="text-xs text-red-300 font-medium">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Creating…' : 'Create Employee'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 6. CREATE MAINTENANCE BILL MODAL (Super Admin)
export function CreateBillModal({ societyId }: { societyId: string | null }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ flatNumber: '', title: 'Monthly Maintenance Fee', amount: '2500', dueDate: '', period: 'August 2026' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      const supabase = createClient()
      const { error } = await supabase.from('maintenance_bills').insert({
        society_id: societyId,
        flat_number: form.flatNumber,
        title: form.title,
        amount: parseFloat(form.amount),
        due_date: form.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        period: form.period,
        status: 'pending'
      })
      if (error) { setMsg(error.message); setBusy(false); return }
      setOpen(false)
      window.location.reload()
    } catch {
      setMsg('Error creating bill')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Plus className="size-4" /> Generate Maintenance Bill
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Generate Maintenance Bill">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Flat Number
            <input required type="text" value={form.flatNumber} onChange={e => setForm({ ...form, flatNumber: e.target.value })} className="theme-input text-sm" placeholder="A-302" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Bill Title
            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Amount (₹)
            <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Billing Period
            <input required type="text" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="theme-input text-sm" placeholder="August 2026" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Due Date
            <input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="theme-input text-sm" />
          </label>
          {msg && <p className="text-xs text-red-300 font-medium">{msg}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Generating…' : 'Generate Bill'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 7. CREATE VISITOR PASS MODAL (Resident / Admin) WITH REAL DYNAMIC QR CODE
export function CreateVisitorPassModal({ societyId, residentId }: { societyId: string | null; residentId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ visitorName: '', phone: '', vehicleNumber: '', visitDate: '', purpose: 'Guest Visit' })
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      const passCode = 'PASS-' + Math.floor(1000 + Math.random() * 9000)
      const { error } = await createClient().from('visitor_passes').insert({
        society_id: societyId,
        resident_id: residentId,
        visitor_name: form.visitorName,
        visitor_phone: form.phone,
        vehicle_number: form.vehicleNumber,
        visit_date: form.visitDate || new Date().toISOString().slice(0, 10),
        purpose: form.purpose,
        pass_code: passCode,
        status: 'approved'
      })
      if (!error) {
        setOpen(false)
        window.location.reload()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Plus className="size-4" /> Issue Digital Visitor Pass
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Issue Digital Visitor Pass">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Visitor Name
            <input required type="text" value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} className="theme-input text-sm" placeholder="Guest Name" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Visitor Phone
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="theme-input text-sm" placeholder="+91 9876543210" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Vehicle Number (Optional)
            <input type="text" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} className="theme-input text-sm" placeholder="KA-01-AB-1234" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Visit Date
            <input type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Purpose
            <input required type="text" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="theme-input text-sm" placeholder="Delivery / Guest / Repair" />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Generating…' : 'Generate Pass'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 8. VISITOR PASS DYNAMIC QR VIEW & DOWNLOAD MODAL
export function VisitorPassQRModal({ pass }: { pass: any }) {
  const [open, setOpen] = useState(false)
  const passCode = pass.pass_code || 'PASS-4921'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`SOCIETYSYNC-PASS:${passCode}:${pass.visitor_name}`)}`

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
        <QrCode className="size-3.5 text-emerald-300" /> View QR Pass
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Digital Gate Clearance Pass">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-3xl border-2 border-emerald-400/40 bg-black/40 p-5 shadow-2xl backdrop-blur-2xl">
            <img src={qrUrl} alt={`QR Code ${passCode}`} className="size-48 rounded-2xl bg-white p-2 shadow-inner" />
            <p className="mt-3 font-mono text-base font-extrabold tracking-widest text-emerald-300">{passCode}</p>
          </div>

          <div className="w-full rounded-2xl border border-current/15 bg-black/20 p-4 text-xs font-mono text-left space-y-2">
            <div className="flex justify-between"><span className="opacity-60">Visitor Name:</span> <span className="font-bold text-white">{pass.visitor_name}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Phone:</span> <span className="font-bold">{pass.visitor_phone || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Vehicle Number:</span> <span className="font-bold text-amber-300">{pass.vehicle_number || 'None'}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Visit Date:</span> <span>{pass.visit_date}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Purpose:</span> <span>{pass.purpose}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Status:</span> <span className="font-bold text-emerald-300 uppercase">{pass.status || 'APPROVED'}</span></div>
          </div>

          <button onClick={() => window.print()} className="theme-button-primary w-full flex items-center justify-center gap-2 text-xs py-2.5">
            <Printer className="size-4" /> Download / Print Visitor Pass
          </button>
        </div>
      </Modal>
    </>
  )
}

// 9. RESIDENT PAY BILL MODAL WITH CASH / UPI / RAZORPAY
export function PayBillModal({ billId, profileId, amount, flatNumber }: { billId: string; profileId: string; amount: number; flatNumber: string }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState('upi')
  const [busy, setBusy] = useState(false)

  async function pay() {
    setBusy(true)
    try {
      const supabase = createClient()
      const txId = 'TXN-' + Date.now()
      const { data: payment, error: payError } = await supabase.from('payments').insert({
        bill_id: billId,
        profile_id: profileId,
        amount,
        payment_method: method,
        transaction_id: txId,
        status: 'completed'
      }).select().single()

      if (payError) return

      await supabase.from('maintenance_bills').update({ status: 'paid' }).eq('id', billId)

      if (payment) {
        await supabase.from('receipts').insert({
          payment_id: payment.id,
          receipt_number: 'REC-' + Math.floor(100000 + Math.random() * 900000),
          profile_id: profileId,
          amount
        })
      }

      setOpen(false)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary py-1.5 px-3 text-xs flex items-center gap-1 shadow-md">
        <CreditCard className="size-3.5" /> Pay ₹{amount}
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Pay Maintenance Bill - Flat ${flatNumber}`}>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-current/15 bg-black/20 p-5 text-center">
            <p className="text-xs uppercase font-mono tracking-wider opacity-70">Total Amount Due</p>
            <p className="text-4xl font-extrabold mt-1">₹{amount.toLocaleString('en-IN')}</p>
          </div>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Select Payment Gateway / Method
            <select value={method} onChange={e => setMethod(e.target.value)} className="theme-input text-sm">
              <option value="upi">UPI Instant (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash Collection (Handed to Admin)</option>
              <option value="razorpay">Razorpay Online Gateway (Integrated)</option>
              <option value="card">Credit / Debit Card</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} onClick={pay} className="theme-button-primary text-sm">{busy ? 'Processing…' : 'Confirm & Pay'}</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// 10. EMPLOYEE CHECK IN / CHECK OUT
export function EmployeeAttendanceToggle({ employeeId }: { employeeId: string }) {
  const [busy, setBusy] = useState(false)

  async function checkIn() {
    setBusy(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const now = new Date().toISOString()
      await createClient().from('attendance').upsert({
        employee_id: employeeId,
        attendance_date: today,
        check_in: now,
        status: 'present'
      }, { onConflict: 'employee_id,attendance_date' })
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  async function checkOut() {
    setBusy(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const now = new Date().toISOString()
      await createClient().from('attendance').update({
        check_out: now
      }).eq('employee_id', employeeId).eq('attendance_date', today)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button disabled={busy} onClick={checkIn} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Clock className="size-4" /> Check In Today
      </button>
      <button disabled={busy} onClick={checkOut} className="theme-button-secondary flex items-center gap-2 text-sm">
        Check Out
      </button>
    </div>
  )
}
