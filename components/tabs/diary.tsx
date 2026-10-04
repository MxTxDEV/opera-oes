'use client'

import { useState } from 'react'
import { Btn, Empty, Field, Panel, RowActions, inputCls } from '@/components/ui/kit'
import { DIARY_CATS, catInfo, fmtDate, lastDays, today, useStore, type Entry } from '@/lib/store'

export function DiaryForm({ onDone }: { onDone?: () => void }) {
  const { add } = useStore()
  const [date, setDate] = useState(today())
  const [cat, setCat] = useState('outros')
  const [text, setText] = useState('')
  const submit = () => {
    if (!text.trim()) return
    add('entries', { date, cat, text: text.trim() })
    setText('')
    onDone?.()
  }
  return (
    <div className="grid gap-3 sm:grid-cols-[150px_200px_1fr_auto] sm:items-end">
      <Field label="Dia"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Área">
        <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}>
          {DIARY_CATS.map((c) => <option key={c.id} value={c.id} className="bg-neutral-900">{c.icon} {c.label}</option>)}
        </select>
      </Field>
      <Field label="O que eu fiz">
        <input className={inputCls} value={text} placeholder="Ex.: gravei o vídeo, li 20 páginas…" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </Field>
      <Btn variant="primary" onClick={submit}>Registrar</Btn>
    </div>
  )
}

function EntryRow({ e }: { e: Entry }) {
  const { edit, remove } = useStore()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(e.text)
  const [cat, setCat] = useState(e.cat)
  if (editing)
    return (
      <div className="flex flex-wrap gap-2">
        <select className={`${inputCls} !w-auto`} value={cat} onChange={(x) => setCat(x.target.value)}>
          {DIARY_CATS.map((c) => <option key={c.id} value={c.id} className="bg-neutral-900">{c.icon} {c.label}</option>)}
        </select>
        <input className={`${inputCls} min-w-0 flex-1`} value={text} onChange={(x) => setText(x.target.value)} />
        <Btn variant="primary" onClick={() => { edit('entries', e.id, { text, cat }); setEditing(false) }}>Salvar</Btn>
        <Btn onClick={() => setEditing(false)}>Cancelar</Btn>
      </div>
    )
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm text-white/90"><span className="mr-2">{catInfo(e.cat).icon}</span>{e.text}</p>
      <RowActions onEdit={() => setEditing(true)} onDelete={() => remove('entries', e.id)} />
    </div>
  )
}

export default function DiaryTab() {
  const { data } = useStore()
  const days = lastDays(30).reverse()
  return (
    <div className="space-y-4">
      <Panel title="Registrar o dia"><DiaryForm /></Panel>
      <Panel title="Últimos 30 dias">
        {data.entries.length === 0 && <Empty>Nada registrado ainda. Anote o que você fez hoje acima.</Empty>}
        <div className="mt-3 space-y-2">
          {days.map((d) => {
            const list = data.entries.filter((e) => e.date === d)
            return (
              <div key={d} className={`rounded-xl border p-3 ${list.length ? 'border-white/10 bg-white/[0.03]' : 'border-white/5 opacity-50'}`}>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-500/90">
                  <span>{d === today() ? 'Hoje · ' : ''}{fmtDate(d)}</span>
                  <span className="text-white/30">{list.length ? `${list.length} registro(s)` : 'sem registro'}</span>
                </div>
                <div className="space-y-1.5">{list.map((e) => <EntryRow key={e.id} e={e} />)}</div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
