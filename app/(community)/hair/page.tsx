import type { Metadata } from 'next'
import CategoryPageClient from '@/components/posts/CategoryPageClient'
import { getPostsByCategory, getHotPosts } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: '헤어케어·탈모',
  description: '탈모 예방, 모발 관리, 모발이식 후기, 샴푸 성분 분석까지. 그루맨 헤어케어 게시판.',
}

export const revalidate = 60

export default async function HairPage() {
  const [initialPosts, hotPosts] = await Promise.all([
    getPostsByCategory('hair'),
    getHotPosts(),
  ])

  return (
    <CategoryPageClient
      category="hair"
      categoryLabel="헤어케어·탈모"
      categoryDesc="탈모 예방, 모발이식 후기, 샴푸 성분 분석"
      initialPosts={initialPosts}
      hotPosts={hotPosts}
    />
  )
}
