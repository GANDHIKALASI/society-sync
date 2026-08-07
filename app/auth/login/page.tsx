'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Forgot Password State
  const [isForgot, setIsForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  function validateEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const cleanEmail = email.trim().toLowerCase()

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g., resident@gmail.com).')
      setBusy(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })

      if (signInError || !authData?.user) {
        const errMsg = signInError?.message || ''
        if (errMsg.includes('Invalid login credentials') || errMsg.includes('invalid')) {
          setError('Invalid email or password. If you are a new resident, please click "Register account" below.')
        } else {
          setError(errMsg || 'We could not sign you in. Please check your credentials.')
        }
        setBusy(false)
        return
      }

      // Query or auto-create profile from Supabase Database
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profile?.status === 'pending') {
        setError('Your account is waiting for administrator approval.')
        setTimeout(() => window.location.assign('/auth/pending'), 1200)
        setBusy(false)
        return
      }

      if (profile && (profile.status === 'rejected' || profile.status === 'suspended')) {
        setError('Your account access has been restricted by an administrator.')
        setBusy(false)
        return
      }

      window.location.assign('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Connection error. Please check your credentials and network.')
    } finally {
      setBusy(false)
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault()
    setResetBusy(true)
    setResetMsg('')

    const cleanEmail = resetEmail.trim().toLowerCase()
    if (!validateEmail(cleanEmail)) {
      setResetMsg('Please enter a valid email address (e.g., resident@gmail.com).')
      setResetBusy(false)
      return
    }

    try {
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/reset-password`
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      })

      if (resetErr) {
        setResetMsg(resetErr.message || 'Could not send reset email. Please verify your email.')
        setResetBusy(false)
        return
      }

      setResetSent(true)
    } catch (err: any) {
      setResetMsg(err?.message || 'Failed to send reset link.')
    } finally {
      setResetBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#004741] px-5 py-10 text-[#F0EDE4] sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,237,228,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(240,237,228,0.08),transparent_35%)]" />
      <Link href="/" className="absolute left-6 top-6 z-10 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]/80 hover:text-[#F0EDE4]">
        SocietySync
      </Link>

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-[#F0EDE4]/20 bg-[#F0EDE4]/10 shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:grid-cols-[1.05fr_.95fr]">
        <div className="hidden min-h-[620px] flex-col justify-between bg-[#004741]/80 p-10 backdrop-blur-md md:flex md:p-14 border-r border-[#F0EDE4]/15">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F0EDE4]/30 bg-[#F0EDE4]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]">
              <ShieldCheck className="size-3.5" /> Secure Portal
            </div>
            <h1 className="mt-16 max-w-sm text-5xl font-semibold leading-[0.98] tracking-[-.05em] text-[#F0EDE4]">
              Enterprise Society Management.
            </h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#F0EDE4]/70">
            One quiet, connected workspace for residents, administration, and operations teams.
          </p>
        </div>

        <div className="p-7 sm:p-12 md:p-16 flex flex-col justify-center">
          {!isForgot ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]/70">Sign In</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#F0EDE4]">Welcome Back.</h2>
              <p className="mt-2 text-sm leading-6 text-[#F0EDE4]/65">Enter your account credentials to access your dashboard.</p>

              <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
                <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#F0EDE4]/70">
                  Email Address
                  <div className="flex items-center gap-3 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 focus-within:border-[#F0EDE4]">
                    <Mail className="size-4 text-[#F0EDE4]/60" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#F0EDE4] outline-none placeholder:text-[#F0EDE4]/35"
                      placeholder="you@domain.com"
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-[#F0EDE4]/70">
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => { setIsForgot(true); setResetEmail(email) }}
                      className="text-xs font-semibold normal-case text-[#F0EDE4] underline hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>
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
                </div>

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
                  {busy ? 'Signing in…' : 'Continue to Dashboard'}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-[#F0EDE4]/60">
                Resident looking to join?{' '}
                <Link href="/auth/sign-up" className="font-semibold text-[#F0EDE4] hover:underline">
                  Register account
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setIsForgot(false); setResetSent(false); setResetMsg('') }}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#F0EDE4]/70 hover:text-[#F0EDE4]"
              >
                <ArrowLeft className="size-3.5" /> Back to Login
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#F0EDE4]/30 bg-[#F0EDE4]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4] w-fit">
                <KeyRound className="size-3.5" /> Reset Access
              </div>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F0EDE4]">Forgot Password?</h2>
              <p className="mt-2 text-sm leading-6 text-[#F0EDE4]/65">
                Enter your registered email address below. We will send you instructions to reset your password.
              </p>

              {resetSent ? (
                <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/20 p-5 text-center">
                  <CheckCircle2 className="mx-auto size-8 text-emerald-300" />
                  <h3 className="mt-3 text-base font-bold text-emerald-100">Reset Email Sent!</h3>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-200">
                    We have dispatched password recovery instructions to <strong className="text-white">{resetEmail}</strong>. Check your inbox and follow the link to set a new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setIsForgot(false); setResetSent(false) }}
                    className="mt-4 rounded-xl bg-[#F0EDE4] px-4 py-2 text-xs font-bold text-[#004741]"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
                  <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#F0EDE4]/70">
                    Registered Email Address
                    <div className="flex items-center gap-3 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 focus-within:border-[#F0EDE4]">
                      <Mail className="size-4 text-[#F0EDE4]/60" />
                      <input
                        required
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#F0EDE4] outline-none placeholder:text-[#F0EDE4]/35"
                        placeholder="resident@domain.com or staff@domain.com"
                      />
                    </div>
                  </label>

                  {resetMsg && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/15 p-3.5 text-xs font-medium text-red-200 leading-relaxed">
                      {resetMsg}
                    </div>
                  )}

                  <button
                    disabled={resetBusy}
                    type="submit"
                    className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F0EDE4] px-5 text-sm font-semibold text-[#004741] transition hover:bg-white disabled:opacity-60 shadow-lg"
                  >
                    {resetBusy ? 'Sending Reset Link…' : 'Send Password Reset Link'}
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
