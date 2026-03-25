import type { Metadata } from 'next'
import CategoryPageClient from '@/components/posts/CategoryPageClient'
import { getPostsByCategory, getHotPosts } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: '향수',
  description: '향수 후기, 계절별 추천, 브랜드 정보. 그루맨 향수 게시판.',
}

export const revalidate = 60

export default async function FragrancePage() {
  const [initialPosts, hotPosts] = await Promise.all([
    getPostsByCategory('fragrance'),
    getHotPosts(),
  ])

  return (
    <CategoryPageClient
      category="fragrance"
      categoryLabel="향수"
      categoryDesc="향수 후기, 계절별 추천, 브랜드 정보"
      initialPosts={initialPosts}
      hotPosts={hotPosts}
    />
  )
}
