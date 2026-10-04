'use client'

import { useEffect, useState } from 'react'
import AgenticFactory3D from '@/components/ui/agentic-factory-3d'
import { StoreProvider, useStore } from '@/lib/store'
import Dashboard from '@/components/tabs/dashboard'
import DiaryTab from '@/components/tabs/diary'
import FinanceTab from '@/components/tabs/finance'
import GymTab from '@/components/tabs/gym'
import ReadingTab from '@/components/tabs/reading'
import ProjectsTab from '@/components/tabs/projects'
import ContentTab from '@/components/tabs/content'
import GoalsTab from '@/components/tabs/goals'

const TABS = [
  { id: 'painel', label: '🎮 Painel' },
  { id: 'diario', label: '📓 Diário' },
  { id: 'financas', label: '💰 Finanças' },
  { id: 'academia', label: '💪 Academia' },
  { id: 'leitura', label: '📚 Leitura' },
  { id: 'projetos', label: '🛠️ Projetos' },
  { id: 'conteudo', label: '🎬 Conteúdo' },
  { id: 'metas', label: '🏆 Metas' },
]

function Backup() {
  const { data, reset, replace } = useStore()
  return (
    <div className="flex flex-wrap justify-center gap-3 py-8 text-xs text-white/40">
      <button className="hover:text-white" onClick={() => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
        a.download = `life-os-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
      }}>⬇ Exportar backup</button>
      <label className="cursor-pointer hover:text-white">⬆ Importar backup
        <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) try { replace(JSON.parse(await f.text())) } catch { alert('Arquivo inválido') }
          e.target.value = ''
        }} />
      </label>
      <button className="hover:text-red-300" onClick={() => confirm('Apagar TODOS os dados?') && reset()}>🗑 Apagar tudo</button>
    </div>
  )
}

function App() {
  const [tab, setTab] = useState('painel')
  useEffect(() => {
    const h = location.hash.slice(1)
    if (TABS.some((t) => t.id === h)) setTab(h)
  }, [])
  const go = (t: string) => {
    setTab(t)
    history.replaceState(null, '', `#${t}`)
    window.scrollTo({ top: 0 })
  }
  return (
    <>
      <div className="fixed inset-0 z-0"><AgenticFactory3D embed height="100%" /></div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <main className="pointer-events-none relative z-10 min-h-screen">
        <div className="pointer-events-auto mx-auto w-full max-w-5xl px-3 pb-10 pt-4 sm:px-6 lg:mx-0 lg:ml-[max(1.5rem,calc((100vw-80rem)/2))] lg:w-[62%]">
          <header className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight"><span className="text-amber-500">▲</span> Fábrica da Vida</h1>
            <span className="text-xs text-white/40">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </header>
          <nav className="sticky top-0 z-20 -mx-1 mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/70 p-1.5 backdrop-blur-md">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => go(t.id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${tab === t.id ? 'bg-amber-500 font-semibold text-black' : 'text-white/70 hover:bg-white/10'}`}>{t.label}</button>
            ))}
          </nav>
          {tab === 'painel' && <Dashboard go={go} />}
          {tab === 'diario' && <DiaryTab />}
          {tab === 'financas' && <FinanceTab />}
          {tab === 'academia' && <GymTab />}
          {tab === 'leitura' && <ReadingTab />}
          {tab === 'projetos' && <ProjectsTab />}
          {tab === 'conteudo' && <ContentTab />}
          {tab === 'metas' && <GoalsTab />}
          <Backup />
        </div>
      </main>
    </>
  )
}

export default function Home() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  )
}
