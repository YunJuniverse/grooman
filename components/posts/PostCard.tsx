import Link from 'next/link'
import Image from 'next/image'
import { Eye, ThumbsUp, MessageSquare } from 'lucide-react'
import { relativeTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { Post } from '@/types/supabase'

const CATEGORY_LABELS: Record<string, string> = {
  hair: '헤어케어·탈모', skin: '스킨케어', shaving: '쉐이빙',
  fragrance: '향수', clinic: '시술·성형', deals: '핫딜',
}

// 라이트/다크 양쪽에서 모두 잘 보이는 색상 조합
const CATEGORY_COLORS: Record<string, string> = {
  hair:      'bg-amber-100  dark:bg-amber-900/40  text-amber-800  dark:text-amber-300',
  skin:      'bg-sky-100    dark:bg-sky-900/40    text-sky-800    dark:text-sky-300',
  shaving:   'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300',
  fragrance: 'bg-pink-100   dark:bg-pink-900/40   text-pink-800   dark:text-pink-300',
  clinic:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
  deals:     'bg-red-100    dark:bg-red-900/40    text-red-800    dark:text-red-300',
}

const LEVEL_LABELS = ['', '새내기', '그루머', '단골', '장인', '마스터']
const LEVEL_COLORS = [
  '',
  'bg-gray-100  dark:bg-gray-700  text-gray-600  dark:text-gray-300',
  'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300',
  'bg-blue-100  dark:bg-blue-800  text-blue-700  dark:text-blue-300',
  'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300',
  'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300',
]

interface PostCardProps {
  post: Post
  showCategory?: boolean
  compact?: boolean
}

export default function PostCard({ post, showCategory = false, compact = false }: PostCardProps) {
  return (
    <article className={cn(
      "bg-[var(--bg-card)] rounded-xl border border-[var(--border)] transition-all duration-200 overflow-hidden group",
      "hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
    )}>
      <Link href={`/posts/${post.slug}`} className="block">
        <div className={cn("flex gap-3 p-4", compact && "p-3")}>
          {/* 썸네일 */}
          {post.thumbnail_url && !compact && (
            <div className="flex-shrink-0 w-20 h-[72px] sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-[var(--border-sub)]">
              <Image
                src={post.thumbnail_url}
                alt={post.title}
                width={96}
                height={80}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* 뱃지 */}
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {showCategory && (
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', CATEGORY_COLORS[post.category])}>
                  {CATEGORY_LABELS[post.category]}
                </span>
              )}
              {post.is_auto_crawled && (
                <span className="text-[10px] text-[var(--text-3)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                  자동수집
                </span>
              )}
              {post.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[11px] text-[var(--text-3)]">#{tag}</span>
              ))}
            </div>

            {/* 제목 */}
            <h2 className={cn(
              "font-semibold text-[var(--text-1)] line-clamp-2 leading-snug mb-1.5",
              "group-hover:text-[var(--accent)] transition-colors",
              compact ? "text-sm" : "text-sm sm:text-[15px]"
            )}>
              {post.title}
            </h2>

            {/* 요약 */}
            {post.ai_summary && !compact && (
              <p className="text-xs text-[var(--text-3)] line-clamp-1 leading-relaxed mb-2">
                {post.ai_summary}
              </p>
            )}

            {/* 메타 정보 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {post.profiles && (
                  <>
                    <div className="relative w-4 h-4 rounded-full bg-[var(--border)] overflow-hidden flex-shrink-0">
                      {post.profiles.avatar_url
                        ? <Image src={post.profiles.avatar_url} alt="" fill sizes="16px" className="object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-2)]">
                            {post.profiles.username[0]}
                          </span>
                      }
                    </div>
                    <span className="text-xs text-[var(--text-2)] truncate max-w-[80px]">{post.profiles.username}</span>
                    {!compact && (
                      <span className={cn('text-[10px] px-1 py-0.5 rounded font-semibold flex-shrink-0', LEVEL_COLORS[post.profiles.level])}>
                        {LEVEL_LABELS[post.profiles.level]}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-3)] flex-shrink-0">
                <span>{relativeTime(post.created_at)}</span>
                <span className="flex items-center gap-0.5"><Eye size={10} />{post.view_count.toLocaleString()}</span>
                {post.like_count > 0 && (
                  <span className="flex items-center gap-0.5 text-rose-500 dark:text-rose-400 font-medium">
                    <ThumbsUp size={10} />{post.like_count}
                  </span>
                )}
                {post.comment_count > 0 && (
                  <span className="flex items-center gap-0.5"><MessageSquare size={10} />{post.comment_count}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
