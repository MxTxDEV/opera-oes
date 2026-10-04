'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

// ---------- datas ----------
export const uid = () => Math.random().toString(36).slice(2, 10)
export const pad = (n: number) => String(n).padStart(2, '0')
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const today = () => toKey(new Date())
export const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (k: string, n: number) => {
  const d = parseKey(k)
  d.setDate(d.getDate() + n)
  return toKey(d)
}
export const lastDays = (n: number) => Array.from({ length: n }, (_, i) => addDays(today(), i - (n - 1)))
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtDate = (k: string) =>
  parseKey(k).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' })
export const inRange = (d: string, [s, e]: [string, string]) => d >= s && d <= e

// ---------- tipos ----------
export const DIARY_CATS = [
  { id: 'financas', label: 'Finanças', icon: '💰' },
  { id: 'saude', label: 'Saúde / Academia', icon: '💪' },
  { id: 'leitura', label: 'Leitura', icon: '📚' },
  { id: 'projetos', label: 'Projetos', icon: '🛠️' },
  { id: 'conteudo', label: 'Conteúdo', icon: '🎬' },
  { id: 'outros', label: 'Outros', icon: '✨' },
] as const
export const catInfo = (id: string) => DIARY_CATS.find((c) => c.id === id) ?? DIARY_CATS[5]

export type Entry = { id: string; date: string; cat: string; text: string }
export type Tx = { id: string; date: string; type: 'in' | 'out'; cat: string; desc: string; amount: number }
export type Workout = { id: string; date: string; kind: string; minutes: number; notes: string; weight?: number }
export type Reading = { id: string; date: string; book: string; pages: number }
export type Project = {
  id: string
  name: string
  status: 'todo' | 'doing' | 'done'
  progress: number
  notes: string
  doneAt?: string
}
export type Post = { id: string; date: string; platform: string; title: string; status: 'ideia' | 'pronto' | 'postado' }

export type Metric =
  | 'diary_days'
  | 'workouts'
  | 'workout_minutes'
  | 'pages'
  | 'posts'
  | 'saved'
  | 'expenses'
  | 'projects_done'
export const METRICS: Record<Metric, { label: string; unit: string; money?: boolean }> = {
  diary_days: { label: 'Dias com registro no diário', unit: 'dias' },
  workouts: { label: 'Treinos feitos', unit: 'treinos' },
  workout_minutes: { label: 'Minutos de treino', unit: 'min' },
  pages: { label: 'Páginas lidas', unit: 'págs' },
  posts: { label: 'Posts publicados', unit: 'posts' },
  saved: { label: 'Dinheiro guardado (entradas − saídas)', unit: '', money: true },
  expenses: { label: 'Gastos no período', unit: '', money: true },
  projects_done: { label: 'Projetos concluídos', unit: 'projetos' },
}

export type Goal = {
  id: string
  title: string
  metric: Metric
  cmp: 'gte' | 'lte'
  target: number
  period: 'week' | 'month'
  xp: number
  reward: string
  penalty: string
  createdAt: string
  claimed: Record<string, boolean>
}

export type Data = {
  entries: Entry[]
  txs: Tx[]
  workouts: Workout[]
  readings: Reading[]
  projects: Project[]
  posts: Post[]
  goals: Goal[]
}
export type Coll = keyof Data

