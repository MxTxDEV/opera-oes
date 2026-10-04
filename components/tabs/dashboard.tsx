'use client'

import { Bar, Panel, Stat } from '@/components/ui/kit'
import { DiaryForm } from './diary'
import { GoalProgress, PendingPanel } from './goals'
import { activityDays, addDays, brl, catInfo, computeXp, fmtDate, inRange, lastDays, levelInfo, streak, today, useStore } from '@/lib/store'

export default function Dashboard({ go }: { go: (t: string) => void }) {
  const { data } = useStore()
  const xp = computeXp(data)
  const lv = levelInfo(xp)
  const days = lastDays(30)
  const act = activityDays(data)
  const r30: [string, string] = [addDays(today(), -29), today()]
  const month = today().slice(0, 7)
  const mTx = data.txs.filter((t) => t.date.startsWith(month))
  const inc = mTx.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0)
  const out = mTx.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0)
  const workouts = data.workouts.filter((w) => inRange(w.date, r30)).length
  const pages = data.readings.filter((r) => inRange(r.date, r30)).reduce((a, r) => a + r.pages, 0)
  const posted = data.posts.filter((p) => p.status === 'postado' && inRange(p.date, r30)).length
  const diaryDays = new Set(data.entries.filter((e) => inRange(e.date, r30)).map((e) => e.date)).size
  const doing = data.projects.filter((p) => p.status === 'doing').length
  const done = data.projects.filter((p) => p.status === 'done').length
  const recent = [...data.entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-black text-black">{lv.level}</div>
          <div className="min-w-[200px] flex-1">
            <div className="flex items-baseline justify-between"><span className="text-lg font-semibold">{lv.title}</span><span className="text-xs text-white/50">{xp} XP · faltam {lv.need - lv.into} p/ nível {lv.level + 1}</span></div>
            <div className="mt-2"><Bar value={lv.into} max={lv.need} /></div>
          </div>
          <div className="text-center"><div className="text-3xl font-bold text-amber-400">🔥 {streak(data)}</div><div className="text-[11px] uppercase tracking-wider text-white/45">dias seguidos</div></div>
        </div>
      </Panel>

      <PendingPanel />

      <Panel title="Registrar o dia"><DiaryForm /></Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button onClick={() => go('financas')} className="text-left"><Stat label="Saldo do mês" value={brl(inc - out)} tone={inc - out >= 0 ? 'good' : 'bad'} sub={`↑ ${brl(inc)} · ↓ ${brl(out)}`} /></button>
        <button onClick={() => go('academia')} className="text-left"><Stat label="Treinos (30d)" value={workouts} sub="academia" /></button>
        <button onClick={() => go('leitura')} className="text-left"><Stat label="Páginas (30d)" value={pages} sub="leitura" /></button>
        <button onClick={() => go('conteudo')} className="text-left"><Stat label="Posts (30d)" value={posted} sub="conteúdo" /></button>
        <button onClick={() => go('projetos')} className="text-left"><Stat label="Projetos" value={`${doing} / ${done}`} sub="fazendo / concluídos" /></button>
        <button onClick={() => go('diario')} className="text-left"><Stat label="Dias registrados (30d)" value={`${diaryDays}/30`} sub="diário" /></button>
      </div>

      <Panel title="Atividade — últimos 30 dias">
        <div className="flex gap-1">
          {days.map((d) => <div key={d} title={fmtDate(d)} className={`h-8 flex-1 rounded ${act.has(d) ? 'bg-amber-500' : 'bg-white/10'}`} />)}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Metas em andamento" right={<button onClick={() => go('metas')} className="text-xs text-amber-400">ver todas →</button>}>
          <div className="space-y-4">{data.goals.slice(0, 6).map((g) => <GoalProgress key={g.id} g={g} compact />)}</div>
        </Panel>
        <Panel title="Últimos registros" right={<button onClick={() => go('diario')} className="text-xs text-amber-400">diário →</button>}>
          {recent.length === 0 ? <p className="text-sm text-white/40">Nada registrado ainda.</p> : (
            <div className="space-y-2">{recent.map((e) => <div key={e.id} className="text-sm"><span className="text-xs text-white/40">{fmtDate(e.date)}</span><br />{catInfo(e.cat).icon} {e.text}</div>)}</div>
          )}
        </Panel>
      </div>
    </div>
  )
}
