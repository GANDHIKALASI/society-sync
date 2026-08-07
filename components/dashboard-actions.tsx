'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Megaphone, UserCheck, Save } from 'lucide-react'
import { Modal } from '@/components/module-views'

// Export ResidentApprovalActions from module-views
export { ResidentApprovalActions, CreateEmployeeModal, CreateBillModal, CreateVisitorPassModal, PayBillModal, EmployeeAttendanceToggle } from '@/components/module-views'

// EDIT PROFILE FORM COMPONENT
export function EditProfileForm({ profile }: { profile: { id: string; full_name: string; phone: string | null; email: string | null; block?: string | null; flat_number?: string | null; designation?: string | null; role: string } }) {
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
    <form onSubmit={submit} className="surface-card rounded-3xl p-6 sm:p-8 mt-6 flex flex-col gap-5 max-w-xl">
      <h3 className="text-xl font-bold border-b border-current/15 pb-3">Edit Profile Information</h3>

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
        Save Changes
      </button>
    </form>
  )
}

// CREATE COMPLAINT / SERVICE REQUEST FORM
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

// CREATE EMPLOYEE TASK MODAL
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
      <button onClick={loadEmployees} className="theme-button-primary flex items-center gap-2 text-sm">
        <Plus className="size-4" /> Assign New Task
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Assign Employee Task">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Assign To Employee
            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="theme-input text-sm">
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Task Title
            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="theme-input text-sm" placeholder="Inspect Elevator B" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Task Details
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="theme-input text-sm min-h-20" placeholder="Details…" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Due Date
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

// CREATE ANNOUNCEMENT / NOTICE MODAL
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
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm">
        <Megaphone className="size-4" /> Post Society Notice
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Post Announcement Notice">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Notice Title
            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="theme-input text-sm" placeholder="Annual General Meeting" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Announcement Details
            <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="theme-input text-sm min-h-24" placeholder="Full notice content…" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Priority Level
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

// APPLY LEAVE REQUEST MODAL (Employee)
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
      <button onClick={() => setOpen(true)} className="theme-button-primary flex items-center gap-2 text-sm">
        <Plus className="size-4" /> Apply For Leave
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Apply For Leave">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Leave Type
            <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="theme-input text-sm">
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Start Date
            <input required type="date" value={form.startsOn} onChange={e => setForm({ ...form, startsOn: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">End Date
            <input required type="date" value={form.endsOn} onChange={e => setForm({ ...form, endsOn: e.target.value })} className="theme-input text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase">Reason
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
