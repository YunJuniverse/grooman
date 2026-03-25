'use client'
import { useState } from 'react'
import { RefreshCw, Users, FileText, Rss, CheckCircle, XCircle, Clock, Bot, Megaphone, ShieldCheck, Eye, EyeOff, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { CrawlQueue, CrawlSource, Profile, Post, Ad } from '@/types/supabase'

interface AdminDashboardProps {
  stats: { totalPosts: number; crawledPosts: number; totalUsers: number }
  recentQueue: CrawlQueue[]
  sources: CrawlSource[]
  users: Profile[]
  posts: (Post & { profiles?: { username: string } | null })[]
  ads: Ad[]
}

type Tab = 'dashboard' | 'users' | 'posts' | 'ads' | 'bots'

const STATUS_ICONS = {
  done: <CheckCircle size={14} className="text-green-500" />,
  failed: <XCircle size={14} className="text-red-500" />,
  pending: <Clock size={14} className="text-gray-400" />,
  processing: <RefreshCw size={14} className="text-blue-500 animate-spin" />,
}

export default function AdminDashboard({ stats, recentQueue, sources, users: initialUsers, posts: initialPosts, ads: initialAds }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [crawling, setCrawling] = useState(false)
  const [crawlResult, setCrawlResult] = useState<string | null>(null)
  const [users, setUsers] = useState(initialUsers)
  const [posts, setPosts] = useState(initialPosts)
  const [ads, setAds] = useState(initialAds)
  const [botLoading, setBotLoading] = useState<string | null>(null)
  const [botResult, setBotResult] = useState<string | null>(null)
  const supabase = createClient()

  async function triggerCrawl() {
    setCrawling(true)
    setCrawlResult(null)
    try {
      const res = await fetch(`/api/crawl?secret=${process.env.NEXT_PUBLIC_CRON_SECRET_HINT ?? ''}`)
      const data = await res.json()
      setCrawlResult(`처리: ${data.processed}, 건너뜀: ${data.skipped}, 실패: ${data.failed}`)
    } catch {
      setCrawlResult('크롤링 실패')
    }
    setCrawling(false)
  }

  async function toggleAdmin(userId: string, current: boolean) {
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !current } : u))
  }

  async function togglePostStatus(postId: string, current: string) {
    const next = current === 'published' ? 'hidden' : 'published'
    await supabase.from('posts').update({ status: next }).eq('id', postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: next as Post['status'] } : p))
  }

  async function deletePost(postId: string) {
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    await supabase.from('posts').update({ status: 'deleted' }).eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  async function toggleAd(adId: string, current: boolean) {
    await supabase.from('ads').update({ is_active: !current }).eq('id', adId)
    setAds(prev => prev.map(a => a.id === adId ? { ...a, is_active: !current } : a))
  }

  async function triggerBot(action: string) {
    setBotLoading(action)
    setBotResult(null)
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET_HINT ?? ''
      const endpoint = action === 'seed' ? '/api/admin/seed-bots' :
                       action === 'activity' ? '/api/admin/bot-activity' :
                       '/api/admin/bot-likes'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = await res.json()
      setBotResult(JSON.stringify(data, null, 2))
    } catch {
      setBotResult('요청 실패')
    }
    setBotLoading(null)
  }

  const TABS = [
    { id: 'dashboard' as Tab, label: '대시보드', icon: <FileText size={15} /> },
    { id: 'users' as Tab, label: '회원관리', icon: <Users size={15} /> },
    { id: 'posts' as Tab, label: '게시글관리', icon: <Eye size={15} /> },
    { id: 'ads' as Tab, label: '광고관리', icon: <Megaphone size={15} /> },
    { id: 'bots' as Tab, label: '봇관리', icon: <Bot size={15} /> },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 패널</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<FileText size={20} />} label="전체 게시글" value={stats.totalPosts} />
        <StatCard icon={<Rss size={20} />} label="자동수집 게시글" value={stats.crawledPosts} />
        <StatCard icon={<Users size={20} />} label="전체 회원" value={stats.totalUsers} />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition ${
              tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* 대시보드 탭 */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">크롤링 수동 실행</h2>
              <button
                onClick={triggerCrawl}
                disabled={crawling}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg disabled:opacity-60 transition"
              >
                <RefreshCw size={15} className={crawling ? 'animate-spin' : ''} />
                {crawling ? '실행 중...' : '지금 실행'}
              </button>
            </div>
            {crawlResult && <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">{crawlResult}</p>}
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">크롤링 소스 ({sources.length}개)</h2>
            <div className="space-y-2">
              {sources.map(source => (
                <div key={source.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{source.source_name}</p>
                    <p className="text-xs text-gray-400">{source.rss_url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {source.last_crawled_at ? new Date(source.last_crawled_at).toLocaleString('ko-KR') : '미실행'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {source.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">최근 크롤링 큐</h2>
            <div className="space-y-1">
              {recentQueue.map(item => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {STATUS_ICONS[item.status as keyof typeof STATUS_ICONS] ?? STATUS_ICONS.pending}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">{item.source_url}</p>
                    {item.error_msg && <p className="text-xs text-red-400">{item.error_msg}</p>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(item.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {recentQueue.length === 0 && <p className="text-sm text-gray-400 text-center py-4">크롤링 이력이 없습니다.</p>}
            </div>
          </section>
        </div>
      )}

      {/* 회원관리 탭 */}
      {tab === 'users' && (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">회원 목록 ({users.length}명)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-3">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {user.username?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{user.username}</p>
                    {user.is_admin && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">관리자</span>}
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Lv.{user.level}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')} 가입 · 게시글 {user.post_count}
                  </p>
                </div>
                <button
                  onClick={() => toggleAdmin(user.id, user.is_admin)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition ${
                    user.is_admin
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ShieldCheck size={13} />
                  {user.is_admin ? '관리자 해제' : '관리자 설정'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 게시글 관리 탭 */}
      {tab === 'posts' && (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">게시글 관리 ({posts.length}개)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">
                    {post.profiles?.username ?? '익명'} · {new Date(post.created_at).toLocaleDateString('ko-KR')} · 조회 {post.view_count}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  post.status === 'published' ? 'bg-green-100 text-green-700' :
                  post.status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {post.status === 'published' ? '공개' : post.status === 'hidden' ? '숨김' : post.status}
                </span>
                <button
                  onClick={() => togglePostStatus(post.id, post.status)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                  title={post.status === 'published' ? '숨기기' : '공개하기'}
                >
                  {post.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                  title="삭제"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 광고 관리 탭 */}
      {tab === 'ads' && (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">광고 관리 ({ads.length}개)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {ads.map(ad => (
              <div key={ad.id} className="flex items-center gap-4 px-6 py-3">
                {ad.image_url && (
                  <img src={ad.image_url} alt={ad.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{ad.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{ad.placement}</span>
                    {ad.badge && <span className="text-[10px] text-gray-500">{ad.badge}</span>}
                    <span className="text-[10px] text-gray-400">클릭 {ad.click_count}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleAd(ad.id, ad.is_active)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
                    ad.is_active
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {ad.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  {ad.is_active ? '활성' : '비활성'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 봇 관리 탭 */}
      {tab === 'bots' && (
        <div className="space-y-4">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">봇 작업 실행</h2>
            <div className="grid grid-cols-3 gap-3">
              <BotButton
                label="봇 초기 시딩"
                desc="봇 계정 생성 + 게시글 100개"
                action="seed"
                loading={botLoading}
                onTrigger={triggerBot}
                danger
              />
              <BotButton
                label="일일 봇 활동"
                desc="새 게시글 2~3개 + 댓글"
                action="activity"
                loading={botLoading}
                onTrigger={triggerBot}
              />
              <BotButton
                label="봇 좋아요"
                desc="무작위 게시글에 좋아요"
                action="likes"
                loading={botLoading}
                onTrigger={triggerBot}
              />
            </div>
            {botResult && (
              <pre className="mt-4 text-xs text-gray-600 bg-gray-50 p-4 rounded-lg overflow-auto max-h-40">
                {botResult}
              </pre>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2 text-gray-500">{icon}<span className="text-sm">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  )
}

function BotButton({ label, desc, action, loading, onTrigger, danger }: {
  label: string
  desc: string
  action: string
  loading: string | null
  onTrigger: (a: string) => void
  danger?: boolean
}) {
  const isLoading = loading === action
  return (
    <button
      onClick={() => onTrigger(action)}
      disabled={loading !== null}
      className={`flex flex-col items-start p-4 rounded-xl border text-left transition disabled:opacity-60 ${
        danger
          ? 'border-red-200 bg-red-50 hover:bg-red-100'
          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Bot size={15} className={danger ? 'text-red-500' : 'text-gray-600'} />
        <span className={`text-sm font-semibold ${danger ? 'text-red-700' : 'text-gray-800'}`}>
          {isLoading ? '실행 중...' : label}
        </span>
      </div>
      <p className="text-xs text-gray-400">{desc}</p>
    </button>
  )
}
