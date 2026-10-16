import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const realUrl = 'https://makuuukrdrasudwhgmhn.supabase.co'
const realKey = 'sb_publishable_HY5prwhVwoPj6yVYbu-ACQ_DohWOvby'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // If there are no Supabase auth cookies, skip remote network call.
  // This prevents unauthenticated requests (like homepage/landing page) from hanging or timing out.
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  if (!hasSupabaseCookie) {
    return response
  }

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

    let timer: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Supabase auth timeout')), 2500)
    })

    try {
      await Promise.race([supabase.auth.getUser(), timeoutPromise])
    } finally {
      if (timer) clearTimeout(timer)
    }
  } catch {
    // Session check skipped if network issue or timeout occurred.
    // Downstream Server Components will handle auth.
  }
  return response
}
