'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, FormEvent } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { Search, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import NotificationBell from './NotificationBell'

const LEVEL_LABELS = ['', '새내기', '그루머', '단골', '장인', '마스터']
const LEVEL_COLORS = [
  '',
  'bg-gray-100  dark:bg-gray-700  text-gray-600  dark:text-gray-300',
  'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300',
  'bg-blue-100  dark:bg-blue-800  text-blue-700  dark:text-blue-300',
  'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300',
  'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300',
]

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-[var(--text-3)] hover:bg-[var(--border-sub)] hover:text-[var(--text-1)] transition"
      aria-label="테마 전환"
    >
      {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

export default function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-card)]/90 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
        {/* 로고 */}
        <Link href="/" className="flex-shrink-0 font-black text-lg tracking-tighter text-[var(--text-1)]">
          GROOMAN
        </Link>

        {/* 검색창 (데스크탑) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm ml-4">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="그루밍 정보 검색..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-card)] text-[var(--text-1)] placeholder:text-[var(--text-3)] transition"
            />
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        {/* 모바일 검색 버튼 */}
        <button
          className="md:hidden p-2 rounded-lg text-[var(--text-3)] hover:bg-[var(--border-sub)] transition"
          onClick={() => setShowMobileSearch(v => !v)}
          aria-label="검색"
        >
          {showMobileSearch ? <X size={20} /> : <Search size={20} />}
        </button>

        {/* 다크모드 토글 */}
        <ThemeToggle />

        {/* 우측 영역 */}
        {!loading && (
          user && profile ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <NotificationBell userId={user.id} />
              <Link href="/my" className="flex items-center gap-2 group">
                <div className="relative w-8 h-8 rounded-full bg-[var(--border)] overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-[var(--accent)]/40 transition">
                  {profile.avatar_url
                    ? <Image src={profile.avatar_url} alt={profile.username} fill sizes="32px" className="object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-xs text-[var(--text-2)] font-bold">
                        {profile.username[0].toUpperCase()}
                      </span>
                  }
                </div>
                <span className="hidden sm:block text-sm font-medium text-[var(--text-1)]">{profile.username}</span>
                <span className={cn('hidden sm:block text-[10px] px-1.5 py-0.5 rounded font-semibold', LEVEL_COLORS[profile.level])}>
                  {LEVEL_LABELS[profile.level]}
                </span>
              </Link>
              <button
                onClick={signOut}
                className="hidden sm:block text-xs text-[var(--text-3)] hover:text-[var(--text-1)] px-2 py-1 rounded transition"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 px-4 py-1.5 rounded-full transition"
            >
              로그인
            </Link>
          )
        )}
      </div>

      {/* 모바일 검색창 */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="그루밍 정보 검색..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-card)] text-[var(--text-1)] placeholder:text-[var(--text-3)] transition"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  )
}
