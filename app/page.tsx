'use client'

import Link from 'next/link'
import { ArrowUpRight, Menu, ShieldCheck, Users, Wrench, MapPin, Phone, Mail, Send, Building2, Shield, Layers } from 'lucide-react'

const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#082725] text-[#f3f0e5]">
      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <video
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        <header className="sticky top-0 z-20 px-4 pt-4 sm:px-8 lg:px-12">
          <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/20 bg-[#082725]/35 px-5 py-3 shadow-2xl backdrop-blur-xl" aria-label="Main navigation">
            <Link href="/" className="font-mono text-sm font-bold uppercase tracking-[0.26em]">
              Society<span className="text-[#d7f36b]">Sync</span>
            </Link>
            <div className="hidden items-center gap-8 text-sm text-white/75 md:flex">
              <a href="#home" className="hover:text-white transition">Home</a>
              <a href="#about" className="hover:text-white transition">About</a>
              <a href="#projects" className="hover:text-white transition">Projects</a>
              <a href="#contact" className="hover:text-white transition">Contact</a>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="hidden rounded-full px-4 py-2 text-sm text-white/80 hover:text-white sm:inline-flex">Login</Link>
              <Link href="/auth/sign-up" className="inline-flex items-center gap-2 rounded-full bg-[#d7f36b] px-4 py-2 text-sm font-semibold text-[#153b32] hover:bg-[#e7fb91]">
                Start now <ArrowUpRight className="size-4" />
              </Link>
              <button className="rounded-full p-2 text-white/80 md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </button>
            </div>
          </nav>
        </header>

        <div id="home" className="relative z-10 flex flex-1 items-end px-6 pb-12 pt-20 sm:px-12 lg:px-20 lg:pb-20">
          <div className="max-w-3xl">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[#d7f36b]">The operating layer for better communities</p>
            <h1 className="max-w-3xl text-6xl font-semibold leading-[.92] tracking-[-0.065em] text-balance sm:text-8xl">
              A better place, built together.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              SocietySync brings residents, teams, and everyday operations into one calm, connected workspace.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/auth/sign-up" className="inline-flex items-center gap-2 rounded-full bg-[#d7f36b] px-5 py-3 text-sm font-semibold text-[#153b32] hover:bg-[#e7fb91]">
                Create your account <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/auth/login" className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-md hover:bg-white/15">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-6 border-t border-white/20 px-6 py-5 text-xs text-white/65 sm:px-12 lg:px-20">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-[#d7f36b]" /> Admin-approved access</span>
          <span className="inline-flex items-center gap-2"><Users className="size-4 text-[#d7f36b]" /> Resident-first tools</span>
          <span className="inline-flex items-center gap-2"><Wrench className="size-4 text-[#d7f36b]" /> Faster everyday work</span>
        </div>
      </section>

      {/* ABOUT & PROJECTS SECTION */}
      <section id="about" className="bg-[#f3f0e5] px-6 py-24 text-[#153b32] sm:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4c776d]">One Shared Rhythm</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Less chasing. More belonging.
              </h2>
              <p className="mt-6 text-base leading-7 text-[#153b32]/75">
                From resident approvals to maintenance ledger management, SocietySync brings operational efficiency to gated communities, residential societies, and modern apartments across India.
              </p>
            </div>

            {/* DEVELOPER PROFILE HIGHLIGHT CARD */}
            <div className="rounded-3xl border border-[#153b32]/15 bg-[#082725] p-8 text-[#f3f0e5] shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#d7f36b] text-[#153b32] font-bold text-xl">
                  GK
                </div>
                <div>
                  <h3 className="text-xl font-bold">Gandhi Kalasi</h3>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#d7f36b]">Founder & Lead Developer</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/70">
                Specialized in building enterprise SaaS platforms, scalable cloud backend systems, PostgreSQL architecture, and modern full-stack web applications.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono text-[#d7f36b]">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Full-Stack Development</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">PostgreSQL</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Next.js & Supabase</span>
              </div>
            </div>
          </div>

          {/* PROJECT FEATURES & SHOWCASE */}
          <div id="projects" className="mt-20 pt-10 border-t border-[#153b32]/15">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4c776d] text-center">Core Engineering</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-center sm:text-4xl">Platform Features & Projects</h3>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#153b32]/15 bg-white/60 p-6 backdrop-blur-md shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#082725] text-[#d7f36b]">
                  <Building2 className="size-5" />
                </div>
                <h4 className="mt-4 font-bold text-lg">Society Management</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#153b32]/70">Automated block & flat mapping, resident directories, and owner vs tenant classification.</p>
              </div>

              <div className="rounded-2xl border border-[#153b32]/15 bg-white/60 p-6 backdrop-blur-md shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#082725] text-[#d7f36b]">
                  <Shield className="size-5" />
                </div>
                <h4 className="mt-4 font-bold text-lg">Admin Approval Flow</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#153b32]/70">Strict resident verification workflow. Login is blocked until Super Admin approval.</p>
              </div>

              <div className="rounded-2xl border border-[#153b32]/15 bg-white/60 p-6 backdrop-blur-md shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#082725] text-[#d7f36b]">
                  <Layers className="size-5" />
                </div>
                <h4 className="mt-4 font-bold text-lg">Maintenance & Invoicing</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#153b32]/70">Automated maintenance billing, simulated online payments, and instant digital receipts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="bg-[#082725] px-6 py-24 text-[#f3f0e5] sm:px-12 lg:px-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#d7f36b]">Get In Touch</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Connect with Us.</h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
                Have questions about SocietySync or custom SaaS development? Reach out directly.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#d7f36b] text-[#082725]">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-white/60">Location / Home Address</p>
                    <p className="text-base font-semibold text-white">Bhubaneswar, Odisha, India</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#d7f36b] text-[#082725]">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-white/60">Mobile Number</p>
                    <a href="tel:+919348605226" className="text-base font-semibold text-white hover:text-[#d7f36b] transition">
                      +91 9348605226
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#d7f36b] text-[#082725]">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-white/60">Email Address</p>
                    <a href="mailto:hello@societysync.app" className="text-base font-semibold text-white hover:text-[#d7f36b] transition">
                      hello@societysync.app
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-2xl font-bold">Send a Message</h3>
              <p className="mt-1 text-sm text-white/60">Fill out the form below to reach Gandhi Kalasi.</p>

              <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent to Gandhi Kalasi.') }}>
                <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider text-white/70">
                  Your Name
                  <input required type="text" className="h-12 rounded-xl border border-white/20 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#d7f36b]" placeholder="John Doe" />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider text-white/70">
                  Email Address
                  <input required type="email" className="h-12 rounded-xl border border-white/20 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#d7f36b]" placeholder="you@domain.com" />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-mono uppercase tracking-wider text-white/70">
                  Message
                  <textarea required className="min-h-28 rounded-xl border border-white/20 bg-black/20 p-4 text-sm text-white outline-none focus:border-[#d7f36b]" placeholder="Your message details…" />
                </label>

                <button type="submit" className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d7f36b] font-semibold text-[#082725] transition hover:bg-[#e7fb91]">
                  Send Message <ArrowUpRight className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & DEVELOPER CREDITS */}
      <footer className="border-t border-white/15 bg-[#051c1b] px-6 py-10 text-sm text-white/70 sm:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-semibold text-white">
              Designed and Developed by <span className="text-[#d7f36b]">Gandhi Kalasi</span>
            </p>
            <p className="mt-1 text-xs text-white/50">© 2026 SocietySync. All Rights Reserved.</p>
          </div>

          {/* SOCIAL MEDIA LINKS WITH CLEAN SVGS */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <a
              href="https://instagram.com/bug_gandhi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-white/90 hover:border-[#d7f36b] hover:text-[#d7f36b] transition"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @bug_gandhi
            </a>

            <a
              href="https://t.me/bug_gandhi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-white/90 hover:border-[#d7f36b] hover:text-[#d7f36b] transition"
            >
              <Send className="size-4" /> @bug_gandhi
            </a>

            <a
              href="https://github.com/GANDHIKALASI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-white/90 hover:border-[#d7f36b] hover:text-[#d7f36b] transition"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GANDHIKALASI
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
