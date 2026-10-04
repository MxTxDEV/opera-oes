'use client'

import { useState } from 'react'
import { Bar, Btn, Empty, Field, Panel, RowActions, Stat, inputCls } from '@/components/ui/kit'
import { brl, fmtDate, today, useStore, type Tx } from '@/lib/store'

const OUT_CATS = ['Moradia', 'Mercado', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Assinaturas', 'Educação', 'Compras', 'Outros']
const IN_CATS = ['Salário', 'Freelance', 'Vendas', 'Investimentos', 'Outros']

export default function FinanceTab() {
  const { data, add, edit, remove } = useStore()
  const [month, setMonth] = useState(today().slice(0, 7))
  const blank = { date: today(), type: 'out' as Tx['type'], cat: 'Alimentação', desc: '', amount: '' }
  const [f, setF] = useState(blank)
  const [editId, setEditId] = useState<string | null>(null)

  const shift = (n: number) => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + n, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const list = data.txs.filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date))
  const inc = list.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0)
  const out = list.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0)
  const byCat = Object.entries(list.filter((t) => t.type === 'out').reduce<Record<string, number>>((m, t) => ((m[t.cat] = (m[t.cat] ?? 0) + t.amount), m), {})).sort((a, b) => b[1] - a[1])
  const total = data.txs.reduce((a, t) => a + (t.type === 'in' ? t.amount : -t.amount), 0)

  const submit = () => {
    const amount = parseFloat(String(f.amount).replace(',', '.'))
    if (!amount || amount <= 0) return
    const item = { date: f.date, type: f.type, cat: f.cat, desc: f.desc.trim(), amount }
    if (editId) edit('txs', editId, item)
    else add('txs', item)
    setEditId(null)
    setF({ ...blank, date: f.date, type: f.type, cat: f.cat })
  }
  const cats = f.type === 'out' ? OUT_CATS : IN_CATS

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Entradas do mês" value={brl(inc)} tone="good" />
        <Stat label="Saídas do mês" value={brl(out)} tone="bad" />
        <Stat label="Saldo do mês" value={brl(inc - out)} tone={inc - out >= 0 ? 'good' : 'bad'} />
        <Stat label="Saldo total acumulado" value={brl(total)} tone={total >= 0 ? 'good' : 'bad'} />
      </div>

      <Panel title={editId ? 'Editando lançamento' : 'Novo lançamento'}>
        <div className="grid gap-3 sm:grid-cols-6 sm:items-end">
          <Field label="Data"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Tipo">
            <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Tx['type'], cat: e.target.value === 'in' ? 'Salário' : 'Alimentação' })}>
              <option value="out" className="bg-neutral-900">Gasto</option>
              <option value="in" className="bg-neutral-900">Entrada</option>
            </select>
          </Field>
          <Field label="Categoria">
            <select className={inputCls} value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>
              {cats.map((c) => <option key={c} className="bg-neutral-900">{c}</option>)}
            </select>
          </Field>
          <Field label="Descrição"><input className={inputCls} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></Field>
          <Field label="Valor (R$)"><input inputMode="decimal" className={inputCls} value={f.amount} placeholder="0,00" onChange={(e) => setF({ ...f, amount: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
          <div className="flex gap-2">
            <Btn variant="primary" className="flex-1" onClick={submit}>{editId ? 'Salvar' : 'Adicionar'}</Btn>
            {editId && <Btn onClick={() => { setEditId(null); setF(blank) }}>✕</Btn>}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel
          title="Planilha do mês"
          right={
            <div className="flex items-center gap-2 text-sm">
              <Btn onClick={() => shift(-1)}>◀</Btn>
              <span className="w-28 text-center capitalize">{new Date(`${month}-01T12:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              <Btn onClick={() => shift(1)}>▶</Btn>
            </div>
          }
        >
          {list.length === 0 ? <Empty>Nenhum lançamento neste mês.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wider text-white/40">
                  <tr><th className="py-2">Data</th><th>Categoria</th><th>Descrição</th><th className="text-right">Valor</th><th /></tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="py-2 pr-2 text-white/60">{fmtDate(t.date)}</td>
                      <td className="pr-2">{t.cat}</td>
                      <td className="pr-2 text-white/70">{t.desc}</td>
                      <td className={`pr-2 text-right font-medium ${t.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'in' ? '+' : '−'}{brl(t.amount)}</td>
                      <td><RowActions onEdit={() => { setEditId(t.id); setF({ date: t.date, type: t.type, cat: t.cat, desc: t.desc, amount: String(t.amount) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onDelete={() => remove('txs', t.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title="Gastos por categoria">
          {byCat.length === 0 ? <Empty>Sem gastos.</Empty> : (
            <div className="space-y-3">
              {byCat.map(([c, v]) => (
                <div key={c}>
                  <div className="mb-1 flex justify-between text-sm"><span>{c}</span><span className="text-white/60">{brl(v)}</span></div>
                  <Bar value={v} max={byCat[0][1]} color="bg-red-400" />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