const mkGoal = (g: Omit<Goal, 'id' | 'createdAt' | 'claimed'>): Goal => ({
  ...g,
  id: uid(),
  createdAt: today(),
  claimed: {},
})
export const defaultGoals = (): Goal[] => [
  mkGoal({ title: 'Registrar o dia, quase todo dia', metric: 'diary_days', cmp: 'gte', target: 6, period: 'week', xp: 60, reward: 'Um lanche/comida que eu gosto', penalty: 'Um dia sem redes sociais' }),
  mkGoal({ title: 'Treinar na academia', metric: 'workouts', cmp: 'gte', target: 4, period: 'week', xp: 100, reward: 'Episódio extra da série favorita', penalty: 'Treino extra no sábado' }),
  mkGoal({ title: 'Ler 100 páginas', metric: 'pages', cmp: 'gte', target: 100, period: 'week', xp: 80, reward: 'Comprar um livro novo', penalty: 'Sem videogame/streaming por 1 dia' }),
  mkGoal({ title: 'Publicar 2 posts', metric: 'posts', cmp: 'gte', target: 2, period: 'week', xp: 80, reward: 'Sair para um café', penalty: 'Gravar 1 conteúdo extra' }),
  mkGoal({ title: 'Guardar dinheiro no mês', metric: 'saved', cmp: 'gte', target: 500, period: 'month', xp: 200, reward: 'Presente de R$ 50 para mim', penalty: 'Congelar compras não essenciais por 7 dias' }),
  mkGoal({ title: 'Segurar os gastos', metric: 'expenses', cmp: 'lte', target: 2500, period: 'month', xp: 150, reward: 'Jantar fora', penalty: 'Cortar delivery por 1 semana' }),
  mkGoal({ title: 'Concluir 1 projeto', metric: 'projects_done', cmp: 'gte', target: 1, period: 'month', xp: 250, reward: 'Um dia livre sem culpa', penalty: 'Acordar mais cedo toda a próxima semana' }),
  mkGoal({ title: 'Publicar 8 posts no mês', metric: 'posts', cmp: 'gte', target: 8, period: 'month', xp: 200, reward: 'Equipamento/acessório de criação', penalty: 'Fim de semana dedicado a criar conteúdo' }),
]
const emptyData = (): Data => ({
  entries: [], txs: [], workouts: [], readings: [], projects: [], posts: [], goals: defaultGoals(),
})

