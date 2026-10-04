'use client'

import { useState } from 'react'
import { Bar, Btn, Empty, Field, Panel, RowActions, inputCls } from '@/components/ui/kit'
import { today, useStore, type Project } from '@/lib/store'

const COLS: { id: Project['status']; label: string }[] = [
  { id: 'todo', label: '📝 A fazer' },
  { id: 'doing', label: '🔨 Fazendo' },
  { id: 'done', label: '✅ Concluídos' },
]

function Card({ p }: { p: Project }) {
  const { edit, remove } = useStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(p.name)
  const [notes, setNotes] = useState(p.notes)
  const setStatus = (status: Project['status']) =>
    edit('projects', p.id, status === 'done' ? { status, progress: 100, doneAt: today() } : { status, doneAt: undefined, progress: p.progress === 100 ? 90 : p.progress })
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      {editing ? (
        <div className="space-y-2">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex gap-2"><Btn variant="primary" onClick={() => { edit('projects', p.id, { name, notes }); setEditing(false) }}>Salvar</Btn><Btn onClick={() => setEditing(false)}>Cancelar</Btn></div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><div className="font-medium">{p.name}</div>{p.notes && <div className="mt-0.5 whitespace-pre-wrap text-xs text-white/50">{p.notes}</div>}</div>
          <RowActions onEdit={() => setEditing(true)} onDelete={() => remove('projects', p.id)} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Bar value={p.progress} max={100} color={p.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'} />
        <span className="w-10 text-right text-xs text-white/60">{p.progress}%</span>
      </div>
      <input type="range" min={0} max={100} step={5} value={p.progress} disabled={p.status === 'done'} className="w-full accent-amber-500" onChange={(e) => edit('projects', p.id, { progress: +e.target.value })} />
      <div className="flex gap-1">
        {COLS.filter((c) => c.id !== p.status).map((c) => <button key={c.id} onClick={() => setStatus(c.id)} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10">→ {c.label}</button>)}
      </div>
    </div>
  )
}

export default function ProjectsTab() {
  const { data, add } = useStore()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const submit = () => {
    if (!name.trim()) return
    add('projects', { name: name.trim(), notes: notes.trim(), status: 'todo', progress: 0 })
    setName(''); setNotes('')
  }
  return (
    <div className="space-y-4">
      <Panel title="Novo projeto">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Nome"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <Field label="Notas"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <Btn variant="primary" onClick={submit}>Adicionar</Btn>
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-3">
        {COLS.map((c) => {
          const list = data.projects.filter((p) => p.status === c.id)
          return (
            <Panel key={c.id} title={`${c.label} (${list.length})`}>
              <div className="space-y-3">{list.length ? list.map((p) => <Card key={p.id} p={p} />) : <Empty>Vazio</Empty>}</div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
