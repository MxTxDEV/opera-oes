'use client'

import { useState } from 'react'
import { Btn, Empty, Field, Panel, RowActions, Stat, inputCls } from '@/components/ui/kit'
import { addDays, fmtDate, inRange, lastDays, periodKey, today, useStore, type Workout } from '@/lib/store'

const KINDS = ['Musculação', 'Cardio', 'Funcional', 'Esporte', 'Alongamento', 'Outro']

export default function GymTab() {
  const { data, add, edit, remove } = useStore()
  const blank = { date: today(), kind: 'Musculação', minutes: '60', notes: '', weight: '' }
  const [f, setF] = useState(blank)
  const [editId, setEditId] = useState<string | null>(null)

  const last30: [string, string] = [addDays(today(), -29), today()]
  const l30 = data.workouts.filter((w) => inRange(w.date, last30))
  const wkStart = periodKey('week', today())
  const thisWeek = data.workouts.filter((w) => w.date >= wkStart).length
  const weights = data.workouts.filter((w) => w.weight).sort((a, b) => a.date.localeCompare(b.date))
  const lastW = weights.at(-1)?.weight
  const firstW = weights[0]?.weight

  const submit = () => {
    const minutes = parseInt(f.minutes)
    if (!minutes || minutes <= 0) return
    const w = parseFloat(f.weight.replace(',', '.'))
    const item: Omit<Workout, 'id'> = { date: f.date, kind: f.kind, minutes, notes: f.notes.trim(), ...(w ? { weight: w } : {}) }
    if (editId) edit('workouts', editId, { ...item, weight: w || undefined })
    else add('workouts', item)
    setEditId(null)
    setF({ ...blank, date: f.date })
  }

  const days = lastDays(30)
  const sorted = [...data.workouts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Treinos na semana" value={thisWeek} />
        <Stat label="Treinos em 30 dias" value={l30.length} />
        <Stat label="Minutos em 30 dias" value={l30.reduce((a, w) => a + w.minutes, 0)} />
        <Stat label="Peso" value={lastW ? `${lastW} kg` : '—'} sub={lastW && firstW ? `${(lastW - firstW >= 0 ? '+' : '') + (lastW - firstW).toFixed(1)} kg desde o início` : 'registre no treino'} />
      </div>

      <Panel title={editId ? 'Editando treino' : 'Registrar treino'}>
        <div className="grid gap-3 sm:grid-cols-6 sm:items-end">
          <Field label="Data"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Tipo">
            <select className={inputCls} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
              {KINDS.map((k) => <option key={k} className="bg-neutral-900">{k}</option>)}
            </select>
          </Field>
          <Field label="Minutos"><input inputMode="numeric" className={inputCls} value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} /></Field>
          <Field label="Peso (kg, opcional)"><input inputMode="decimal" className={inputCls} value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} /></Field>
          <Field label="Exercícios / notas"><input className={inputCls} value={f.notes} placeholder="Peito e tríceps…" onChange={(e) => setF({ ...f, notes: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <div className="flex gap-2">
            <Btn variant="primary" className="flex-1" onClick={submit}>{editId ? 'Salvar' : 'Registrar'}</Btn>
            {editId && <Btn onClick={() => { setEditId(null); setF(blank) }}>✕</Btn>}
          </div>
        </div>
      </Panel>

      <Panel title="Últimos 30 dias">
        <div className="flex gap-1">
          {days.map((d) => {
            const n = data.workouts.filter((w) => w.date === d).length
            return <div key={d} title={`${fmtDate(d)}: ${n} treino(s)`} className={`h-8 flex-1 rounded ${n ? 'bg-emerald-500' : 'bg-white/10'}`} />
          })}
        </div>
      </Panel>

      <Panel title="Histórico de treinos">
        {sorted.length === 0 ? <Empty>Nenhum treino ainda. Bora começar!</Empty> : (
          <div className="space-y-2">
            {sorted.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{w.kind} · {w.minutes} min {w.weight ? <span className="text-white/50">· {w.weight} kg</span> : null}</div>
                  <div className="truncate text-xs text-white/50">{fmtDate(w.date)}{w.notes ? ` — ${w.notes}` : ''}</div>
                </div>
                <RowActions
                  onEdit={() => { setEditId(w.id); setF({ date: w.date, kind: w.kind, minutes: String(w.minutes), notes: w.notes, weight: w.weight ? String(w.weight) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  onDelete={() => remove('workouts', w.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
