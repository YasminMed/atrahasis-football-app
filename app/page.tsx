'use client'

export const dynamic = 'force-dynamic'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ChevronRight, MapPin, Menu, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Player = { id: string; slug?: string; name: string; position: string; number: number; note: string; goals: number; assists: number; status: string; image: string | null }
type Match = { id: string; opponent: string; played_at: string; home_score: number; away_score: number; result: 'Win' | 'Draw' | 'Loss'; competition: string }

const fallbackPlayers: Player[] = [
  { id: 'taleb', name: 'Taleb', position: 'CAM', number: 10, note: 'The architect', goals: 8, assists: 5, status: 'Active', image: '/players/taleb.png' },
  { id: 'ahmed-al-jboury', name: 'Ahmed Al-Jboury', position: 'GK', number: 1, note: 'Safe hands', goals: 0, assists: 0, status: 'Active', image: '/players/ahmed-al-jboury.png' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadClubData() {
      const [{ data: playerData }, { data: matchData }] = await Promise.all([
        supabase.from('players').select('*').order('number'),
        supabase.from('matches').select('*').order('played_at', { ascending: false }),
      ])
      setPlayers(playerData ?? [])
      setMatches(matchData ?? [])
    }
    loadClubData()
  }, [])

  const visiblePlayers = players.length ? players : fallbackPlayers
  const stats = useMemo(() => matches.reduce((summary, match) => {
    summary.matches += 1
    summary.goals += match.home_score
    if (match.result === 'Win') summary.wins += 1
    if (match.result === 'Draw') summary.draws += 1
    if (match.result === 'Loss') summary.losses += 1
    return summary
  }, { matches: 0, wins: 0, draws: 0, losses: 0, goals: 0 }), [matches])

  return <main className="min-h-screen overflow-hidden bg-[#0a0a09] text-[#f4f0e7]"><header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a09]/80 backdrop-blur-xl"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10"><Link href="#top" className="flex items-center gap-3" aria-label="Atrahasis home"><Image src="/atrahasis-crest.png" alt="Atrahasis crest" width={34} height={42} className="h-10 w-auto object-contain" /><span className="font-display text-lg tracking-[0.24em] text-[#d8a84e]">ATRAHASIS</span></Link><nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-20 w-full flex-col gap-6 border-b border-white/10 bg-[#0a0a09] p-6 md:static md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0`}><a href="#club" className="nav-link">The club</a><a href="#squad" className="nav-link">Squad</a><a href="#matches" className="nav-link">Results</a></nav><div className="flex items-center gap-3"><Link href="/admin" className="gold-button hidden sm:flex">Admin portal <ArrowUpRight /></Link><button aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden"><Menu /></button></div></div></header>

  <section id="top" className="relative isolate flex min-h-[760px] items-end overflow-hidden pt-20"><div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_35%,rgba(183,130,47,.2),transparent_34%),linear-gradient(115deg,#0a0a09_22%,rgba(10,10,9,.48),#0a0a09_90%)]" /><Image src="/atrahasis-kit.png" alt="Atrahasis black and gold home kit" fill priority className="-z-30 object-cover object-[62%_center] opacity-75 mix-blend-screen" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0a0a09_0%,rgba(10,10,9,.77)_38%,rgba(10,10,9,.12)_73%,#0a0a09_100%)]" /><div className="mx-auto w-full max-w-7xl px-5 pb-20 lg:px-10 lg:pb-28"><div className="max-w-2xl"><div className="mb-8 flex items-center gap-4"><Image src="/atrahasis-crest.png" alt="Atrahasis crest" width={88} height={108} className="h-24 w-auto object-contain mix-blend-screen" /><div><p className="font-display text-2xl tracking-[0.18em] text-[#d8a84e]">ATRAHASIS</p><p className="eyebrow mt-2">Football club · Akkad</p></div></div><p className="eyebrow">AKKAD · ANKAWA · ERBIL</p><h1 className="hero-title">Born from<br /><span>history.</span><br />Built for <span>victory.</span></h1><p className="mt-7 max-w-md text-base leading-7 text-white/60">Six players. One code. A new chapter in football, written in gold.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#matches" className="gold-button">Latest results <ChevronRight /></a><a href="#squad" className="ghost-button">Meet the squad</a></div></div></div></section>

  <section id="club" className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28"><div className="grid gap-12 lg:grid-cols-[1fr_2fr]"><div><p className="eyebrow">The record</p><h2 className="section-title mt-4">A season<br /><span>in numbers.</span></h2></div><div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-5"><Stat value={stats.matches} label="Matches played" /><Stat value={stats.wins} label="Wins" /><Stat value={stats.draws} label="Draws" /><Stat value={stats.losses} label="Losses" /><Stat value={stats.goals} label="Goals" /></div></div></section>

  <section id="squad" className="border-y border-white/10 bg-[#10100e] px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mb-12 flex items-end justify-between"><div><p className="eyebrow">The roster</p><h2 className="section-title mt-4">The <span>squad.</span></h2></div><p className="hidden max-w-xs text-right text-sm leading-6 text-white/45 md:block">A collective of individuals, united by the same ancient code.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{visiblePlayers.map((player) => <Link href={`/players/${player.slug ?? player.name.toLowerCase().replaceAll(' ', '-')}`} key={`${player.id}-${player.number}`} className="player-card group"><div className="relative flex aspect-[.82] items-end overflow-hidden bg-[#171714]"><div className="absolute -right-5 -top-5 font-display text-[9rem] leading-none text-white/[.025]">{player.number}</div>{player.image && <img src={player.image} alt={`${player.name} in the Atrahasis kit`} className="absolute inset-0 h-full w-full object-cover object-top opacity-75 mix-blend-screen transition duration-500 group-hover:scale-105" />}<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,15,.05) 20%,#11110f 100%)]" /><div className="relative z-10 p-5"><p className="mb-2 text-[10px] uppercase tracking-[.2em] text-[#d8a84e]">{player.position} · {player.note}</p><h3 className="font-display text-2xl tracking-wide">{player.name}</h3><p className="mt-2 text-xs uppercase tracking-[.14em] text-white/45">{player.status}</p><div className="mt-3 flex gap-4 text-xs text-white/45"><span>{player.goals} goals</span><span>{player.assists} assists</span></div></div></div></Link>)}</div></div></section>

  <section id="matches" className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28"><div className="grid gap-12 lg:grid-cols-[.8fr_1.5fr]"><div><p className="eyebrow">Match centre</p><h2 className="section-title mt-4">Recent<br /><span>form.</span></h2><p className="mt-6 max-w-xs text-sm leading-6 text-white/45">Every result is part of the record. Every record, part of the story.</p></div><div className="divide-y divide-white/10 border-y border-white/10">{matches.map((match) => <div key={match.id} className="flex items-center justify-between gap-4 py-6"><div className="flex items-center gap-5"><span className={`result ${match.result === 'Win' ? 'result-win' : match.result === 'Draw' ? 'result-draw' : 'result-loss'}`}>{match.result === 'Win' ? 'W' : match.result === 'Draw' ? 'D' : 'L'}</span><div><h3 className="font-display text-xl tracking-wide">ATRAHASIS <span className="text-white/35">vs</span> {match.opponent}</h3><p className="mt-1 text-[10px] tracking-[.2em] text-white/40">{new Date(match.played_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {match.competition}</p></div></div><strong className="font-display text-2xl tracking-wider text-[#d8a84e]">{match.home_score} — {match.away_score}</strong></div>)}</div></div></section>

  <footer className="border-t border-white/10 px-5 py-10 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Image src="/atrahasis-crest.png" alt="Atrahasis crest" width={30} height={36} className="h-9 w-auto object-contain" /><span className="font-display tracking-[.2em] text-[#d8a84e]">ATRAHASIS</span></div><div className="flex items-center gap-6 text-xs text-white/40"><span className="flex items-center gap-2"><MapPin className="size-3" /> Akkad, Ankawa</span><Star className="size-4" /><span>© 2026 Atrahasis FC</span></div></div></footer></main>
}
function Stat({ value, label }: { value: number; label: string }) { return <div className="bg-[#11110f] p-6 sm:p-8"><strong className="font-display text-5xl font-normal text-[#d8a84e]">{value}</strong><p className="mt-3 text-[10px] uppercase tracking-[.18em] text-white/45">{label}</p></div> }
