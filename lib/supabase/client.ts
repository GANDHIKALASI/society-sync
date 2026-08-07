import { createBrowserClient } from '@supabase/ssr'

const realUrl = 'https://makuuukrdrasudwhgmhn.supabase.co'
const realKey = 'sb_publishable_HY5prwhVwoPj6yVYbu-ACQ_DohWOvby'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || realUrl
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || realKey

  return createBrowserClient(
    url,
    key,
    { cookieOptions: { secure: process.env.NODE_ENV === 'production' } },
  )
}
