import Link from 'next/link'
import { Clock, ShieldAlert } from 'lucide-react'

export default function PendingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#004741] px-5 text-[#F0EDE4]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(240,237,228,0.12),transparent_50%)]" />
      <section className="relative z-10 max-w-lg rounded-[2.5rem] border border-[#F0EDE4]/20 bg-[#F0EDE4]/10 p-8 text-[#F0EDE4] shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#F0EDE4]/15 border border-[#F0EDE4]/30">
          <Clock className="size-8 text-[#F0EDE4]" />
        </div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#F0EDE4]/30 bg-[#F0EDE4]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-[#F0EDE4]">
          <ShieldAlert className="size-3.5" /> Pending Approval
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-[-0.05em]">Registration Received.</h1>
        <p className="mt-4 text-sm leading-7 text-[#F0EDE4]/75">
          Your account is waiting for administrator approval. A Super Admin must verify your resident details before you can access the society dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F0EDE4] px-6 text-sm font-semibold text-[#004741] transition hover:bg-white shadow-md"
          >
            Return to Sign In
          </Link>
          <Link href="/" className="text-xs text-[#F0EDE4]/60 hover:underline">
            Go back to homepage
          </Link>
        </div>
      </section>
    </main>
  )
}
