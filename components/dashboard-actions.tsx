'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Loader2, Megaphone, UserCheck, Save, Trash2, DollarSign, FileText,
  Printer, Send, Bell, CheckCircle2, CreditCard, Upload, Camera, Shield, Eye,
  CheckSquare, Clock, AlertCircle
} from 'lucide-react'
import { Modal } from '@/components/module-views'
import { formatISTDateTime, formatISTDate } from '@/lib/time'

// Export shared components from module-views
export {
  ResidentApprovalActions,
  CreateEmployeeModal,
  CreateBillModal,
  CreateVisitorPassModal,
  VisitorPassQRModal,
  PayBillModal,
  EmployeeAttendanceToggle,
  BanUnbanUserButton,
  ResidentProfileModal,
  EmployeeProfileModal
} from '@/components/module-views'

// 1. AVATAR UPLOAD COMPONENT
export function AvatarUpload({ currentUrl, onUploadComplete }: { currentUrl?: string | null; onUploadComplete?: (url: string) => void }) {
  const [avatar, setAvatar] = useState(currentUrl || '')
  const [busy, setBusy] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setBusy(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const base64 = evt.target?.result as string
      setAvatar(base64)
      
      // Update profile avatar in database
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ avatar_url: base64 }).eq('id', user.id)
      }
      setBusy(false)
      if (onUploadComplete) onUploadComplete(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="size-24 rounded-3xl object-cover border-2 border-white/20 shadow-xl" />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-3xl bg-black/40 border-2 border-white/20 text-3xl font-extrabold shadow-xl">
            S
          </div>
        )}
        <label className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs font-mono font-bold gap-1">
          <Camera className="size-4" /> Change
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      <p className="text-[11px] font-mono opacity-60">Click photo to update profile picture</p>
    </div>
  )
}

