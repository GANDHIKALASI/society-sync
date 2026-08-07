import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const realUrl = 'https://makuuukrdrasudwhgmhn.supabase.co'
const realKey = 'sb_publishable_HY5prwhVwoPj6yVYbu-ACQ_DohWOvby'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || realUrl
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || realKey

  try {
    const supabase = createServerClient(
      url,
      key,
      {
        cookieOptions: { secure: process.env.NODE_ENV === 'production' },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      },
    )
    await supabase.auth.getUser()
  } catch {
    // Session check skipped if network issue
  }
  return response
}
