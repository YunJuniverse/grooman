'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Search, Flame, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { href: '/',      label: '홈',    icon: Home      },
  { href: '/hair',  label: '카테고리', icon: LayoutGrid },
  { href: '/search',label: '검색',  icon: Search    },
  { href: '/',      label: 'HOT',   icon: Flame, isHot: true },
  { href: '/my',    label: '내정보', icon: User      },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)]/95 glass border-t border-[var(--border)] safe-area-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon, isHot }) => {
          const resolvedHref = label === '내정보' && !user ? '/login' : href
          const active = resolvedHref === '/'
            ? pathname === '/'
            : pathname.startsWith(resolvedHref) && resolvedHref !== '/'

          return (
            <Link
              key={label}
              href={resolvedHref}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[11px] font-medium transition-colors',
                active
                  ? isHot ? 'text-orange-500' : 'text-[var(--accent)]'
                  : isHot
                    ? 'text-orange-400 dark:text-orange-500 hover:text-orange-500'
                    : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
