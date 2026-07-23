'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Droplets, Zap, Wind, Stethoscope, Tag, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Post } from '@/types/supabase'

const CATEGORIES = [
  { slug: 'hair',      label: '헤어케어·탈모', icon: Scissors,      color: 'text-amber-600 dark:text-amber-400'   },
  { slug: 'skin',      label: '스킨케어',       icon: Droplets,      color: 'text-sky-600 dark:text-sky-400'       },
  { slug: 'shaving',   label: '쉐이빙',         icon: Zap,           color: 'text-violet-600 dark:text-violet-400' },
  { slug: 'fragrance', label: '향수',           icon: Wind,          color: 'text-pink-600 dark:text-pink-400'     },
  { slug: 'clinic',    label: '시술·성형',      icon: Stethoscope,   color: 'text-emerald-600 dark:text-emerald-400' },
  { slug: 'deals',     label: '핫딜·이벤트',   icon: Tag,           color: 'text-red-600 dark:text-red-400'       },
]

interface SidebarProps {
  hotPosts?: Post[]
  className?: string
}

export default function Sidebar({ hotPosts = [], className }: SidebarProps) {
  const pathname = usePathname()
  const currentCategory = pathname.split('/')[1]

  return (
    <aside className={cn('w-56 flex-shrink-0 space-y-4', className)}>
      {/* 카테고리 */}
      <nav className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border-sub)]">
          <h2 className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-widest">카테고리</h2>
        </div>
        <ul>
          {CATEGORIES.map(({ slug, label, icon: Icon, color }) => {
            const active = currentCategory === slug
            return (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-[var(--text-2)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-1)]'
                  )}
                >
                  <Icon size={14} className={cn('flex-shrink-0', active ? 'text-white' : color)} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 지금 인기 */}
      {hotPosts.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border-sub)] flex items-center gap-2">
            <TrendingUp size={12} className="text-orange-500" />
            <h2 className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-widest">지금 인기</h2>
          </div>
          <ul className="divide-y divide-[var(--border-sub)]">
            {hotPosts.slice(0, 5).map((post, i) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors group"
                >
                  <span className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-md text-xs font-black flex items-center justify-center mt-0.5',
                    i === 0 ? 'bg-orange-500 text-white' :
                    i === 1 ? 'bg-orange-400 text-white' :
                    i === 2 ? 'bg-orange-300 text-white' :
                    'bg-[var(--border)] text-[var(--text-3)]'
                  )}>
                    {i + 1}
                  </span>
                  <span className="text-xs text-[var(--text-2)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
