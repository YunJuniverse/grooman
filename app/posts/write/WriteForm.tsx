'use client'
import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { createPost } from '@/app/posts/actions'
import type { CategoryEnum } from '@/types/supabase'
import { Loader2 } from 'lucide-react'

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false })

const CATEGORIES: { value: CategoryEnum; label: string }[] = [
  { value: 'hair', label: '헤어케어·탈모' },
  { value: 'skin', label: '스킨케어' },
  { value: 'shaving', label: '쉐이빙' },
  { value: 'fragrance', label: '향수' },
  { value: 'clinic', label: '시술·성형 후기' },
  { value: 'deals', label: '핫딜·이벤트' },
]

export default function WriteForm() {
  const [content, setContent] = useState<Record<string, unknown>>({})
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('content', JSON.stringify(content))

    startTransition(async () => {
      try {
        await createPost(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
        <select
          name="category"
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        >
          <option value="">선택하세요</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
        <input
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={200}
          placeholder="제목을 입력하세요 (5~200자)"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
        <TiptapEditor onChange={setContent} storageKey="grooman_write_draft" />
      </div>

      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분, 최대 5개)</label>
        <input
          name="tags"
          type="text"
          placeholder="탈모, 샴푸, 모발이식"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-6 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg disabled:opacity-60 transition"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          발행하기
        </button>
      </div>
    </form>
  )
}
