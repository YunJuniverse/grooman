'use client'
import Image from 'next/image'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'
import { Loader2, Check } from 'lucide-react'

export default function ProfileEditClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (username.length < 2 || username.length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.')
      return
    }
    setSaving(true)
    const { error: err } = await supabase
      .from('profiles')
      .update({ username: username.trim(), bio: bio.trim() || null })
      .eq('id', profile.id)
    setSaving(false)
    if (err) {
      setError(err.message.includes('unique') ? '이미 사용 중인 닉네임입니다.' : err.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/my'), 1000)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">프로필 편집</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* 아바타 미리보기 */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            {profile.avatar_url
              ? <Image src={profile.avatar_url} alt={username} fill sizes="64px" className="object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-xl text-gray-500 font-bold">
                  {username[0]?.toUpperCase()}
                </span>
            }
          </div>
          <p className="text-xs text-gray-400">아바타는 로그인 시 자동 설정됩니다</p>
        </div>

        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">닉네임</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={20}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition"
          />
          <p className="text-xs text-gray-400 mt-1">{username.length}/20자</p>
        </div>

        {/* 소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">한 줄 소개</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="자신을 소개해보세요 (최대 200자)"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/200자</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving || success}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : success ? <Check size={16} /> : null}
            {success ? '저장 완료!' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
