import type { Metadata } from 'next'
import CategoryPageClient from '@/components/posts/CategoryPageClient'
import { getPostsByCategory, getHotPosts } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: '핫딜·이벤트',
  description: '그루밍 제품 할인, 시술 이벤트 정보. 그루맨 핫딜 게시판.',
}

export const revalidate = 60

export default async function DealsPage() {
  const [initialPosts, hotPosts] = await Promise.all([
    getPostsByCategory('deals'),
    getHotPosts(),
  ])

  return (
    <CategoryPageClient
      category="deals"
      categoryLabel="핫딜·이벤트"
      categoryDesc="그루밍 제품 할인, 시술 이벤트 정보"
      initialPosts={initialPosts}
      hotPosts={hotPosts}
    />
  )
}
