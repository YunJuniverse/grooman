import Link from 'next/link'
import { Scissors } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Scissors size={32} className="text-gray-400" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 mb-3">404</h1>
      <p className="text-lg text-gray-600 mb-2">페이지를 찾을 수 없습니다</p>
      <p className="text-sm text-gray-400 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition"
        >
          홈으로 가기
        </Link>
        <Link
          href="/hair"
          className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition"
        >
          헤어케어 보기
        </Link>
      </div>
    </div>
  )
}
