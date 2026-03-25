import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Hash } from 'lucide-react'

export default async function PopularTags() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('tags')
    .eq('status', 'published')
    .limit(200)

  if (!posts?.length) return null

  const tagCount: Record<string, number> = {}
  posts.forEach(p => {
    (p.tags ?? []).forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1
    })
  })

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }))

  if (topTags.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Hash size={13} className="text-gray-400 dark:text-gray-600" />
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">인기 태그</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {topTags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tag/${encodeURIComponent(tag)}`}
            className="group flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <span>#{tag}</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-600 group-hover:text-indigo-400">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
