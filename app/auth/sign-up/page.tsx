'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    block: '',
    flatNumber: '',
    occupancyType: 'owner',
  })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  function validateEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    const cleanEmail = form.email.trim().toLowerCase()

    if (!validateEmail(cleanEmail)) {
      setMessage('Please enter a valid email address ending with .com, .in, etc.')
      setBusy(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Password and Confirm Password do not match.')
      setBusy(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone,
            block: form.block,
            flat_number: form.flatNumber,
            occupancy_type: form.occupancyType,
            role: 'resident',
            status: 'pending',
          },
        },
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          setMessage('Supabase Email Rate Limit Exceeded. To fix: Open Supabase Dashboard -> Authentication -> Providers -> Email -> Uncheck "Confirm Email" and click Save.')
        } else {
          setMessage(error.message || 'We could not create that account. Please verify your details.')
        }
        setBusy(false)
        return
      }

      window.location.assign('/auth/pending')
    } catch (err: any) {
      setMessage(err?.message || 'Connection issue. Please verify your details and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#004741] px-5 py-10 text-[#F0EDE4] sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,237,228,0.12),transparent_40%)]" />
      <Link href="/" className="absolute left-6 top-6 z-10 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]/80 hover:text-[#F0EDE4]">
        SocietySync
      </Link>

      <section className="relative z-10 w-full max-w-2xl rounded-[2.5rem] border border-[#F0EDE4]/20 bg-[#F0EDE4]/10 p-8 text-[#F0EDE4] shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F0EDE4]/30 bg-[#F0EDE4]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]">
          <ShieldCheck className="size-3.5" /> Resident Registration
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Create Resident Account.</h1>
        <p className="mt-2 text-sm leading-6 text-[#F0EDE4]/70">
          Registration is submitted to Society Administrators. Approval is required before logging in.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70">
            Full Name
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="John Doe"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70">
            Phone Number
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="+91 98765 43210"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70 sm:col-span-2">
            Email Address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="resident@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70">
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="••••••••"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70">
            Confirm Password
            <input
              required
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="••••••••"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70">
            Block / Tower
            <input
              required
              type="text"
              value={form.block}
              onChange={(e) => update('block', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="Block B"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70">
            Flat Number
            <input
              required
              type="text"
              value={form.flatNumber}
              onChange={(e) => update('flatNumber', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-black/20 px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
              placeholder="A-201"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F0EDE4]/70 sm:col-span-2">
            Owner or Tenant
            <select
              value={form.occupancyType}
              onChange={(e) => update('occupancyType', e.target.value)}
              className="h-12 rounded-xl border border-[#F0EDE4]/25 bg-[#004741] px-4 text-sm text-[#F0EDE4] outline-none focus:border-[#F0EDE4]"
            >
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
            </select>
          </label>

          <div className="mt-2 sm:col-span-2">
            {message && <p className="mb-4 rounded-xl bg-red-500/20 p-3 text-xs font-medium text-red-200 leading-relaxed">{message}</p>}
            <button
              disabled={busy}
              type="submit"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#F0EDE4] text-sm font-semibold text-[#004741] transition hover:bg-white disabled:opacity-60 shadow-lg"
            >
              {busy ? 'Submitting Registration…' : 'Submit Resident Registration'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-[#F0EDE4]/60">
          Already registered?{' '}
          <Link href="/auth/login" className="font-semibold text-[#F0EDE4] hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
