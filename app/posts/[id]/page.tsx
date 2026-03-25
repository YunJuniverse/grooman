import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostDetailClient from './PostDetailClient'
import RelatedPosts from '@/components/posts/RelatedPosts'
import AdBanner from '@/components/layout/AdBanner'
import type { Post } from '@/types/supabase'

interface Props {
  params: { id: string }
}

async function getPost(slug: string): Promise<Post | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!user_id(id, username, avatar_url, level, bio)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    return data as Post | null
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id)
  if (!post) return { title: '게시글을 찾을 수 없습니다' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grooman.kr'
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`

  return {
    title: post.title,
    description: post.ai_summary ?? post.content_text?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.ai_summary ?? '',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.profiles?.username ?? '익명'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.ai_summary ?? '',
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
  }
}

export default async function PostDetailPage({ params }: Props) {
  const post = await getPost(params.id)
  if (!post) notFound()

  // 조회수 증가 (비동기, 실패해도 무시)
  const supabase = createClient()
  supabase.from('posts').update({ view_count: post.view_count + 1 }).eq('id', post.id).then(() => {})

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.profiles?.username ?? '익명',
    },
    publisher: {
      '@type': 'Organization',
      name: '그루맨',
      url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grooman.kr',
    },
    description: post.ai_summary ?? post.content_text?.slice(0, 160),
    ...(post.thumbnail_url && { image: post.thumbnail_url }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient post={post} />
      <div className="mt-6">
        <AdBanner placement="banner" />
      </div>
      <RelatedPosts currentPostId={post.id} category={post.category} tags={post.tags} />
    </>
  )
}
