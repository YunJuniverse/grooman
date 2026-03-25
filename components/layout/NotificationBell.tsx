'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Notification } from '@/types/supabase'

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    // 실시간 구독
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 20))
        setUnread(n => n + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // 외부 클릭 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*, profiles!actor_id(username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) {
      setNotifications(data as Notification[])
      setUnread(data.filter(n => !n.is_read).length)
    }
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  function getIcon(type: string) {
    const icons: Record<string, string> = {
      comment: '💬', reply: '↩️', like: '❤️', mention: '@', level_up: '🎉', admin: '📢'
    }
    return icons[type] ?? '🔔'
  }

  function getMessage(n: Notification) {
    const actor = (n as unknown as Record<string, unknown>).profiles as { username: string } | null
    const name = actor?.username ?? '누군가'
    switch (n.type) {
      case 'comment': return `${name}님이 댓글을 남겼습니다`
      case 'reply': return `${name}님이 답글을 남겼습니다`
      case 'like': return `${name}님이 좋아요를 눌렀습니다`
      case 'mention': return `${name}님이 회원님을 언급했습니다`
      case 'level_up': return n.message ?? '레벨이 올랐습니다!'
      case 'admin': return n.message ?? '관리자 알림'
      default: return n.message ?? '새 알림'
    }
  }

  function getLink(n: Notification) {
    if (n.post_id) return `/posts/${n.post_id}`
    return '/my'
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return '방금'
    if (m < 60) return `${m}분 전`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}시간 전`
    return `${Math.floor(h / 24)}일 전`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(v => !v); if (!open && unread > 0) markAllRead() }}
        className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 transition"
        aria-label="알림"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">알림</span>
            {notifications.some(n => !n.is_read) && (
              <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-gray-600">
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400">알림이 없습니다</div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  href={getLink(n)}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">{getIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{getMessage(n)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
