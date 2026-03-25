'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PenSquare } from 'lucide-react'
import PostList from './PostList'
import Sidebar from '@/components/layout/Sidebar'
import type { Post, CategoryEnum } from '@/types/supabase'

const SORT_TABS = [
  { key: 'latest', label: '최신순' },
  { key: 'hot', label: '인기순' },
  { key: 'likes', label: '추천순' },
] as const

interface CategoryPageClientProps {
  category: CategoryEnum
  categoryLabel: string
  categoryDesc: string
  initialPosts: Post[]
  hotPosts: Post[]
}

export default function CategoryPageClient({
  category,
  categoryLabel,
  categoryDesc,
  initialPosts,
  hotPosts,
}: CategoryPageClientProps) {
  const [sort, setSort] = useState<'latest' | 'hot' | 'likes'>('latest')

  return (
    <div className="flex gap-6">
      {/* 메인 */}
      <div className="flex-1 min-w-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{categoryLabel}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{categoryDesc}</p>
          </div>
          <Link
            href="/posts/write"
            className="flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            <PenSquare size={15} />
            글쓰기
          </Link>
        </div>

        {/* 정렬 탭 */}
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          {SORT_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSort(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                sort === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <PostList
          category={category}
          initialPosts={sort === 'latest' ? initialPosts : []}
          sort={sort}
        />
      </div>

      {/* 사이드바 (데스크탑) */}
      <div className="hidden lg:block">
        <Sidebar hotPosts={hotPosts} />
      </div>
    </div>
  )
}
