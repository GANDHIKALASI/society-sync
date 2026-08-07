'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, LockKeyhole, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.')
      setBusy(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: updateErr } = await supabase.auth.updateUser({ password })

      if (updateErr) {
        setError(updateErr.message || 'Could not update password. Link may have expired.')
        setBusy(false)
        return
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to set new password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#004741] px-5 py-10 text-[#F0EDE4] sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,237,228,0.15),transparent_40%)]" />
      <Link href="/" className="absolute left-6 top-6 z-10 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]/80 hover:text-[#F0EDE4]">
        SocietySync
      </Link>

      <section className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-[#F0EDE4]/20 bg-[#F0EDE4]/10 p-8 text-[#F0EDE4] shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F0EDE4]/30 bg-[#F0EDE4]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]">
          <ShieldCheck className="size-3.5" /> Security Portal
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">Set New Password.</h1>
        <p className="mt-2 text-sm leading-6 text-[#F0EDE4]/70">
          Enter your new password below to update your account access.
        </p>

        {success ? (
          <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/20 p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-emerald-300" />
            <h3 className="mt-3 text-lg font-bold text-emerald-100">Password Reset Complete!</h3>
            <p className="mt-2 text-xs leading-relaxed text-emerald-200">
              Your account password has been updated successfully. You can now log in using your new credentials.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F0EDE4] px-6 text-xs font-bold text-[#004741] transition hover:bg-white"
            >
              Continue to Sign In <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#F0EDE4]/70">
              New Password
              <div className="flex items-center gap-3 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 focus-within:border-[#F0EDE4]">
                <LockKeyhole className="size-4 text-[#F0EDE4]/60" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#F0EDE4] outline-none placeholder:text-[#F0EDE4]/35"
                  placeholder="••••••••"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#F0EDE4]/70">
              Confirm New Password
              <div className="flex items-center gap-3 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 focus-within:border-[#F0EDE4]">
                <LockKeyhole className="size-4 text-[#F0EDE4]/60" />
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#F0EDE4] outline-none placeholder:text-[#F0EDE4]/35"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/15 p-3.5 text-xs font-medium text-red-200 leading-relaxed">
                {error}
              </div>
            )}

            <button
              disabled={busy}
              type="submit"
              className="mt-2 flex h-13 items-center justify-center gap-2 rounded-xl bg-[#F0EDE4] px-5 text-sm font-semibold text-[#004741] transition hover:bg-white disabled:opacity-60 shadow-lg"
            >
              {busy ? 'Updating Password…' : 'Update Password'}
              <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
