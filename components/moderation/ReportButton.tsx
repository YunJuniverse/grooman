'use client'
import { useState, useTransition } from 'react'
import { Flag, X } from 'lucide-react'
import { REPORT_REASONS, type ReportReason } from '@/lib/moderation/reports'
import { createReport } from '@/app/moderation/actions'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

interface ReportButtonProps {
  targetType: 'post' | 'comment'
  targetId: string
  variant?: 'button' | 'text'
}

export default function ReportButton({ targetType, targetId, variant = 'button' }: ReportButtonProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [done, setDone] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit() {
    if (!reason) return
    startTransition(async () => {
      const result = await createReport(targetType, targetId, reason)
      setDone(result.error ?? '신고가 접수되었습니다. 검토 후 조치됩니다.')
    })
  }

  function openModal() {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    setReason('')
    setDone(null)
    setOpen(true)
  }

  return (
    <>
      {variant === 'text' ? (
        <button onClick={openModal} className="text-xs text-gray-400 hover:text-red-500 transition">
          신고
        </button>
      ) : (
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition"
        >
          <Flag size={14} /> 신고
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[var(--bg-card)] p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text-1)]">
                {targetType === 'post' ? '게시글' : '댓글'} 신고
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {done ? (
              <div className="py-6 text-center text-sm text-[var(--text-2)]">
                {done}
                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 block w-full rounded-lg bg-gray-100 dark:bg-white/5 py-2.5 font-medium text-[var(--text-1)]"
                >
                  닫기
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {(Object.entries(REPORT_REASONS) as [ReportReason, string][]).map(([key, label]) => (
                    <label
                      key={key}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition',
                        reason === key
                          ? 'border-red-400 bg-red-50 dark:bg-red-500/10'
                          : 'border-gray-200 dark:border-[var(--border)] hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        checked={reason === key}
                        onChange={() => setReason(key)}
                        className="accent-red-500"
                      />
                      <span className="text-sm text-[var(--text-1)]">{label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={submit}
                  disabled={!reason || isPending}
                  className="mt-4 w-full rounded-lg bg-red-500 py-2.5 font-medium text-white disabled:opacity-40 transition"
                >
                  {isPending ? '접수 중...' : '신고하기'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
