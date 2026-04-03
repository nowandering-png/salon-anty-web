'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

type Tab = {
  id: string
  href: string
  label: string
  icon: string
}

const tabs: Tab[] = [
  { id: 'payslip',   href: '/dashboard',            label: '지급명세서', icon: '📄' },
  { id: 'employees', href: '/dashboard/employees',   label: '직원 관리',  icon: '👥' },
  { id: 'history',   href: '/dashboard/history',     label: '급여 이력',  icon: '📋' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  function isActive(tab: Tab) {
    if (tab.id === 'payslip') return pathname === '/dashboard'
    return pathname.startsWith(tab.href)
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-100">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex w-56 bg-navy-900 text-white flex-col shrink-0">
        <div className="px-5 py-6 border-b border-navy-700 flex items-center gap-3">
          <Image src="/logo.png" alt="살롱앤티" width={36} height={36} />
          <div>
            <h1 className="text-lg font-bold tracking-tight">살롱앤티</h1>
            <p className="text-xs text-navy-300 mt-0.5">Salon Anty</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(tab)
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-navy-700">
          <button
            onClick={signOut}
            className="text-xs text-navy-400 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
              isActive(tab)
                ? 'text-navy-700 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] text-slate-400"
        >
          <span className="text-lg">🚪</span>
          <span className="text-[10px] mt-0.5">로그아웃</span>
        </button>
      </nav>
    </div>
  )
}
