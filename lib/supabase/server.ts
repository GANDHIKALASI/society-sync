import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const realUrl = 'https://makuuukrdrasudwhgmhn.supabase.co'
const realKey = 'sb_publishable_HY5prwhVwoPj6yVYbu-ACQ_DohWOvby'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || realUrl
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || realKey

  return createServerClient(
    url,
    key,
    {
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Cookie writes from server components are handled by the proxy.
          }
        },
      },
    },
  )
}
