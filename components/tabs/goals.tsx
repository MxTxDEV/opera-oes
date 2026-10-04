'use client'

import { useState } from 'react'
import { Bar, Btn, Empty, Field, Panel, RowActions, inputCls } from '@/components/ui/kit'
import { METRICS, brl, goalMet, goalPeriods, periodLabel, today, useStore, type Goal, type Metric } from '@/lib/store'

export const fmtVal = (m: Metric, v: number) => (METRICS[m].money ? brl(v) : `${v} ${METRICS[m].unit}`)

/** Prêmios a resgatar e penalidades a cumprir (períodos já encerrados). */
export function usePending() {
  const { data } = useStore()
  const rewards: { goal: Goal; key: string }[] = []
  const debts: { goal: Goal; key: string }[] = []
  for (const g of data.goals)
    for (const p of goalPeriods(g, data)) {
      if (g.claimed[p.key]) continue
      if (p.status === 'won') rewards.push({ goal: g, key: p.key })
      if (p.status === 'lost') debts.push({ goal: g, key: p.key })
    }
  return { rewards, debts }
}

export function PendingPanel() {
  const { edit } = useStore()
  const { rewards, debts } = usePending()
  const mark = (g: Goal, key: string) => edit('goals', g.id, { claimed: { ...g.claimed, [key]: true } })
  if (!rewards.length && !debts.length) return null
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rewards.length > 0 && (
        <Panel title="🏆 Prêmios para resgatar" className="!border-emerald-500/30">
          <div className="space-y-2">
            {rewards.map(({ goal, key }) => (
              <div key={goal.id + key} className="flex items-center justify-between gap-2 text-sm">
                <div><b>{goal.reward}</b><div className="text-xs text-white/50">{goal.title} · {periodLabel(goal.period, key)}</div></div>
                <Btn variant="primary" onClick={() => mark(goal, key)}>Resgatei</Btn>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {debts.length > 0 && (
        <Panel title="💀 Penalidades a cumprir" className="!border-red-500/30">
          <div className="space-y-2">
            {debts.map(({ goal, key }) => (
              <div key={goal.id + key} className="flex items-center justify-between gap-2 text-sm">
                <div><b>{goal.penalty}</b><div className="text-xs text-white/50">{goal.title} · {periodLabel(goal.period, key)}</div></div>
                <Btn variant="danger" onClick={() => mark(goal, key)}>Cumprida</Btn>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

export function GoalProgress({ g, compact }: { g: Goal; compact?: boolean }) {
  const { data } = useStore()
  const periods = goalPeriods(g, data)
  const cur = periods.at(-1)!
  const met = goalMet(g, cur.value)
  const lte = g.cmp === 'lte'
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{g.title} <span className="text-xs text-white/40">· {g.period === 'week' ? 'semana' : 'mês'}</span></span>
        <span className={met ? (lte ? 'text-white/70' : 'text-emerald-400') : 'text-white/70'}>{fmtVal(g.metric, cur.value)} / {lte ? '≤ ' : ''}{fmtVal(g.metric, g.target)}</span>
      </div>
      <div className="mt-1"><Bar value={cur.value} max={g.target} color={lte ? (met ? 'bg-emerald-500' : 'bg-red-500') : met ? 'bg-emerald-500' : 'bg-amber-500'} /></div>
      {!compact && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {periods.slice(-12, -1).map((p) => <span key={p.key} title={`${periodLabel(g.period, p.key)}: ${fmtVal(g.metric, p.value)}`} className="text-sm">{p.status === 'won' ? '✅' : '❌'}</span>)}
          <span className="text-[11px] text-white/40">{periods.length > 1 ? 'histórico' : 'primeiro período'}</span>
        </div>
      )}
    </div>
  )
}

function GoalForm({ initial, onSave, onCancel }: { initial?: Goal; onSave: (g: Omit<Goal, 'id' | 'claimed'>) => void; onCancel?: () => void }) {
  const [g, setG] = useState({
    title: initial?.title ?? '', metric: (initial?.metric ?? 'workouts') as Metric, cmp: initial?.cmp ?? ('gte' as 'gte' | 'lte'),
    target: String(initial?.target ?? ''), period: initial?.period ?? ('week' as 'week' | 'month'), xp: String(initial?.xp ?? 100),
    reward: initial?.reward ?? '', penalty: initial?.penalty ?? '', createdAt: initial?.createdAt ?? today(),
  })
  const save = () => {
    const target = parseFloat(g.target.replace(',', '.'))
    if (!g.title.trim() || isNaN(target)) return
    onSave({ ...g, title: g.title.trim(), target, xp: parseInt(g.xp) || 0 })
  }
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      <Field label="Meta" className="sm:col-span-3"><input className={inputCls} value={g.title} onChange={(e) => setG({ ...g, title: e.target.value })} /></Field>
      <Field label="O que medir" className="sm:col-span-3">
        <select className={inputCls} value={g.metric} onChange={(e) => { const m = e.target.value as Metric; setG({ ...g, metric: m, cmp: m === 'expenses' ? 'lte' : 'gte' }) }}>
          {Object.entries(METRICS).map(([k, m]) => <option key={k} value={k} className="bg-neutral-900">{m.label}</option>)}
        </select>
      </Field>
      <Field label="Condição"><select className={inputCls} value={g.cmp} onChange={(e) => setG({ ...g, cmp: e.target.value as 'gte' | 'lte' })}><option value="gte" className="bg-neutral-900">Pelo menos</option><option value="lte" className="bg-neutral-900">No máximo</option></select></Field>
      <Field label="Alvo"><input inputMode="decimal" className={inputCls} value={g.target} onChange={(e) => setG({ ...g, target: e.target.value })} /></Field>
      <Field label="Período"><select className={inputCls} value={g.period} onChange={(e) => setG({ ...g, period: e.target.value as 'week' | 'month' })}><option value="week" className="bg-neutral-900">Semanal</option><option value="month" className="bg-neutral-900">Mensal</option></select></Field>
      <Field label="XP"><input inputMode="numeric" className={inputCls} value={g.xp} onChange={(e) => setG({ ...g, xp: e.target.value })} /></Field>
      <Field label="🏆 Se cumprir, eu ganho" className="sm:col-span-3"><input className={inputCls} value={g.reward} onChange={(e) => setG({ ...g, reward: e.target.value })} /></Field>
      <Field label="💀 Se falhar, eu pago" className="sm:col-span-3"><input className={inputCls} value={g.penalty} onChange={(e) => setG({ ...g, penalty: e.target.value })} /></Field>
      <div className="flex gap-2 sm:col-span-6"><Btn variant="primary" onClick={save}>Salvar meta</Btn>{onCancel && <Btn onClick={onCancel}>Cancelar</Btn>}</div>
    </div>
  )
}

export default function GoalsTab() {
  const { data, add, edit, remove } = useStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-4">
      <PendingPanel />
      <Panel title="Desafios" right={<Btn variant="primary" onClick={() => setAdding(!adding)}>{adding ? 'Fechar' : '+ Nova meta'}</Btn>}>
        <p className="mb-3 text-xs text-white/50">Cada período encerrado vira vitória (+XP e prêmio) ou derrota (−½ XP e penalidade). Metas contam a partir do dia em que foram criadas.</p>
        {adding && <div className="mb-4 rounded-xl border border-white/10 p-3"><GoalForm onSave={(g) => { add('goals', { ...g, claimed: {} }); setAdding(false) }} /></div>}
        {data.goals.length === 0 && <Empty>Sem metas. Crie a primeira!</Empty>}
        <div className="space-y-3">
          {data.goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              {editId === g.id ? (
                <GoalForm initial={g} onSave={(x) => { edit('goals', g.id, x); setEditId(null) }} onCancel={() => setEditId(null)} />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1"><GoalProgress g={g} /></div>
                    <RowActions onEdit={() => setEditId(g.id)} onDelete={() => remove('goals', g.id)} />
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-white/60 sm:grid-cols-3">
                    <span>🏆 {g.reward || '—'}</span><span>💀 {g.penalty || '—'}</span><span>⭐ {g.xp} XP</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
