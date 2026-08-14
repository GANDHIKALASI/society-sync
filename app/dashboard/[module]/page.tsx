import { notFound, redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { DashboardShell, type DashboardRole } from '@/components/dashboard-shell'
import {
  ResidentApprovalActions,
  CreateEmployeeModal,
  CreateBillModal,
  CreateVisitorPassModal,
  VisitorPassQRModal,
  PayBillModal,
  EmployeeAttendanceToggle,
  CreateRequestForm,
  CreateTaskModal,
  SubmitTaskModal,
  CreateNoticeModal,
  DeleteAnnouncementButton,
  ApplyLeaveModal,
  EditProfileForm,
  ResidentProfileModal,
  EmployeeProfileModal,
  BanUnbanUserButton,
  CreateSalaryModal,
  PayslipModal,
  SendPaymentNoticeModal,
  OfficialReceiptModal
} from '@/components/dashboard-actions'
import { formatISTDateTime, formatISTDate } from '@/lib/time'
import Link from 'next/link'

const labels: Record<string, string> = {
  residents: 'Residents Directory',
  employees: 'Employee Management',
  salary: 'Employee Salary Management',
  blocks: 'Society Blocks & Towers',
  flats: 'Flats & Apartments',
  owners: 'Property Owners',
  tenants: 'Registered Tenants',
  visitors: 'Visitor Pass Log',
  parking: 'Parking Slot Allocation',
  vehicles: 'Registered Vehicles',
  pets: 'Registered Pets',
  maintenance: 'Maintenance Billing',
  payments: 'Payment Transactions',
  receipts: 'Payment Receipts',
  complaints: 'Resident Complaints',
  'service-requests': 'Service Requests',
  'employee-tasks': 'Employee Tasks',
  attendance: 'Employee Attendance',
  'leave-approval': 'Leave Applications',
  'leave-request': 'My Leave Applications',
  leave: 'Leave Applications',
  events: 'Society Events',
  announcements: 'Notice Board Announcements',
  documents: 'Document Repository',
  reports: 'Reports & Analytics',
  'activity-logs': 'System Activity Audit Logs',
  settings: 'Society Settings',
  profile: 'My Profile',
  'my-flat': 'My Flat Details',
  'my-profile': 'My Resident Profile',
  'family-members': 'Family Members',
  family: 'Family Members',
  'visitor-pass': 'Digital Visitor Passes',
  'assigned-tasks': 'My Assigned Tasks',
  tasks: 'Assigned Tasks',
  chat: 'Society Community Chat',
}

const allowedByRole: Record<DashboardRole, string[]> = {
  super_admin: [
    'residents', 'employees', 'salary', 'blocks', 'flats', 'owners', 'tenants', 'visitors',
    'parking', 'vehicles', 'pets', 'maintenance', 'payments', 'receipts',
    'complaints', 'service-requests', 'employee-tasks', 'attendance', 'leave-approval',
    'events', 'announcements', 'documents', 'reports', 'activity-logs',
    'settings', 'profile'
  ],
  resident: [
    'my-flat', 'my-profile', 'family-members', 'family', 'vehicles', 'pets',
    'maintenance', 'payments', 'receipts', 'complaints', 'service-requests',
    'visitor-pass', 'visitors', 'events', 'documents', 'announcements',
    'chat', 'settings'
  ],
  employee: [
    'assigned-tasks', 'tasks', 'attendance', 'leave-request', 'leave',
    'complaints', 'service-requests', 'documents', 'chat',
    'profile', 'settings'
  ],
}

export default async function DashboardModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params
  const title = labels[module]
  if (!title) notFound()

  const { profile, supabase } = await getCurrentProfile()

  if (!profile) redirect('/auth/login')
  if (profile.status === 'banned') redirect('/auth/login')
  if (profile.status !== 'approved') redirect('/auth/pending')

  const role = profile.role as DashboardRole
  if (!allowedByRole[role]?.includes(module)) redirect('/dashboard')

  let records: any[] = []

  try {
    if (module === 'residents') {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'resident').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'owners') {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'resident').eq('occupancy_type', 'owner').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'tenants') {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'resident').eq('occupancy_type', 'tenant').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'employees' || module === 'salary') {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'employee').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'blocks') {
      const { data } = await supabase.from('blocks').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'flats') {
      const { data } = await supabase.from('flats').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'service-requests') {
      let query = supabase.from('service_requests').select('*').order('created_at', { ascending: false })
      if (role === 'resident') query = query.eq('created_by', profile.id)
      if (role === 'employee') query = query.eq('assigned_to', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'complaints') {
      let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })
      if (role === 'resident') query = query.eq('profile_id', profile.id)
      if (role === 'employee') query = query.eq('assigned_employee_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'visitor-pass' || module === 'visitors') {
      let query = supabase.from('visitor_passes').select('*').order('created_at', { ascending: false })
      if (role === 'resident') query = query.eq('resident_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'maintenance') {
      let query = supabase.from('maintenance_bills').select('*').order('created_at', { ascending: false })
      if (role === 'resident') query = query.eq('profile_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'payments') {
      let query = supabase.from('payments').select('*').order('created_at', { ascending: false })
      if (role === 'resident') query = query.eq('profile_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'receipts') {
      let query = supabase.from('receipts').select('*').order('created_at', { ascending: false })
      if (role === 'resident') query = query.eq('profile_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'employee-tasks' || module === 'assigned-tasks' || module === 'tasks') {
      let query = supabase.from('employee_tasks').select('*').order('created_at', { ascending: false })
      if (role === 'employee') query = query.eq('employee_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'attendance') {
      let query = supabase.from('attendance').select('*').order('attendance_date', { ascending: false })
      if (role === 'employee') query = query.eq('employee_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'leave-approval' || module === 'leave-request' || module === 'leave') {
      let query = supabase.from('leave_requests').select('*').order('created_at', { ascending: false })
      if (role === 'employee') query = query.eq('employee_id', profile.id)
      const { data } = await query
      records = data || []
    } else if (module === 'announcements') {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'events') {
      const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'activity-logs') {
      const { data } = await supabase.from('approval_events').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'documents') {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'vehicles') {
      const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'pets') {
      const { data } = await supabase.from('pets').select('*').order('created_at', { ascending: false })
      records = data || []
    } else if (module === 'parking') {
      const { data } = await supabase.from('parking_slots').select('*').order('created_at', { ascending: false })
      records = data || []
    }
  } catch {
    // Network fallback
  }

  const isProfilePage = module === 'profile' || module === 'my-profile'

  return (
    <DashboardShell role={role} name={profile.full_name}>
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] opacity-75">{role.replace('_', ' ')} WORKSPACE</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 opacity-80">
              {isProfilePage ? 'Manage your account details, photo, and preferences.' : `Live records and management tools for ${title.toLowerCase()}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isProfilePage && (
              <span className="rounded-xl border border-current/15 bg-black/10 px-3 py-1.5 font-mono text-xs opacity-80">
                {records.length} record{records.length === 1 ? '' : 's'}
              </span>
            )}

            {/* ACTION MODAL BUTTONS */}
            {role === 'super_admin' && module === 'employees' && (
              <CreateEmployeeModal societyId={profile.society_id} />
            )}

            {role === 'super_admin' && module === 'salary' && (
              <CreateSalaryModal societyId={profile.society_id} />
            )}

            {role === 'super_admin' && module === 'maintenance' && (
              <CreateBillModal societyId={profile.society_id} />
            )}

            {role === 'super_admin' && module === 'employee-tasks' && (
              <CreateTaskModal societyId={profile.society_id} assignedBy={profile.id} />
            )}

            {role === 'super_admin' && module === 'announcements' && (
              <CreateNoticeModal societyId={profile.society_id} createdBy={profile.id} />
            )}

            {role === 'resident' && module === 'visitor-pass' && (
              <CreateVisitorPassModal societyId={profile.society_id} residentId={profile.id} />
            )}

            {role === 'employee' && module === 'attendance' && (
              <EmployeeAttendanceToggle employeeId={profile.id} />
            )}

            {role === 'employee' && (module === 'leave-request' || module === 'leave') && (
              <ApplyLeaveModal employeeId={profile.id} />
            )}
          </div>
        </div>

        {/* FORMS SECTION FOR PROFILE EDIT & TICKETS */}
        {isProfilePage ? (
          <EditProfileForm profile={profile} />
        ) : (
          <>
            {role === 'resident' && module === 'complaints' && (
              <CreateRequestForm societyId={profile.society_id} userId={profile.id} category="complaint" />
            )}

            {role === 'resident' && module === 'service-requests' && (
              <CreateRequestForm societyId={profile.society_id} userId={profile.id} category="service" />
            )}

            {/* DATA RECORDS SECTION WITH GLASSMORPHISM */}
            <section className="mt-8 surface-card rounded-3xl p-6 sm:p-8">
              {records.length > 0 ? (
                <div className="grid gap-3">
                  {records.map((rec: any) => (
                    <div key={rec.id} className="rounded-2xl border border-current/15 bg-black/10 p-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center transition hover:bg-black/20">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="font-bold text-base">
                            {rec.full_name || rec.name || rec.title || rec.visitor_name || rec.reason || rec.receipt_number || rec.flat_number || rec.vehicle_number || rec.pet_name || 'Record Entry'}
                          </h2>
                          {rec.status && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              rec.status === 'approved' || rec.status === 'completed' || rec.status === 'paid' || rec.status === 'present' || rec.status === 'occupied'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : rec.status === 'pending' || rec.status === 'open' || rec.status === 'in_progress' || rec.status === 'submitted' || rec.status === 'vacant'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {rec.status.replace('_', ' ')}
                            </span>
                          )}
                          {rec.occupancy_type && (
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-mono font-bold uppercase bg-current/10 border border-current/20">
                              {rec.occupancy_type}
                            </span>
                          )}
                          {rec.priority && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-amber-500/30 bg-amber-500/10 text-amber-300">
                              {rec.priority} Priority
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm opacity-80 whitespace-pre-line">
                          {rec.email || rec.description || rec.content || rec.purpose || rec.phone || (rec.amount ? `Amount: ₹${rec.amount}` : rec.breed ? `Breed: ${rec.breed}` : '')}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-mono opacity-70">
                          {rec.flat_number && <span>Flat: {rec.flat_number}</span>}
                          {rec.block && <span>Block: {rec.block}</span>}
                          {rec.block_name && <span>Block: {rec.block_name}</span>}
                          {rec.designation && <span>Designation: {rec.designation}</span>}
                          {rec.pass_code && <span className="font-bold text-amber-300">Pass Code: {rec.pass_code}</span>}
                          {rec.due_date && <span>Due Date: {rec.due_date}</span>}
                          {rec.created_at && <span>Timestamp: {formatISTDateTime(rec.created_at)}</span>}
                          {rec.check_in && <span>Check In: {formatISTDateTime(rec.check_in)}</span>}
                          {rec.check_out && <span>Check Out: {formatISTDateTime(rec.check_out)}</span>}
                          {rec.total_hours && <span className="font-bold text-emerald-300">Working Hours: {rec.total_hours}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* EMPLOYEE SUBMIT WORK MODAL */}
                        {role === 'employee' && (module === 'assigned-tasks' || module === 'tasks' || module === 'employee-tasks') && rec.status !== 'completed' && (
                          <SubmitTaskModal task={rec} />
                        )}

                        {/* RESIDENT DETAILED PROFILE MODAL */}
                        {(module === 'residents' || module === 'owners' || module === 'tenants') && (
                          <ResidentProfileModal profile={rec} />
                        )}

                        {/* EMPLOYEE DETAILED PROFILE MODAL */}
                        {(module === 'employees' || module === 'salary') && (
                          <EmployeeProfileModal employee={rec} />
                        )}

                        {/* BAN / UNBAN CONTROLS */}
                        {role === 'super_admin' && (module === 'residents' || module === 'owners' || module === 'tenants') && (
                          <ResidentApprovalActions profileId={rec.id} currentStatus={rec.status} />
                        )}

                        {role === 'super_admin' && (module === 'employees' || module === 'salary') && rec.status !== 'pending' && (
                          <BanUnbanUserButton profileId={rec.id} currentStatus={rec.status} role="employee" />
                        )}

                        {/* VISITOR PASS QR MODAL */}
                        {(module === 'visitor-pass' || module === 'visitors') && (
                          <VisitorPassQRModal pass={rec} />
                        )}

                        {/* SALARY PAYSLIP MODAL */}
                        {module === 'salary' && (
                          <PayslipModal record={rec} />
                        )}

                        {/* PAYMENT NOTICE REMINDER MODAL */}
                        {role === 'super_admin' && module === 'maintenance' && rec.status === 'pending' && (
                          <SendPaymentNoticeModal bill={rec} />
                        )}

                        {/* PAYMENT RECEIPT MODAL */}
                        {module === 'receipts' && (
                          <OfficialReceiptModal payment={rec} />
                        )}

                        {/* DELETE ANNOUNCEMENT BUTTON */}
                        {role === 'super_admin' && module === 'announcements' && (
                          <DeleteAnnouncementButton announcementId={rec.id} />
                        )}

                        {/* RESIDENT PAY BILL MODAL */}
                        {role === 'resident' && module === 'maintenance' && rec.status === 'pending' && (
                          <PayBillModal
                            billId={rec.id}
                            profileId={profile.id}
                            amount={rec.amount}
                            flatNumber={rec.flat_number || profile.flat_number || 'A-101'}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-current/20 text-center p-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest opacity-70">Workspace Active</p>
                    <h3 className="mt-2 text-2xl font-bold">No records found in {title}.</h3>
                    <p className="mt-2 max-w-md text-sm opacity-75">
                      Records will populate automatically as users and administrators perform actions.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
