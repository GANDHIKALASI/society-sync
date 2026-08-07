import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b2626] px-6 text-[#f4f0df]">
      <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#f4c77b]">SocietySync</p>
        <h1 className="mt-5 text-3xl font-semibold">That link has expired</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">Please return to the sign in page and request a fresh link.</p>
        <Link href="/auth/login" className="mt-8 inline-flex rounded-full bg-[#d7f36b] px-5 py-3 text-sm font-semibold text-[#153b32]">Back to sign in</Link>
      </section>
    </main>
  )
}
