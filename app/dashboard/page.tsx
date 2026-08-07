import { redirect } from 'next/navigation'
import { ArrowUpRight, Users, Wrench, ShieldAlert, CheckSquare, Calendar, DollarSign, Building2, Megaphone } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth'
import { DashboardShell, type DashboardRole } from '@/components/dashboard-shell'
import Link from 'next/link'

export default async function DashboardPage() {
  const { profile, supabase } = await getCurrentProfile()

  if (!profile) redirect('/auth/login')
  if (profile.status !== 'approved') redirect('/auth/pending')

  const role = profile.role as DashboardRole

  // Always use "Gandhi Kalasi" for Super Admin greeting if email is present
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

  try {
    const [{ count: rCount }, { count: pCount }, { count: tCount }, { count: eCount }, { data: annData }, { data: bData }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident').eq('status', 'approved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident').eq('status', 'pending'),
      supabase.from('service_requests').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      role === 'resident' ? supabase.from('maintenance_bills').select('*').eq('profile_id', profile.id).eq('status', 'pending') : Promise.resolve({ data: [] })
    ])

    residentCount = rCount || 0
    pendingResidents = pCount || 0
    openTickets = tCount || 0
    employeeCount = eCount || 0
    recentAnnouncements = annData || []
    userBills = bData || []
  } catch {
    // Safe fallbacks
  }

  return (
    <DashboardShell role={role} name={profile.full_name}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] opacity-75">{role.replace('_', ' ')} OVERVIEW</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">
              Welcome, {greetingName}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 opacity-80">
              Live society operation indicators, tickets, and operational updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'super_admin' && (
              <Link
                href="/dashboard/residents"
                className="theme-button-primary inline-flex items-center gap-2 text-sm shadow-lg"
              >
                Manage Approvals {pendingResidents ? `(${pendingResidents})` : ''} <ArrowUpRight className="size-4" />
              </Link>
            )}

            {role === 'resident' && (
              <Link
                href="/dashboard/service-requests"
                className="theme-button-primary inline-flex items-center gap-2 text-sm shadow-lg"
              >
                Raise Request <ArrowUpRight className="size-4" />
              </Link>
            )}

            {role === 'employee' && (
              <Link
                href="/dashboard/assigned-tasks"
                className="theme-button-primary inline-flex items-center gap-2 text-sm shadow-lg"
              >
                View Tasks <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {role === 'super_admin' && (
            <>
              <Stat icon={Users} label="Approved Residents" value={String(residentCount)} />
              <Stat icon={ShieldAlert} label="Pending Approvals" value={String(pendingResidents)} highlight={Boolean(pendingResidents)} />
              <Stat icon={Wrench} label="Open Service Tickets" value={String(openTickets)} />
              <Stat icon={Building2} label="Active Employees" value={String(employeeCount)} />
            </>
          )}

          {role === 'resident' && (
            <>
              <Stat icon={Building2} label="Flat Assignment" value={profile.flat_number || 'Registered'} />
              <Stat icon={DollarSign} label="Pending Bills" value={String(userBills.length)} highlight={Boolean(userBills.length)} />
              <Stat icon={Wrench} label="Active Tickets" value={String(openTickets)} />
              <Stat icon={ShieldAlert} label="Account Status" value="Approved" />
            </>
          )}

          {role === 'employee' && (
            <>
              <Stat icon={CheckSquare} label="Designation" value={profile.designation || 'Staff'} />
              <Stat icon={Wrench} label="Open Tickets" value={String(openTickets)} />
              <Stat icon={Calendar} label="Work Shift" value="On Duty" />
              <Stat icon={Users} label="Society Code" value="SSGR01" />
            </>
          )}
        </div>

        {/* DASHBOARD CONTENT GRID */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <div className="surface-card rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-current/15 pb-4">
                <div>
                  <h2 className="text-xl font-bold">Society Notice Board</h2>
                  <p className="mt-1 text-xs opacity-75">Latest announcements posted by administration.</p>
                </div>
                <Megaphone className="size-5 opacity-75" />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {recentAnnouncements.length ? (
                  recentAnnouncements.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-current/15 bg-black/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider font-bold opacity-80">{item.priority} notice</span>
                        <span className="text-[11px] opacity-60">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed opacity-80">{item.content}</p>
                    </div>
                  ))
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

          <div className="rounded-3xl bg-[var(--primary)] text-[var(--secondary)] p-7 flex flex-col justify-between shadow-xl">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] font-bold opacity-80">CONNECTED WORKSPACE</p>
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

            <div className="mt-8">
              <Link
                href={role === 'super_admin' ? '/dashboard/residents' : role === 'resident' ? '/dashboard/visitor-pass' : '/dashboard/attendance'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--secondary)] text-[var(--primary)] px-5 py-3 text-sm font-bold shadow-md hover:opacity-90"
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

function Stat({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`surface-card rounded-2xl p-5 ${highlight ? 'border-amber-400/50 bg-amber-500/10' : ''}`}>
      <div className="flex items-center justify-between">
        <Icon className="size-5 opacity-75" />
        <span className="text-3xl font-extrabold tracking-tight">{value}</span>
      </div>
      <p className="mt-6 text-xs font-mono uppercase tracking-wider opacity-75">{label}</p>
    </div>
  )
}
