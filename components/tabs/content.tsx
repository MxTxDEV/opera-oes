'use client'

import { useState } from 'react'
import { Btn, Empty, Field, Panel, RowActions, Stat, inputCls } from '@/components/ui/kit'
import { addDays, fmtDate, inRange, today, useStore, type Post } from '@/lib/store'

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Shorts/Reels', 'X/Twitter', 'LinkedIn', 'Blog', 'Outro']
const STATUS: { id: Post['status']; label: string; cls: string }[] = [
  { id: 'ideia', label: '💡 Ideia', cls: 'bg-white/10 text-white/70' },
  { id: 'pronto', label: '🎬 Pronto p/ postar', cls: 'bg-amber-500/20 text-amber-300' },
  { id: 'postado', label: '🚀 Postado', cls: 'bg-emerald-500/20 text-emerald-300' },
]

export default function ContentTab() {
  const { data, add, edit, remove } = useStore()
  const blank = { date: today(), platform: 'Instagram', title: '', status: 'ideia' as Post['status'] }
  const [f, setF] = useState(blank)
  const [editId, setEditId] = useState<string | null>(null)
  const submit = () => {
    if (!f.title.trim()) return
    if (editId) edit('posts', editId, { ...f, title: f.title.trim() })
    else add('posts', { ...f, title: f.title.trim() })
    setEditId(null)
    setF({ ...blank, platform: f.platform })
  }
  const posted30 = data.posts.filter((p) => p.status === 'postado' && inRange(p.date, [addDays(today(), -29), today()])).length
  const sorted = [...data.posts].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Postados em 30 dias" value={posted30} />
        {STATUS.map((s) => <Stat key={s.id} label={s.label} value={data.posts.filter((p) => p.status === s.id).length} />)}
      </div>
      <Panel title={editId ? 'Editando conteúdo' : 'Novo conteúdo'}>
        <div className="grid gap-3 sm:grid-cols-[150px_160px_1fr_190px_auto] sm:items-end">
          <Field label="Data"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Plataforma">
            <select className={inputCls} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>{PLATFORMS.map((p) => <option key={p} className="bg-neutral-900">{p}</option>)}</select>
          </Field>
          <Field label="Título / ideia"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Post['status'] })}>{STATUS.map((s) => <option key={s.id} value={s.id} className="bg-neutral-900">{s.label}</option>)}</select>
          </Field>
          <div className="flex gap-2"><Btn variant="primary" onClick={submit}>{editId ? 'Salvar' : 'Adicionar'}</Btn>{editId && <Btn onClick={() => { setEditId(null); setF(blank) }}>✕</Btn>}</div>
        </div>
      </Panel>
      <Panel title="Pipeline de conteúdo">
        {sorted.length === 0 ? <Empty>Nenhum conteúdo ainda. Anote suas ideias!</Empty> : (
          <div className="space-y-2">
            {sorted.map((p) => {
              const st = STATUS.find((s) => s.id === p.status)!
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-white/50">{p.platform} · {fmtDate(p.date)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={p.status} onChange={(e) => edit('posts', p.id, { status: e.target.value as Post['status'], ...(e.target.value === 'postado' ? { date: today() } : {}) })} className={`rounded-md px-2 py-1 text-xs ${st.cls} bg-opacity-100`}>
                      {STATUS.map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.label}</option>)}
                    </select>
                    <RowActions onEdit={() => { setEditId(p.id); setF({ date: p.date, platform: p.platform, title: p.title, status: p.status }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onDelete={() => remove('posts', p.id)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
