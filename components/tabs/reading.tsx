'use client'

import { useState } from 'react'
import { Btn, Empty, Field, Panel, RowActions, Stat, inputCls } from '@/components/ui/kit'
import { addDays, fmtDate, inRange, lastDays, today, useStore } from '@/lib/store'

export default function ReadingTab() {
  const { data, add, edit, remove } = useStore()
  const blank = { date: today(), book: '', pages: '' }
  const [f, setF] = useState(blank)
  const [editId, setEditId] = useState<string | null>(null)

  const submit = () => {
    const pages = parseInt(f.pages)
    if (!f.book.trim() || !pages || pages <= 0) return
    const item = { date: f.date, book: f.book.trim(), pages }
    if (editId) edit('readings', editId, item)
    else add('readings', item)
    setEditId(null)
    setF({ ...blank, date: f.date, book: f.book })
  }
  const r30 = data.readings.filter((r) => inRange(r.date, [addDays(today(), -29), today()]))
  const pages30 = r30.reduce((a, r) => a + r.pages, 0)
  const books = Object.entries(data.readings.reduce<Record<string, number>>((m, r) => ((m[r.book] = (m[r.book] ?? 0) + r.pages), m), {})).sort((a, b) => b[1] - a[1])
  const days = lastDays(30)
  const perDay = days.map((d) => data.readings.filter((r) => r.date === d).reduce((a, r) => a + r.pages, 0))
  const max = Math.max(1, ...perDay)
  const sorted = [...data.readings].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Páginas em 30 dias" value={pages30} />
        <Stat label="Média por dia" value={(pages30 / 30).toFixed(1)} />
        <Stat label="Livros" value={books.length} />
      </div>
      <Panel title={editId ? 'Editando leitura' : 'Registrar leitura'}>
        <div className="grid gap-3 sm:grid-cols-[150px_1fr_120px_auto] sm:items-end">
          <Field label="Data"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Livro"><input className={inputCls} list="books" value={f.book} onChange={(e) => setF({ ...f, book: e.target.value })} /></Field>
          <datalist id="books">{books.map(([b]) => <option key={b} value={b} />)}</datalist>
          <Field label="Páginas"><input inputMode="numeric" className={inputCls} value={f.pages} onChange={(e) => setF({ ...f, pages: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <div className="flex gap-2">
            <Btn variant="primary" onClick={submit}>{editId ? 'Salvar' : 'Registrar'}</Btn>
            {editId && <Btn onClick={() => { setEditId(null); setF(blank) }}>✕</Btn>}
          </div>
        </div>
      </Panel>
      <Panel title="Páginas por dia (30 dias)">
        <div className="flex h-24 items-end gap-1">
          {perDay.map((v, i) => <div key={days[i]} title={`${fmtDate(days[i])}: ${v} págs`} className="flex-1 rounded-t bg-sky-400/80" style={{ height: `${Math.max(v ? 8 : 2, (v / max) * 100)}%`, opacity: v ? 1 : 0.2 }} />)}
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Por livro">
          {books.length === 0 ? <Empty>Sem leituras.</Empty> : books.map(([b, p]) => (
            <div key={b} className="flex justify-between border-t border-white/5 py-2 text-sm first:border-0"><span>📖 {b}</span><span className="text-white/60">{p} págs</span></div>
          ))}
        </Panel>
        <Panel title="Histórico">
          {sorted.length === 0 ? <Empty>Sem leituras.</Empty> : sorted.slice(0, 30).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 border-t border-white/5 py-2 text-sm first:border-0">
              <span className="min-w-0 truncate"><span className="text-white/50">{fmtDate(r.date)}</span> · {r.book} · <b>{r.pages}</b> págs</span>
              <RowActions onEdit={() => { setEditId(r.id); setF({ date: r.date, book: r.book, pages: String(r.pages) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onDelete={() => remove('readings', r.id)} />
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}
