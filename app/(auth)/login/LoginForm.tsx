'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Tab = 'social' | 'email'
type EmailMode = 'login' | 'signup'

export default function LoginForm() {
  const [tab, setTab] = useState<Tab>('social')
  const [mode, setMode] = useState<EmailMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const supabase = createClient()

  async function signInWithKakao() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signup') {
      if (username.length < 2 || username.length > 20) {
        setError('닉네임은 2~20자 사이여야 합니다.')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: username, username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        if (error.message.includes('already registered')) {
          setError('이미 가입된 이메일입니다.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else {
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setTab('social'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'social' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          소셜 로그인
        </button>
        <button
          onClick={() => { setTab('email'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          이메일
        </button>
      </div>

      {tab === 'social' ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={signInWithKakao}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#FEE500] hover:bg-[#F0D800] text-[#3C1E1E] font-semibold rounded-xl transition disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.029 0 0 3.136 0 7C0 9.407 1.359 11.537 3.434 12.873L2.625 16.5L6.6 13.951C7.37 14.146 8.173 14.25 9 14.25C13.971 14.25 18 11.114 18 7.25C18 3.386 13.971 0.25 9 0.25" fill="#3C1E1E"/>
            </svg>
            카카오 로그인
          </button>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 transition disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
            </svg>
            Google 로그인
          </button>
        </div>
      ) : (
        <div>
          {/* 로그인/회원가입 토글 */}
          <div className="flex gap-4 mb-5 border-b border-gray-100">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              className={`pb-2 text-sm font-medium border-b-2 transition -mb-px ${
                mode === 'login' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
              className={`pb-2 text-sm font-medium border-b-2 transition -mb-px ${
                mode === 'signup' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'
              }`}
            >
              회원가입
            </button>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-3">✉️</div>
              <p className="text-sm font-medium text-gray-800">{success}</p>
              <button
                onClick={() => { setSuccess(null); setMode('login') }}
                className="mt-4 text-xs text-gray-400 underline"
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">닉네임</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="2~20자 닉네임"
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? '6자 이상' : '비밀번호 입력'}
                    required
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 mt-1"
              >
                {loading ? '처리 중...' : mode === 'signup' ? '가입하기' : '로그인'}
              </button>
            </form>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        로그인 시 그루맨의{' '}
        <a href="/terms" className="underline">이용약관</a>
        {' '}및{' '}
        <a href="/privacy" className="underline">개인정보처리방침</a>
        에 동의합니다.
      </p>
    </div>
  )
}