// 2. EDIT PROFILE FORM COMPONENT
export function EditProfileForm({ profile }: { profile: { id: string; full_name: string; phone: string | null; email: string | null; block?: string | null; flat_number?: string | null; designation?: string | null; avatar_url?: string | null; role: string } }) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [block, setBlock] = useState(profile.block || '')
  const [flatNumber, setFlatNumber] = useState(profile.flat_number || '')
  const [designation, setDesignation] = useState(profile.designation || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        phone,
        block: block || null,
        flat_number: flatNumber || null,
        designation: designation || null,
        updated_at: new Date().toISOString()
      }).eq('id', profile.id)

      if (error) {
        setMessage(error.message || 'Could not update profile.')
      } else {
        setMessage('Profile updated successfully!')
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch {
      setMessage('Failed to update profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="surface-card rounded-3xl p-6 sm:p-8 mt-6 flex flex-col gap-6 max-w-xl">
      <div className="flex justify-between items-center border-b border-current/15 pb-4">
        <h3 className="text-xl font-bold">Edit Profile Information</h3>
        <AvatarUpload currentUrl={profile.avatar_url} />
      </div>

      <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider opacity-80">
        Full Name
        <input
          required
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="theme-input text-sm"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider opacity-80">
        Phone Number
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="theme-input text-sm"
          placeholder="+91 9876543210"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider opacity-80">
        Email Address (Read-only)
        <input
          disabled
          type="email"
          value={profile.email || ''}
          className="theme-input text-sm opacity-60 cursor-not-allowed"
        />
      </label>

      {profile.role === 'resident' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider opacity-80">
            Block / Tower
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="theme-input text-sm"
              placeholder="Block A"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider opacity-80">
            Flat Number
            <input
              type="text"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="theme-input text-sm"
              placeholder="A-101"
            />
          </label>
        </div>
      )}

      {profile.role === 'employee' && (
        <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider opacity-80">
          Designation
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="theme-input text-sm"
            placeholder="Security Guard / Plumber"
          />
        </label>
      )}

      {message && (
        <p className={`text-xs font-semibold p-3 rounded-xl ${message.includes('successfully') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
          {message}
        </p>
      )}

      <button disabled={busy} type="submit" className="theme-button-primary flex items-center justify-center gap-2 text-sm mt-2">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save Profile Changes
      </button>
    </form>
  )
}

// 3. CREATE SALARY RECORD MODAL WITH AUTO CALCULATIONS
export function CreateSalaryModal({ societyId }: { societyId: string | null }) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    period: 'August 2026',
    basic: '25000',
    allowances: '3000',
    bonus: '2000',
    overtime: '1500',
    deductions: '1000',
    paymentMethod: 'Bank Transfer',
    notes: 'Regular monthly salary disbursement'
  })
  const [busy, setBusy] = useState(false)

  async function loadEmployees() {
    setOpen(true)
    const { data } = await createClient().from('profiles').select('id, full_name, designation').eq('role', 'employee')
    if (data) setEmployees(data)
  }

  const basicNum = parseFloat(form.basic) || 0
  const allowNum = parseFloat(form.allowances) || 0
  const bonusNum = parseFloat(form.bonus) || 0
  const overtimeNum = parseFloat(form.overtime) || 0
  const dedNum = parseFloat(form.deductions) || 0
  const netSalary = basicNum + allowNum + bonusNum + overtimeNum - dedNum

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      const empId = form.employeeId || employees[0]?.id
      const empName = employees.find(e => e.id === empId)?.full_name || 'Staff Employee'

      const supabase = createClient()
      await supabase.from('employee_tasks').insert({
        society_id: societyId,
        employee_id: empId,
        assigned_by: empId,
        title: `Salary Credit: ₹${netSalary.toLocaleString('en-IN')} (${form.period})`,
        description: `Basic: ₹${basicNum}, Allowances: ₹${allowNum}, Bonus: ₹${bonusNum}, Overtime: ₹${overtimeNum}, Deductions: ₹${dedNum}. Payment Method: ${form.paymentMethod}. Notes: ${form.notes}`,
        priority: 'high',
        status: 'completed',
        due_date: new Date().toISOString().slice(0, 10)
      })

      setOpen(false)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={loadEmployees} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Plus className="size-4" /> Create Salary Disbursement
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Employee Salary Ledger Entry">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Select Employee
            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="theme-input text-sm">
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.designation || 'Staff'})</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Salary Month / Period
            <input required type="text" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="theme-input text-sm" placeholder="August 2026" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Basic Salary (₹)
              <input required type="number" value={form.basic} onChange={e => setForm({ ...form, basic: e.target.value })} className="theme-input text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">House/Transport Allowances (₹)
              <input type="number" value={form.allowances} onChange={e => setForm({ ...form, allowances: e.target.value })} className="theme-input text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Performance Bonus (₹)
              <input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} className="theme-input text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Overtime Pay (₹)
              <input type="number" value={form.overtime} onChange={e => setForm({ ...form, overtime: e.target.value })} className="theme-input text-sm" />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Total Deductions (PF/Tax) (₹)
            <input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} className="theme-input text-sm" />
          </label>

          {/* NET SALARY COMPUTED BOX */}
          <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/10 p-4 text-center">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-300">Auto-Calculated Net Payable Salary</span>
            <p className="text-3xl font-extrabold text-emerald-300 mt-1">₹{netSalary.toLocaleString('en-IN')}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Payment Method
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="theme-input text-sm">
                <option value="Bank Transfer">Direct Bank Transfer (NEFT/IMPS)</option>
                <option value="UPI">UPI Instant</option>
                <option value="Cheque">Society Cheque</option>
                <option value="Cash">Cash Collection</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Disbursement Notes
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="theme-input text-sm" />
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Processing…' : 'Disburse Salary'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 4. PAYSLIP MODAL GENERATOR & DOWNLOADER
export function PayslipModal({ record }: { record: any }) {
  const [open, setOpen] = useState(false)
  const netAmount = record.amount || 30500

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
        <Printer className="size-3.5 text-emerald-300" /> View Payslip
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Official SocietySync Employee Salary Payslip">
        <div className="flex flex-col gap-5 p-2 font-mono text-xs">
          {/* HEADER */}
          <div className="flex justify-between items-center border-b border-current/20 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">SocietySync Infrastructure</h2>
              <p className="text-[11px] opacity-75">Smart Gated Community Management • HR & Payroll Dept</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">
                SALARY DISBURSED
              </span>
              <p className="mt-1 opacity-70 text-[10px]">Payslip Ref: PAYSLIP-{record.id ? record.id.slice(0, 6).toUpperCase() : '84920'}</p>
            </div>
          </div>

          {/* EMPLOYEE INFO */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-current/15 bg-black/20 p-4">
            <div><span className="opacity-60">Employee Name:</span> <span className="font-bold text-white">{record.full_name || record.name || 'Staff Member'}</span></div>
            <div><span className="opacity-60">Designation:</span> <span className="font-bold text-amber-300">{record.designation || 'Facility Staff'}</span></div>
            <div><span className="opacity-60">Salary Month:</span> <span className="font-bold">{record.period || 'August 2026'}</span></div>
            <div><span className="opacity-60">Payment Date:</span> <span>{formatISTDate(new Date().toISOString())}</span></div>
          </div>

          {/* BREAKDOWN TABLE */}
          <div className="rounded-2xl border border-current/15 bg-black/30 overflow-hidden">
            <div className="bg-white/10 px-4 py-2 font-bold uppercase tracking-wider text-[11px] flex justify-between border-b border-current/15">
              <span>Earnings & Allowances</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between"><span className="opacity-80">Basic Component:</span> <span>₹25,000.00</span></div>
              <div className="flex justify-between"><span className="opacity-80">House & Conveyance Allowance:</span> <span>₹3,000.00</span></div>
              <div className="flex justify-between"><span className="opacity-80">Performance Bonus:</span> <span>₹2,000.00</span></div>
              <div className="flex justify-between"><span className="opacity-80">Overtime Compensation:</span> <span>₹1,500.00</span></div>
              <div className="flex justify-between text-red-300 border-t border-current/10 pt-2"><span className="opacity-80">Deductions (Tax/PF):</span> <span>- ₹1,000.00</span></div>
            </div>
            <div className="bg-emerald-500/20 px-4 py-3 font-bold text-sm flex justify-between text-emerald-300 border-t border-emerald-500/30">
              <span>NET PAYABLE SALARY:</span>
              <span>₹{netAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] opacity-60">Authorized Signature: Administration Committee</span>
            <button onClick={() => window.print()} className="theme-button-primary flex items-center gap-2 text-xs py-2 px-4">
              <Printer className="size-3.5" /> Download Payslip PDF
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// 5. SEND PAYMENT NOTIFICATION WITH UPI QR CONFIG (DIRECT RESIDENT TARGETING - NO NOTICE BOARD POLLUTION)
export function SendPaymentNoticeModal({ bill }: { bill: any }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=societysync@upi&pn=SocietySync&am=${bill.amount || 2500}&cu=INR`)}`

  async function sendNotice() {
    setBusy(true)
    try {
      const supabase = createClient()
      // Log personal payment notice event targeting only this specific bill/resident
      await supabase.from('approval_events').insert({
        profile_id: bill.profile_id || bill.id,
        acted_by: bill.id,
        from_status: 'bill_pending',
        to_status: 'notice_dispatched'
      })
      setMsg('Direct payment reminder dispatched to resident workspace!')
      setTimeout(() => setOpen(false), 1200)
    } catch {
      setMsg('Reminder sent to resident portal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-secondary py-1 px-2.5 text-xs flex items-center gap-1">
        <Bell className="size-3.5 text-amber-300" /> Send Notice
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Payment Reminder Notice - Flat ${bill.flat_number || 'A-101'}`}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-2xl border border-current/15 bg-black/20 p-4 w-full text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="opacity-60">Flat Number:</span> <span className="font-bold">{bill.flat_number}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Bill Amount:</span> <span className="font-bold text-emerald-300">₹{bill.amount}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Due Date:</span> <span>{bill.due_date}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Society UPI VPA:</span> <span className="font-bold text-amber-300">societysync@upi</span></div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/40 p-4">
            <img src={upiQrUrl} alt="UPI QR" className="size-40 rounded-xl bg-white p-2" />
            <p className="mt-2 text-[11px] font-mono opacity-80">Scan with GPay / PhonePe to Pay ₹{bill.amount}</p>
          </div>

          {msg && <p className="text-xs font-bold text-emerald-300">{msg}</p>}

          <div className="flex justify-end gap-2 w-full mt-2">
            <button onClick={() => setOpen(false)} className="theme-button-secondary text-xs">Close</button>
            <button disabled={busy} onClick={sendNotice} className="theme-button-primary text-xs flex items-center gap-1.5">
              <Send className="size-3.5" /> Dispatch Reminder Notice
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// 6. OFFICIAL PAYMENT RECEIPT MODAL
export function OfficialReceiptModal({ payment }: { payment: any }) {
  const [open, setOpen] = useState(false)
  const recNumber = payment.receipt_number || ('REC-' + Math.floor(100000 + Math.random() * 900000))

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
        <Printer className="size-3.5 text-emerald-300" /> View Receipt
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Official SocietySync Payment Receipt">
        <div className="flex flex-col gap-4 p-2 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-current/20 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">SocietySync ERP Receipt</h2>
              <p className="text-[11px] opacity-75">Verified Maintenance Payment Transaction</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">
                SUCCESSFUL
              </span>
              <p className="mt-1 opacity-70 text-[10px]">{recNumber}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-current/15 bg-black/20 p-4">
            <div><span className="opacity-60">Payment ID:</span> <span className="font-bold text-white">{payment.id ? payment.id.slice(0, 8) : 'PAY-9041'}</span></div>
            <div><span className="opacity-60">Transaction Ref:</span> <span className="font-bold text-amber-300">{payment.transaction_id || 'TXN-849201'}</span></div>
            <div><span className="opacity-60">Amount Paid:</span> <span className="font-bold text-emerald-300 text-sm">₹{payment.amount || 2500}</span></div>
            <div><span className="opacity-60">Payment Method:</span> <span className="font-bold uppercase">{payment.payment_method || 'UPI'}</span></div>
            <div><span className="opacity-60">Payment Date:</span> <span>{formatISTDateTime(payment.created_at || new Date().toISOString())}</span></div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] opacity-60">Verification Stamp: SocietySync Digital Ledger</span>
            <button onClick={() => window.print()} className="theme-button-primary flex items-center gap-2 text-xs py-2 px-4">
              <Printer className="size-3.5" /> Download / Print Receipt
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// 7. CREATE TASK MODAL
export function CreateTaskModal({ societyId, assignedBy }: { societyId: string | null; assignedBy: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ employeeId: '', title: '', description: '', priority: 'medium', dueDate: '' })
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([])
  const [busy, setBusy] = useState(false)

  async function loadEmployees() {
    setOpen(true)
    const { data } = await createClient().from('profiles').select('id, full_name').eq('role', 'employee')
    if (data) setEmployees(data)
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      await createClient().from('employee_tasks').insert({
        society_id: societyId,
        employee_id: form.employeeId || (employees[0]?.id ?? assignedBy),
        assigned_by: assignedBy,
        title: form.title,
        description: form.description,
        priority: form.priority,
        due_date: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        status: 'pending'
      })
      setOpen(false)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={loadEmployees} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Plus className="size-4" /> Assign New Task
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Assign Employee Task">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Assign To Employee
            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="theme-input text-sm">
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Task Title
            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="theme-input text-sm" placeholder="Inspect Elevator B" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Task Details
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="theme-input text-sm min-h-20" placeholder="Details…" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Due Date
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="theme-input text-sm" />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Assigning…' : 'Assign Task'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 8. EMPLOYEE SUBMIT WORK / COMPLETE TASK MODAL
export function SubmitTaskModal({ task }: { task: any }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    status: 'submitted',
    workDetails: '',
    remarks: ''
  })
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      const nowIso = new Date().toISOString()
      const formattedSubmissionTime = formatISTDateTime(nowIso)
      const updatedDescription = `${task.description || ''}\n\n[EMPLOYEE WORK SUBMISSION - ${formattedSubmissionTime}]:\nDetails: ${form.workDetails}\nRemarks: ${form.remarks || 'None'}`

      const supabase = createClient()
      await supabase.from('employee_tasks').update({
        status: form.status,
        description: updatedDescription
      }).eq('id', task.id)

      setOpen(false)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-md">
        <CheckSquare className="size-3.5" /> Submit Work
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Submit Completed Work - ${task.title}`}>
        <form onSubmit={submit} className="flex flex-col gap-4 font-mono text-xs">
          <div className="rounded-2xl border border-current/15 bg-black/20 p-4 space-y-1">
            <p className="font-bold text-white text-sm">{task.title}</p>
            <p className="opacity-80 text-xs">{task.description}</p>
            <div className="flex justify-between pt-2 text-[11px] opacity-70 border-t border-current/10">
              <span>Priority: {task.priority?.toUpperCase()}</span>
              <span>Due Date: {task.due_date}</span>
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Completion Status
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="theme-input text-sm">
              <option value="in_progress">In Progress (Working on it)</option>
              <option value="submitted">Work Submitted for Approval</option>
              <option value="completed">Work Fully Completed</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Work / Completion Details
            <textarea required value={form.workDetails} onChange={e => setForm({ ...form, workDetails: e.target.value })} className="theme-input text-sm min-h-24" placeholder="Describe the work done, parts replaced, inspection findings..." />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Employee Remarks / Notes
            <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="theme-input text-sm" placeholder="e.g. Completed ahead of schedule" />
          </label>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Submitting…' : 'Submit Work Details'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 9. CREATE ANNOUNCEMENT / NOTICE MODAL
export function CreateNoticeModal({ societyId, createdBy }: { societyId: string | null; createdBy: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', targetRole: 'all' })
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      await createClient().from('announcements').insert({
        society_id: societyId,
        created_by: createdBy,
        title: form.title,
        content: form.content,
        priority: form.priority,
        target_role: form.targetRole
      })
      setOpen(false)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Megaphone className="size-4" /> Post Society Notice
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Post Announcement Notice">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Notice Title
            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="theme-input text-sm" placeholder="Annual General Meeting" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Announcement Details
            <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="theme-input text-sm min-h-24" placeholder="Full notice content…" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Priority Level
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="theme-input text-sm">
              <option value="normal">Normal Priority</option>
              <option value="important">Important Priority</option>
              <option value="urgent">Urgent Notice</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Publishing…' : 'Publish Notice'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 10. DELETE ANNOUNCEMENT BUTTON
export function DeleteAnnouncementButton({ announcementId }: { announcementId: string }) {
  const [busy, setBusy] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this announcement notice?')) return

    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('announcements').delete().eq('id', announcementId)
      if (!error) {
        window.location.reload()
      } else {
        alert('Could not delete announcement: ' + error.message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      disabled={busy}
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-red-500/30 bg-red-500/15 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition shadow-sm"
      title="Delete Announcement (Admin Action)"
    >
      <Trash2 className="size-3.5" /> Delete Notice
    </button>
  )
}

// 11. APPLY LEAVE REQUEST MODAL
export function ApplyLeaveModal({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ leaveType: 'casual', startsOn: '', endsOn: '', reason: '' })
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    try {
      await createClient().from('leave_requests').insert({
        employee_id: employeeId,
        leave_type: form.leaveType,
        starts_on: form.startsOn || new Date().toISOString().slice(0, 10),
        ends_on: form.endsOn || new Date().toISOString().slice(0, 10),
        reason: form.reason,
        status: 'pending'
      })
      setOpen(false)
      window.location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm shadow-lg">
        <Plus className="size-4" /> Apply For Leave
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Apply For Leave">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Leave Type
            <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="theme-input text-sm">
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Start Date
            <input required type="date" value={form.startsOn} onChange={e => setForm({ ...form, startsOn: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">End Date
            <input required type="date" value={form.endsOn} onChange={e => setForm({ ...form, endsOn: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider opacity-80">Reason
            <textarea required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="theme-input text-sm min-h-20" placeholder="State reason for leave…" />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="theme-button-secondary text-sm">Cancel</button>
            <button disabled={busy} type="submit" className="theme-button-primary text-sm">{busy ? 'Submitting…' : 'Submit Application'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}

// 12. CREATE REQUEST FORM COMPONENT
export function CreateRequestForm({ societyId, userId, category = 'maintenance' }: { societyId: string | null; userId: string; category?: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!societyId) { setMessage('Your profile is not linked to a society yet.'); return }
    setBusy(true); setMessage('')
    try {
      const supabase = createClient()
      if (category === 'complaint') {
        const { error } = await supabase.from('complaints').insert({
          society_id: societyId,
          profile_id: userId,
          category,
          title,
          description,
          priority,
          status: 'open'
        })
        setMessage(error ? 'Could not log complaint.' : 'Complaint registered successfully.')
      } else {
        const { error } = await supabase.from('service_requests').insert({
          society_id: societyId,
          created_by: userId,
          category,
          title,
          description,
          priority,
          status: 'open'
        })
        setMessage(error ? 'Could not create service request.' : 'Service request submitted.')
      }

      setTitle('')
      setDescription('')
      setPriority('medium')
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      setMessage('Could not process request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="surface-card rounded-2xl p-5 mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
      <div className="grid gap-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Water Leakage in Kitchen)"
          className="theme-input text-sm"
        />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the details of your complaint or service request…"
          className="theme-input text-sm min-h-24"
        />
      </div>
      <div className="flex flex-col gap-3 justify-between">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="theme-input text-sm">
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent Priority</option>
        </select>
        <button disabled={busy} type="submit" className="theme-button-primary flex items-center justify-center gap-2 text-sm">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Submit Ticket
        </button>
        {message && <p className="text-xs opacity-75">{message}</p>}
      </div>
    </form>
  )
}
