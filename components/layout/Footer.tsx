import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">GROOMAN</p>
            <p className="text-sm text-gray-500 mt-1">대한민국 남성 그루밍 커뮤니티</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-gray-700">이용약관</Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} Grooman. All rights reserved.<br />
          이 사이트의 게시글 중 일부는 외부에서 자동 수집된 콘텐츠를 포함하며, 해당 게시글에는 [자동수집] 표시가 있습니다.
        </p>
      </div>
    </footer>
  )
}
