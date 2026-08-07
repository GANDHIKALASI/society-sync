import { createClient } from '@/lib/supabase/server'

export type Profile = {
  id: string
  full_name: string
  phone: string | null
  role: 'super_admin' | 'resident' | 'employee'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  society_id: string | null
  block?: string
  flat_number?: string
  designation?: string
}

export async function getCurrentProfile() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { user: null, profile: null, supabase }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return { user, profile: profile as Profile | null, supabase }
  } catch {
    return { user: null, profile: null, supabase }
  }
}
