'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    if (signInError) setError(signInError.message)
    else window.location.assign('/admin')
    setLoading(false)
  }

  return <main className="min-h-screen bg-[#0a0a09] px-5 py-10 text-[#f4f0e7] lg:px-10"><div className="mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center"><Link href="/admin" className="text-xs uppercase tracking-[.2em] text-white/45 hover:text-[#d8a84e]">← Back</Link><p className="eyebrow mt-16">Taleb only · Private workspace</p><h1 className="section-title mt-4">Secure <span>login.</span></h1><p className="mt-5 max-w-md text-sm leading-6 text-white/45">Use the administrator account created in Supabase Authentication.</p><form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4"><label className="flex flex-col gap-2 text-xs uppercase tracking-[.18em] text-white/50">Email<input name="email" required type="email" className="border border-white/15 bg-[#11110f] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#d8a84e]" autoComplete="email" /></label><label className="flex flex-col gap-2 text-xs uppercase tracking-[.18em] text-white/50">Password<input name="password" required type="password" className="border border-white/15 bg-[#11110f] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#d8a84e]" autoComplete="current-password" /></label><button disabled={loading} className="gold-button mt-3 justify-center disabled:opacity-50" type="submit">{loading ? 'Signing in…' : 'Sign in securely ↗'}</button></form>{error && <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}</div></main>
}
