'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Player = { id: string; name: string; position: string; number: number; goals: number; assists: number; status: string }
type Match = { id: string; opponent: string; played_at: string; home_score: number; away_score: number; result: 'Win' | 'Draw' | 'Loss'; competition: string }
type MatchForm = { opponent: string; played_at: string; home_score: string; away_score: string; competition: string }
const emptyMatch: MatchForm = { opponent: '', played_at: new Date().toISOString().slice(0, 10), home_score: '0', away_score: '0', competition: 'League' }
const inputClass = 'mt-2 w-full border border-white/15 bg-[#0a0a09] px-3 py-2 text-sm text-white outline-none focus:border-[#d8a84e]'

function getResult(home: number, away: number): Match['result'] { return home > away ? 'Win' : home === away ? 'Draw' : 'Loss' }

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('Loading club data…')
  const [matchForm, setMatchForm] = useState<MatchForm>(emptyMatch)
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.assign('/admin/login'); return }
    setEmail(user.email ?? '')
    const [{ data: playerData, error: playerError }, { data: matchData, error: matchError }] = await Promise.all([
      supabase.from('players').select('*').order('number'),
      supabase.from('matches').select('*').order('played_at', { ascending: false }),
    ])
    if (playerError || matchError) setMessage(playerError?.message || matchError?.message || 'Unable to load club data.')
    else setMessage('Live Supabase data connected.')
    setPlayers(playerData ?? [])
    setMatches(matchData ?? [])
  }

  useEffect(() => { loadData() }, [])

  async function updatePlayer(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = { goals: Math.max(0, Number(form.get('goals'))), assists: Math.max(0, Number(form.get('assists'))), status: String(form.get('status')) }
    const { error } = await supabase.from('players').update(values).eq('id', id)
    setMessage(error ? error.message : 'Player updated.')
    if (!error) setPlayers((items) => items.map((item) => item.id === id ? { ...item, ...values } : item))
  }

  function editMatch(match: Match) { setEditingId(match.id); setMatchForm({ opponent: match.opponent, played_at: match.played_at, home_score: String(match.home_score), away_score: String(match.away_score), competition: match.competition }) }
  function resetMatchForm() { setEditingId(null); setMatchForm(emptyMatch) }

  async function saveMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const home = Math.max(0, Number(matchForm.home_score)); const away = Math.max(0, Number(matchForm.away_score))
    const values = { opponent: matchForm.opponent.trim(), played_at: matchForm.played_at, home_score: home, away_score: away, result: getResult(home, away), competition: matchForm.competition.trim() || 'League' }
    if (!values.opponent) { setMessage('Opponent is required.'); return }
    const query = editingId ? supabase.from('matches').update(values).eq('id', editingId).select().single() : supabase.from('matches').insert(values).select().single()
    const { data, error } = await query
    if (error) { setMessage(error.message); return }
    setMatches((items) => editingId ? items.map((item) => item.id === editingId ? data as Match : item) : [data as Match, ...items])
    setMessage(editingId ? 'Match updated.' : 'Match added.')
    resetMatchForm()
  }

  async function deleteMatch(id: string) {
    if (!window.confirm('Delete this match?')) return
    const { error } = await supabase.from('matches').delete().eq('id', id)
    setMessage(error ? error.message : 'Match deleted.')
    if (!error) setMatches((items) => items.filter((item) => item.id !== id))
  }

  async function signOut() { await supabase.auth.signOut(); window.location.assign('/admin/login') }
  const stats = matches.reduce((summary, match) => { summary.played++; summary.goals += match.home_score; if (match.result === 'Win') summary.wins++; if (match.result === 'Draw') summary.draws++; if (match.result === 'Loss') summary.losses++; return summary }, { played: 0, wins: 0, draws: 0, losses: 0, goals: 0 })

  return <main className="min-h-screen bg-[#0a0a09] px-5 py-10 text-[#f4f0e7] lg:px-10"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between"><Link href="/" className="text-xs uppercase tracking-[.2em] text-white/45 hover:text-[#d8a84e]">← Back to club</Link><button onClick={signOut} className="text-xs uppercase tracking-[.2em] text-white/45 hover:text-[#d8a84e]">Sign out</button></div><div className="mt-16 flex items-end justify-between gap-5"><div><p className="eyebrow">{email || 'Private workspace'}</p><h1 className="section-title mt-2">Club <span>control.</span></h1></div><p className="hidden text-sm text-white/45 md:block">Player and match records</p></div><p className="mt-6 border border-[#d8a84e]/30 bg-[#d8a84e]/10 p-4 text-sm text-[#d8a84e]">{message}</p>

  <section className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-5">{[['Matches', stats.played], ['Wins', stats.wins], ['Draws', stats.draws], ['Losses', stats.losses], ['Goals', stats.goals]].map(([label, value]) => <div key={label} className="bg-[#11110f] p-5"><strong className="font-display text-3xl text-[#d8a84e]">{value}</strong><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/45">{label}</p></div>)}</section>

  <section className="mt-12"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Squad management</p><h2 className="mt-2 font-display text-3xl">Player <span className="text-[#d8a84e]">stats.</span></h2></div><span className="text-sm text-white/45">{players.length} players</span></div><div className="grid gap-4 md:grid-cols-2">{players.map((player) => <form key={player.id} onSubmit={(event) => updatePlayer(event, player.id)} className="border border-white/10 bg-[#11110f] p-5"><div className="flex items-start justify-between"><div><h3 className="font-display text-xl">{player.name}</h3><p className="mt-1 text-xs uppercase tracking-[.16em] text-[#d8a84e]">#{player.number} · {player.position}</p></div><select name="status" defaultValue={player.status} className="border border-white/15 bg-[#0a0a09] px-2 py-2 text-xs text-white"><option>Active</option><option>Injured</option><option>Suspended</option><option>Unavailable</option></select></div><div className="mt-5 grid grid-cols-2 gap-3"><label className="text-xs text-white/45">Goals<input name="goals" type="number" min="0" defaultValue={player.goals} className={inputClass} /></label><label className="text-xs text-white/45">Assists<input name="assists" type="number" min="0" defaultValue={player.assists} className={inputClass} /></label></div><button className="gold-button mt-5 w-full justify-center">Save player</button></form>)}</div></section>

  <section className="mt-12"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Match management</p><h2 className="mt-2 font-display text-3xl">Fixtures & <span className="text-[#d8a84e]">results.</span></h2></div><span className="text-sm text-white/45">{matches.length} matches</span></div><form onSubmit={saveMatch} className="border border-[#d8a84e]/30 bg-[#11110f] p-5"><h3 className="font-display text-xl">{editingId ? 'Edit match' : 'Add match'}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><label className="text-xs text-white/45">Opponent<input required value={matchForm.opponent} onChange={(e) => setMatchForm({ ...matchForm, opponent: e.target.value })} className={inputClass} /></label><label className="text-xs text-white/45">Date<input required type="date" value={matchForm.played_at} onChange={(e) => setMatchForm({ ...matchForm, played_at: e.target.value })} className={inputClass} /></label><label className="text-xs text-white/45">Atrahasis goals<input required type="number" min="0" value={matchForm.home_score} onChange={(e) => setMatchForm({ ...matchForm, home_score: e.target.value })} className={inputClass} /></label><label className="text-xs text-white/45">Opponent goals<input required type="number" min="0" value={matchForm.away_score} onChange={(e) => setMatchForm({ ...matchForm, away_score: e.target.value })} className={inputClass} /></label><label className="text-xs text-white/45">Competition<input value={matchForm.competition} onChange={(e) => setMatchForm({ ...matchForm, competition: e.target.value })} className={inputClass} /></label></div><div className="mt-5 flex gap-3"><button className="gold-button">{editingId ? 'Update match' : 'Add match'}</button>{editingId && <button type="button" onClick={resetMatchForm} className="ghost-button">Cancel</button>}</div></form><div className="mt-4 divide-y divide-white/10 border-y border-white/10">{matches.map((match) => <div key={match.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h3 className="font-display text-lg">ATRAHASIS vs {match.opponent}</h3><p className="mt-1 text-xs uppercase tracking-[.14em] text-white/40">{match.played_at} · {match.competition} · {match.result}</p></div><div className="flex items-center gap-3"><strong className="font-display text-2xl text-[#d8a84e]">{match.home_score} — {match.away_score}</strong><button onClick={() => editMatch(match)} className="ghost-button">Edit</button><button onClick={() => deleteMatch(match.id)} className="border border-red-400/30 px-3 py-2 text-xs text-red-300">Delete</button></div></div>)}</div></section></div></main>
}
