import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: '로그인',
  description: '그루맨에 로그인하세요.',
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">그루맨 로그인</h1>
          <p className="text-sm text-gray-500 mt-2">남성 그루밍 커뮤니티에 참여하세요</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