// ---------- períodos / metas ----------
export function periodKey(p: 'week' | 'month', date: string) {
  if (p === 'month') return date.slice(0, 7)
  return addDays(date, -((parseKey(date).getDay() + 6) % 7))
}
export function periodRange(p: 'week' | 'month', key: string): [string, string] {
  if (p === 'week') return [key, addDays(key, 6)]
  const [y, m] = key.split('-').map(Number)
  return [`${key}-01`, `${key}-${pad(new Date(y, m, 0).getDate())}`]
}
export function nextPeriodKey(p: 'week' | 'month', key: string) {
  if (p === 'week') return addDays(key, 7)
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}
export function periodLabel(p: 'week' | 'month', key: string) {
  const [s, e] = periodRange(p, key)
  if (p === 'month') return parseKey(s).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const f = (k: string) => parseKey(k).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${f(s)} – ${f(e)}`
}

export function measure(data: Data, metric: Metric, r: [string, string]) {
  switch (metric) {
    case 'diary_days':
      return new Set(data.entries.filter((e) => inRange(e.date, r)).map((e) => e.date)).size
    case 'workouts':
      return data.workouts.filter((w) => inRange(w.date, r)).length
    case 'workout_minutes':
      return data.workouts.filter((w) => inRange(w.date, r)).reduce((a, w) => a + w.minutes, 0)
    case 'pages':
      return data.readings.filter((x) => inRange(x.date, r)).reduce((a, x) => a + x.pages, 0)
    case 'posts':
      return data.posts.filter((p) => p.status === 'postado' && inRange(p.date, r)).length
    case 'saved':
      return data.txs.filter((t) => inRange(t.date, r)).reduce((a, t) => a + (t.type === 'in' ? t.amount : -t.amount), 0)
    case 'expenses':
      return data.txs.filter((t) => t.type === 'out' && inRange(t.date, r)).reduce((a, t) => a + t.amount, 0)
    case 'projects_done':
      return data.projects.filter((p) => p.doneAt && inRange(p.doneAt, r)).length
  }
}

export type PeriodResult = { key: string; value: number; status: 'won' | 'lost' | 'active' }
export function goalPeriods(g: Goal, data: Data): PeriodResult[] {
  const cur = periodKey(g.period, today())
  const out: PeriodResult[] = []
  let k = periodKey(g.period, g.createdAt)
  for (let i = 0; i < 60 && k <= cur; i++) {
    const value = measure(data, g.metric, periodRange(g.period, k))
    const ok = g.cmp === 'gte' ? value >= g.target : value <= g.target
    out.push({ key: k, value, status: k === cur ? 'active' : ok ? 'won' : 'lost' })
    k = nextPeriodKey(g.period, k)
  }
  return out
}
export const goalMet = (g: Goal, v: number) => (g.cmp === 'gte' ? v >= g.target : v <= g.target)

// ---------- XP / nível ----------
export function activityDays(data: Data) {
  const s = new Set<string>()
  data.entries.forEach((e) => s.add(e.date))
  data.workouts.forEach((e) => s.add(e.date))
  data.readings.forEach((e) => s.add(e.date))
  data.posts.filter((p) => p.status === 'postado').forEach((e) => s.add(e.date))
  data.txs.forEach((e) => s.add(e.date))
  return s
}
export function streak(data: Data) {
  const days = activityDays(data)
  let k = today()
  if (!days.has(k)) k = addDays(k, -1)
  let n = 0
  while (days.has(k)) {
    n++
    k = addDays(k, -1)
  }
  return n
}
export function computeXp(data: Data) {
  let xp = 0
  xp += new Set(data.entries.map((e) => e.date)).size * 15
  xp += data.workouts.length * 40
  xp += Math.floor(data.readings.reduce((a, r) => a + r.pages, 0) / 5)
  xp += data.posts.filter((p) => p.status === 'postado').length * 50
  xp += data.projects.filter((p) => p.status === 'done').length * 150
  xp += Math.min(data.txs.length, 200) * 3
  for (const g of data.goals)
    for (const p of goalPeriods(g, data)) {
      if (p.status === 'won') xp += g.xp
      if (p.status === 'lost') xp -= Math.round(g.xp / 2)
    }
  return Math.max(0, xp)
}
export const TITLES = ['Novato', 'Aprendiz', 'Operário', 'Mecânico', 'Engenheiro', 'Mestre de Fábrica', 'Arquiteto', 'Lenda']
export function levelInfo(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 60)) + 1
  const floor = 60 * (level - 1) ** 2
  const next = 60 * level ** 2
  return { level, title: TITLES[Math.min(level - 1, TITLES.length - 1)], into: xp - floor, need: next - floor, pct: (xp - floor) / (next - floor) }
}

// ---------- store ----------
const KEY = 'life-os-v1'
type Ctx = {
  data: Data
  add: <K extends Coll>(k: K, item: Omit<Data[K][number], 'id'>) => void
  edit: <K extends Coll>(k: K, id: string, patch: Partial<Data[K][number]>) => void
  remove: (k: Coll, id: string) => void
  reset: () => void
  replace: (d: Data) => void
}
const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(emptyData)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setData({ ...emptyData(), ...JSON.parse(raw) })
    } catch {}
    setReady(true)
  }, [])
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {}
  }, [data, ready])

  const add = useCallback<Ctx['add']>((k, item) => {
    setData((d) => ({ ...d, [k]: [...(d[k] as unknown[]), { ...item, id: uid() }] }))
  }, [])
  const edit = useCallback<Ctx['edit']>((k, id, patch) => {
    setData((d) => ({ ...d, [k]: (d[k] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  }, [])
  const remove = useCallback<Ctx['remove']>((k, id) => {
    setData((d) => ({ ...d, [k]: (d[k] as { id: string }[]).filter((x) => x.id !== id) }))
  }, [])
  const reset = useCallback(() => setData(emptyData()), [])
  const replace = useCallback((d: Data) => setData({ ...emptyData(), ...d }), [])

  const value = useMemo(() => ({ data, add, edit, remove, reset, replace }), [data, add, edit, remove, reset, replace])
  if (!ready) return null
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider ausente')
  return c
}
