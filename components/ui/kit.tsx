'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

export const inputCls =
  'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/70'

export function Panel({ title, right, children, className = '' }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

export function Btn({ variant = 'ghost', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const v = {
    primary: 'bg-amber-500 text-black hover:bg-amber-400 font-semibold',
    ghost: 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10',
    danger: 'bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20',
  }[variant]
  return <button {...p} className={`rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 ${v} ${className}`} />
}

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-white/45">{label}</span>
      {children}
    </label>
  )
}

export function Bar({ value, max, color = 'bg-amber-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/45">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white'}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </div>
  )
}

export const Empty = ({ children }: { children: ReactNode }) => (
  <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-white/40">{children}</p>
)

export function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      {onEdit && (
        <button onClick={onEdit} title="Editar" className="rounded-md px-2 py-1 text-xs text-white/50 hover:bg-white/10 hover:text-white">✏️</button>
      )}
      <button
        onClick={() => confirm('Apagar este item?') && onDelete()}
        title="Apagar"
        className="rounded-md px-2 py-1 text-xs text-white/50 hover:bg-red-500/20 hover:text-red-300"
      >🗑️</button>
    </div>
  )
}
