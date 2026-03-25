import type { Metadata } from 'next'
import CategoryPageClient from '@/components/posts/CategoryPageClient'
import { getPostsByCategory, getHotPosts } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: '시술·성형 후기',
  description: '모발이식, 피부 시술, 윤곽 수술 실사 후기. UGC 기반 신뢰 정보. 그루맨 클리닉 게시판.',
}

export const revalidate = 60

export default async function ClinicPage() {
  const [initialPosts, hotPosts] = await Promise.all([
    getPostsByCategory('clinic'),
    getHotPosts(),
  ])

  return (
    <CategoryPageClient
      category="clinic"
      categoryLabel="시술·성형 후기"
      categoryDesc="모발이식, 피부 시술, 윤곽 수술 실사 후기 (UGC 전용)"
      initialPosts={initialPosts}
      hotPosts={hotPosts}
    />
  )
}
