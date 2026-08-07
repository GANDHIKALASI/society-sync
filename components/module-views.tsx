'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Check, X, UserCheck, ShieldAlert, AlertCircle, Clock, Calendar,
  Building2, Car, Dog, FileText, Wrench, CheckSquare, Megaphone, Folder,
  DollarSign, CreditCard, FileCheck, MessageSquare, Trash2, Edit, Search,
  Filter, Download, CheckCircle2, UserPlus, Eye
} from 'lucide-react'

// Generic Modal Component
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-current/15 pb-4">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-current/10"><X className="size-5" /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

// 1. RESIDENT APPROVAL ACTIONS (Super Admin)
export function ResidentApprovalActions({ profileId, currentStatus }: { profileId: string; currentStatus: string }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function updateStatus(status: 'approved' | 'rejected') {
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
      <button
        disabled={busy}
        onClick={() => updateStatus('approved')}
        className="theme-button-primary flex items-center gap-1 py-1.5 px-3 text-xs"
      >
        <UserCheck className="size-3.5" /> Approve
      </button>
      <button
        disabled={busy}
        onClick={() => updateStatus('rejected')}
        className="theme-button-secondary py-1.5 px-3 text-xs"
      >
        Reject
      </button>
      {msg && <span className="text-xs opacity-75">{msg}</span>}
    </div>
  )
}

// 2. CREATE EMPLOYEE ACCOUNT MODAL (Super Admin)
export function CreateEmployeeModal({ societyId }: { societyId: string | null }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', designation: 'Security Guard' })
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
            phone: form.phone,
            role: 'employee',
            designation: form.designation,
            status: 'approved',
            society_id: societyId
          }
        }
      })

      if (authError) { setError(authError.message); setBusy(false); return }

      if (authData?.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          role: 'employee',
          designation: form.designation,
          status: 'approved',
          society_id: societyId
        })
      }

      setOpen(false)
      window.location.reload()
    } catch {
      setError('Could not create employee account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm">
        <UserPlus className="size-4" /> Add Employee Account
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Employee Account">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Full Name
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="theme-input text-sm" placeholder="Ramesh Kumar" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Email Address
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="theme-input text-sm" placeholder="ramesh@societysync.app" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Phone Number
            <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="theme-input text-sm" placeholder="+91 9876543210" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Initial Password
            <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="theme-input text-sm" placeholder="••••••••" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Designation
            <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="theme-input text-sm">
              <option value="Security Guard">Security Guard</option>
              <option value="Facility Manager">Facility Manager</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Gardener">Gardener</option>
              <option value="Cleaning Staff">Cleaning Staff</option>
            </select>
          </label>
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

// 3. CREATE MAINTENANCE BILL MODAL (Super Admin)
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
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm">
        <Plus className="size-4" /> Generate Maintenance Bill
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Generate Maintenance Bill">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Flat Number
            <input required type="text" value={form.flatNumber} onChange={e => setForm({ ...form, flatNumber: e.target.value })} className="theme-input text-sm" placeholder="A-302" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Bill Title
            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Amount (₹)
            <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Billing Period
            <input required type="text" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="theme-input text-sm" placeholder="August 2026" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Due Date
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

// 4. CREATE VISITOR PASS MODAL (Resident)
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
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm">
        <Plus className="size-4" /> Issue Digital Visitor Pass
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Issue Digital Visitor Pass">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Visitor Name
            <input required type="text" value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} className="theme-input text-sm" placeholder="Guest Name" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Visitor Phone
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="theme-input text-sm" placeholder="+91 9876543210" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Vehicle Number (Optional)
            <input type="text" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} className="theme-input text-sm" placeholder="KA-01-AB-1234" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Visit Date
            <input type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Purpose
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

// 5. RESIDENT PAY BILL MODAL
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
      <button onClick={() => setOpen(true)} className="theme-button-primary py-1.5 px-3 text-xs flex items-center gap-1">
        <CreditCard className="size-3.5" /> Pay ₹{amount}
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Pay Maintenance Bill - Flat ${flatNumber}`}>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-current/15 bg-black/10 p-4 text-center">
            <p className="text-xs uppercase opacity-70">Total Amount Due</p>
            <p className="text-3xl font-bold mt-1">₹{amount.toLocaleString('en-IN')}</p>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Select Payment Method
            <select value={method} onChange={e => setMethod(e.target.value)} className="theme-input text-sm">
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="card">Credit / Debit Card</option>
              <option value="netbanking">Net Banking</option>
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

// 6. EMPLOYEE CHECK IN / CHECK OUT
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
      <button disabled={busy} onClick={checkIn} className="theme-button-primary flex items-center gap-2 text-sm">
        <Clock className="size-4" /> Check In Today
      </button>
      <button disabled={busy} onClick={checkOut} className="theme-button-secondary flex items-center gap-2 text-sm">
        Check Out
      </button>
    </div>
  )
}
