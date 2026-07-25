'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

// 검색 페이지 본문 검색창. 헤더 아이콘으로만 검색을 열 수 있던 흐름 단절을 해소
// (user-ux-diagnosis-2026-07-24.md §3). 헤더 폼과 동일한 /search?q= 라우팅.
export default function SearchBox({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q.length >= 2) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="그루밍 정보 검색... (2자 이상)"
          aria-label="검색어"
          autoFocus={!initialQuery}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-card)] text-[var(--text-1)] placeholder:text-[var(--text-3)] transition"
        />
      </div>
    </form>
  )
}
