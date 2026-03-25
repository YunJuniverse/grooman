import type { Metadata } from 'next'
import CategoryPageClient from '@/components/posts/CategoryPageClient'
import { getPostsByCategory, getHotPosts } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: '스킨케어',
  description: '남성 스킨케어 루틴, 성분 리뷰, 계절별 추천. 그루맨 스킨케어 게시판.',
}

export const revalidate = 60

export default async function SkinPage() {
  const [initialPosts, hotPosts] = await Promise.all([
    getPostsByCategory('skin'),
    getHotPosts(),
  ])

  return (
    <CategoryPageClient
      category="skin"
      categoryLabel="스킨케어"
      categoryDesc="남성 스킨케어 루틴, 성분 리뷰, 계절별 추천"
      initialPosts={initialPosts}
      hotPosts={hotPosts}
    />
  )
}
