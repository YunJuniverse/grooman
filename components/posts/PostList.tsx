'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostCard from './PostCard'
import { PostListSkeleton } from './PostCardSkeleton'
import type { Post, CategoryEnum } from '@/types/supabase'

interface PostListProps {
  category?: CategoryEnum
  initialPosts?: Post[]
  sort?: 'latest' | 'hot' | 'likes'
  showCategory?: boolean
}

const PAGE_SIZE = 20

export default function PostList({
  category,
  initialPosts = [],
  sort = 'latest',
  showCategory = false,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(initialPosts.length === 0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, profiles!user_id(id, username, avatar_url, level)')
      .eq('status', 'published')
      .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)

    if (category) query = query.eq('category', category)

    if (sort === 'hot') query = query.order('hot_rank', { ascending: false })
    else if (sort === 'likes') query = query.order('like_count', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data } = await query
    if (data) {
      setPosts(prev => pageNum === 1 ? data as Post[] : [...prev, ...data as Post[]])
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
    setInitialLoading(false)
  }, [category, sort])

  useEffect(() => {
    if (initialPosts.length === 0) fetchPosts(1)
  }, [category, sort])

  useEffect(() => {
    if (!sentinelRef.current) return
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1
        setPage(next)
        fetchPosts(next)
      }
    }, { rootMargin: '200px' })
    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loading, page, fetchPosts])

  if (initialLoading) return <PostListSkeleton count={5} />

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">아직 게시글이 없습니다.</p>
        <p className="text-xs mt-1">첫 번째 글을 작성해보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <PostCard key={post.id} post={post} showCategory={showCategory} />
      ))}
      <div ref={sentinelRef} className="h-4" />
      {loading && <PostListSkeleton count={3} />}
    </div>
  )
}
