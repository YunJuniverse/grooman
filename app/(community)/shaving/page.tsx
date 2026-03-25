import type { Metadata } from 'next'
import CategoryPageClient from '@/components/posts/CategoryPageClient'
import { getPostsByCategory, getHotPosts } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: '쉐이빙',
  description: '면도기 리뷰, 쉐이빙폼 비교, 올바른 면도 방법. 그루맨 쉐이빙 게시판.',
}

export const revalidate = 60

export default async function ShavingPage() {
  const [initialPosts, hotPosts] = await Promise.all([
    getPostsByCategory('shaving'),
    getHotPosts(),
  ])

  return (
    <CategoryPageClient
      category="shaving"
      categoryLabel="쉐이빙"
      categoryDesc="면도기 리뷰, 쉐이빙폼 비교, 올바른 면도 방법"
      initialPosts={initialPosts}
      hotPosts={hotPosts}
    />
  )
}
