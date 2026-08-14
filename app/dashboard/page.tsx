import { redirect } from 'next/navigation'
import { ArrowUpRight, Users, Wrench, ShieldAlert, CheckSquare, Calendar, DollarSign, Building2, Megaphone, Clock, Sparkles, CreditCard, AlertCircle } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { DashboardShell, type DashboardRole } from '@/components/dashboard-shell'
import { formatISTDateTime, formatISTDate } from '@/lib/time'
import { PayBillModal } from '@/components/dashboard-actions'
import Link from 'next/link'

export default async function DashboardPage() {
  const { profile, supabase } = await getCurrentProfile()

  if (!profile) redirect('/auth/login')
  if (profile.status === 'banned') redirect('/auth/login')
  if (profile.status !== 'approved') redirect('/auth/pending')

  const role = profile.role as DashboardRole

  const greetingName = (profile.full_name && !profile.full_name.includes('@'))
    ? profile.full_name.split(' ')[0]
    : (role === 'super_admin' ? 'Gandhi Kalasi' : 'Member')

  // Fetch counts or default safely
  let residentCount = 0
  let pendingResidents = 0
  let openTickets = 0
  let employeeCount = 0
  let recentAnnouncements: any[] = []
  let userBills: any[] = []
  let employeeTasks: any[] = []

  try {
    const [{ count: rCount }, { count: pCount }, { count: tCount }, { count: eCount }, { data: annData }, { data: bData }, { data: taskData }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident').eq('status', 'approved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident').eq('status', 'pending'),
      supabase.from('service_requests').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(4),
      role === 'resident' ? supabase.from('maintenance_bills').select('*').eq('profile_id', profile.id).eq('status', 'pending') : Promise.resolve({ data: [] }),
      role === 'employee' ? supabase.from('employee_tasks').select('*').eq('employee_id', profile.id).neq('status', 'completed') : Promise.resolve({ data: [] })
    ])

    residentCount = rCount || 0
    pendingResidents = pCount || 0
    openTickets = tCount || 0
    employeeCount = eCount || 0
    recentAnnouncements = annData || []
    userBills = bData || []
    employeeTasks = taskData || []
  } catch {
    // Network fallback
  }

  return (
    <DashboardShell role={role} name={profile.full_name}>
      <div className="mx-auto max-w-7xl">

        {/* PERSONAL RESIDENT MAINTENANCE PAYMENT DUE ALERT CARD (TARGETED ONLY TO ASSIGNED RESIDENT) */}
        {role === 'resident' && userBills.length > 0 && (
          <div className="mb-6 rounded-3xl border-2 border-amber-400/40 bg-amber-500/15 p-6 shadow-2xl backdrop-blur-2xl animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-400 text-black font-extrabold shadow-lg">
                  <CreditCard className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-amber-300">Maintenance Payment Due</h3>
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-200 uppercase border border-amber-400/30">
                      Personal Reminder
                    </span>
                  </div>
                  <p className="mt-1 text-xs opacity-90 font-mono">
                    {userBills[0].title} ({userBills[0].period}) • Due Date: {userBills[0].due_date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-3xl font-extrabold text-white">₹{userBills[0].amount.toLocaleString('en-IN')}</p>
                <PayBillModal
                  billId={userBills[0].id}
                  profileId={profile.id}
                  amount={userBills[0].amount}
                  flatNumber={userBills[0].flat_number || profile.flat_number || 'A-101'}
                />
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL EMPLOYEE PENDING TASKS ALERT CARD */}
        {role === 'employee' && employeeTasks.length > 0 && (
          <div className="mb-6 rounded-3xl border-2 border-sky-400/40 bg-sky-500/15 p-6 shadow-2xl backdrop-blur-2xl animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-400 text-black font-extrabold shadow-lg">
                  <CheckSquare className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-sky-300">Pending Duty Tasks ({employeeTasks.length})</h3>
                    <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-xs font-mono font-bold text-sky-200 uppercase border border-sky-400/30">
                      Assigned Work
                    </span>
                  </div>
                  <p className="mt-1 text-xs opacity-90 font-mono">
                    Next Task: {employeeTasks[0].title} • Due: {employeeTasks[0].due_date || 'Today'}
                  </p>
                </div>
              </div>

              <Link href="/dashboard/assigned-tasks" className="theme-button-primary flex items-center gap-2 text-xs py-2.5 px-4 shadow-lg">
                View & Submit Work <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        )}

        {/* HERO WELCOME BANNER */}
        <div className="surface-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="rounded-full border border-current/20 bg-black/10 px-3 py-1 font-mono text-xs uppercase tracking-widest opacity-80">
              {role.replace('_', ' ')} WORKSPACE
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {greetingName}.
            </h1>
            <p className="mt-2 text-sm opacity-80 max-w-xl">
              {role === 'super_admin'
                ? 'SocietySync operating layer active. Monitor resident registrations, employee duties, and billing ledgers.'
                : role === 'resident'
                ? 'Your residential portal is connected. Pay maintenance bills, issue digital guest passes, and access services.'
                : 'Your staff portal is active. Check in for shift attendance, execute work tasks, and report completion.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={role === 'super_admin' ? '/dashboard/residents' : role === 'resident' ? '/dashboard/visitor-pass' : '/dashboard/attendance'}
              className="theme-button-primary inline-flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
            >
              Primary Actions <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* CLICKABLE DASHBOARD STATS CARDS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat href="/dashboard/residents" icon={Users} label="Approved Residents" value={residentCount.toString()} />
          <Stat href="/dashboard/residents" icon={ShieldAlert} label="Pending Approvals" value={pendingResidents.toString()} highlight={pendingResidents > 0} />
          <Stat href="/dashboard/service-requests" icon={Wrench} label="Open Service Tickets" value={openTickets.toString()} />
          <Stat href="/dashboard/employees" icon={CheckSquare} label="Active Staff Members" value={employeeCount.toString()} />
        </section>

        {/* DASHBOARD CONTENT GRID */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          {/* NOTICE BOARD SECTION */}
          <div className="surface-card rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-current/15 pb-4">
                <div>
                  <h2 className="text-xl font-bold">Society Notice Board</h2>
                  <p className="mt-1 text-xs opacity-75">Latest announcements posted by administration sorted by newest first.</p>
                </div>
                <Megaphone className="size-5 opacity-75" />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {recentAnnouncements.length ? (
                  recentAnnouncements.map((item) => {
                    return (
                      <Link key={item.id} href="/dashboard/announcements" className="rounded-2xl border border-current/15 bg-black/10 p-4 transition hover:bg-black/20 block">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-mono uppercase tracking-wider font-bold opacity-90 px-2.5 py-0.5 rounded-full border border-current/20 bg-black/20">
                            {item.target_role || item.priority || 'Notice'}
                          </span>
                          <span className="text-[11px] font-mono opacity-70">
                            {formatISTDateTime(item.created_at)}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed opacity-80">{item.content}</p>
                        <div className="mt-3 flex items-center justify-between text-[11px] font-mono opacity-60">
                          <span>Created by: Administration</span>
                          <span>Category: {item.target_role === 'resident' ? 'Resident Notice' : item.target_role === 'employee' ? 'Staff Notice' : 'General Announcement'}</span>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-current/20 text-center">
                    <p className="text-sm opacity-75">No announcements posted yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Link href="/dashboard/announcements" className="text-xs font-semibold hover:underline flex items-center gap-1">
                View all announcements <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* CONNECTED WORKSPACE CARD */}
          <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl transition duration-300 hover:scale-[1.01] flex flex-col justify-between border-opacity-30">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-current/10 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-current/30 bg-black/10 px-3.5 py-1 font-mono text-xs uppercase tracking-[0.2em] font-bold">
                <Sparkles className="size-3.5" /> Connected Workspace
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.04em]">
                {role === 'super_admin' ? 'Keep operations seamless.' : role === 'resident' ? 'Everything for your flat.' : 'Duty & Task Portal.'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed opacity-85">
                {role === 'super_admin'
                  ? 'Approve resident requests, track staff attendance, issue maintenance invoices, and maintain society compliance.'
                  : role === 'resident'
                  ? 'Issue digital visitor passes, pay maintenance fees, track service requests, and stay informed with society notices.'
                  : 'Check in for daily attendance, complete assigned work orders, and log resolution updates for residents.'}
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <Link
                href={role === 'super_admin' ? '/dashboard/residents' : role === 'resident' ? '/dashboard/visitor-pass' : '/dashboard/attendance'}
                className="theme-button-primary inline-flex w-full items-center justify-center gap-2 py-3 text-sm font-bold shadow-xl transition hover:opacity-90"
              >
                Go to Primary Module <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function Stat({ href, icon: Icon, label, value, highlight = false }: { href: string; icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`surface-card rounded-2xl p-5 transition duration-200 hover:scale-[1.02] hover:shadow-xl block ${
        highlight ? 'border-amber-400/50 bg-amber-500/10' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <Icon className="size-5 opacity-75" />
        <span className="text-3xl font-extrabold tracking-tight">{value}</span>
      </div>
      <p className="mt-6 text-xs font-mono uppercase tracking-wider opacity-75 flex items-center justify-between">
        <span>{label}</span>
        <ArrowUpRight className="size-3.5 opacity-50" />
      </p>
    </Link>
  )
}
