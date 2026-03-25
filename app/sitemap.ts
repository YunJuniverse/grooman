import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grooman.kr'

const STATIC_PAGES = [
  { url: '/', changeFrequency: 'daily' as const, priority: 1.0 },
  { url: '/hair', changeFrequency: 'hourly' as const, priority: 0.9 },
  { url: '/skin', changeFrequency: 'hourly' as const, priority: 0.9 },
  { url: '/shaving', changeFrequency: 'hourly' as const, priority: 0.9 },
  { url: '/fragrance', changeFrequency: 'hourly' as const, priority: 0.9 },
  { url: '/clinic', changeFrequency: 'hourly' as const, priority: 0.9 },
  { url: '/deals', changeFrequency: 'hourly' as const, priority: 0.9 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(5000)

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
    url: `${SITE_URL}${page.url}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    lastModified: new Date(),
  }))

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map(post => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    lastModified: new Date(post.updated_at),
  }))

  return [...staticEntries, ...postEntries]
}
