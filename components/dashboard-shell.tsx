'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, X, Building2, User, FileText, CheckSquare, Calendar, AlertCircle, Shield, Wrench, ShieldCheck, Car, Dog, KeyRound, CreditCard, DollarSign, Users, Briefcase, Clock, FileCheck, Layers, Megaphone, Folder, BarChart3, Activity, Settings, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DashboardRole = 'super_admin' | 'resident' | 'employee'

interface NavItem {
  label: string
  href: string
  icon: any
}

const superAdminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Building2 },
  { label: 'Residents', href: '/dashboard/residents', icon: Users },
  { label: 'Employees', href: '/dashboard/employees', icon: Briefcase },
  { label: 'Blocks', href: '/dashboard/blocks', icon: Layers },
  { label: 'Flats', href: '/dashboard/flats', icon: Building2 },
  { label: 'Owners', href: '/dashboard/owners', icon: User },
  { label: 'Tenants', href: '/dashboard/tenants', icon: Users },
  { label: 'Visitors', href: '/dashboard/visitors', icon: KeyRound },
  { label: 'Parking', href: '/dashboard/parking', icon: Car },
  { label: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
  { label: 'Pets', href: '/dashboard/pets', icon: Dog },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: DollarSign },
  { label: 'Bills', href: '/dashboard/bills', icon: CreditCard },
  { label: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { label: 'Receipts', href: '/dashboard/receipts', icon: FileCheck },
  { label: 'Complaints', href: '/dashboard/complaints', icon: AlertCircle },
  { label: 'Service Requests', href: '/dashboard/service-requests', icon: Wrench },
  { label: 'Employee Tasks', href: '/dashboard/employee-tasks', icon: CheckSquare },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Leave Approval', href: '/dashboard/leave-approval', icon: FileText },
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Documents', href: '/dashboard/documents', icon: Folder },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'Activity Logs', href: '/dashboard/activity-logs', icon: Activity },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
]

const residentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Building2 },
  { label: 'My Profile', href: '/dashboard/my-profile', icon: User },
  { label: 'My Flat', href: '/dashboard/my-flat', icon: Building2 },
  { label: 'Family Members', href: '/dashboard/family-members', icon: Users },
  { label: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
  { label: 'Pets', href: '/dashboard/pets', icon: Dog },
  { label: 'Visitor Pass', href: '/dashboard/visitor-pass', icon: KeyRound },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: DollarSign },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Receipts', href: '/dashboard/receipts', icon: FileCheck },
  { label: 'Complaints', href: '/dashboard/complaints', icon: AlertCircle },
  { label: 'Service Requests', href: '/dashboard/service-requests', icon: Wrench },
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Documents', href: '/dashboard/documents', icon: Folder },
  { label: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const employeeNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Building2 },
  { label: 'Assigned Tasks', href: '/dashboard/assigned-tasks', icon: CheckSquare },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Leave Request', href: '/dashboard/leave-request', icon: FileText },
  { label: 'Complaints', href: '/dashboard/complaints', icon: AlertCircle },
  { label: 'Service Requests', href: '/dashboard/service-requests', icon: Wrench },
  { label: 'Documents', href: '/dashboard/documents', icon: Folder },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const roleNavMap: Record<DashboardRole, NavItem[]> = {
  super_admin: superAdminNav,
  resident: residentNav,
  employee: employeeNav,
}

export function DashboardShell({ role, name, children }: { role: DashboardRole; name: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const theme = role === 'super_admin' ? 'admin' : role
  const navItems = roleNavMap[role] || superAdminNav

  // Always use "Gandhi Kalasi" for Super Admin profile/header if email is present
  const displayName = (name && !name.includes('@')) ? name : (role === 'super_admin' ? 'Gandhi Kalasi' : name || 'Member')

  async function logout() {
    try {
      await createClient().auth.signOut()
    } catch {
      // Redirect even if session expired
    }
    window.location.assign('/')
  }

  return (
    <div className={`dashboard-theme ${theme} min-h-screen font-sans`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-current/15 bg-[var(--secondary)] text-[var(--primary)] px-5 py-6 shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="font-mono text-base font-bold uppercase tracking-[0.25em]">
            Society<span className="opacity-90">Sync</span>
          </Link>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-mono uppercase tracking-[0.18em]">
          <ShieldCheck className="size-4" />
          <span>{role.replace('_', ' ')}</span>
        </div>

        <nav className="mt-4 flex max-h-[calc(100vh-200px)] flex-col gap-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[var(--primary)] text-[var(--secondary)] font-bold shadow-md'
                    : 'opacity-75 hover:bg-white/10 hover:opacity-100'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-6 left-5 right-5 flex items-center justify-center gap-2 rounded-xl border border-current/20 py-2.5 text-sm font-semibold opacity-80 hover:bg-white/10 hover:opacity-100"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-current/15 bg-[var(--secondary)]/90 px-5 text-[var(--primary)] shadow-sm backdrop-blur-xl sm:px-8">
          <button className="rounded-xl p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>

          <div className="hidden text-sm font-mono uppercase tracking-[0.2em] opacity-75 lg:block">
            SocietySync / {role.replace('_', ' ')} workspace
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/dashboard/notifications"
              className="relative rounded-xl border border-current/15 p-2 opacity-80 hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--primary)]" />
            </Link>

            <div className="flex items-center gap-3 border-l border-current/20 pl-4">
              <div className="flex size-9 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-[var(--secondary)] shadow-sm">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] opacity-70">{role.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="hidden size-4 opacity-60 sm:block" />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
