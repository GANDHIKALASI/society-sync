import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { DashboardShell, type DashboardRole } from '@/components/dashboard-shell'
import { CommunityChat } from '@/components/community-chat'

export default async function CommunityChatPage() {
  const { profile } = await getCurrentProfile()

  if (!profile) redirect('/auth/login')
  if (profile.status !== 'approved') redirect('/auth/pending')

  const role = profile.role as DashboardRole

  return (
    <DashboardShell role={role} name={profile.full_name}>
      <div className="mx-auto max-w-7xl">
        <CommunityChat currentProfile={profile as any} />
      </div>
    </DashboardShell>
  )
}
