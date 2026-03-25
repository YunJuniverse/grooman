import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
  description: '그루맨 이용약관',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">이용약관</h1>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="text-sm text-gray-500 mb-6">최종 업데이트: 2026년 3월 1일</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제1조 (목적)</h2>
          <p>이 약관은 그루맨(이하 &ldquo;서비스&rdquo;)이 제공하는 인터넷 관련 서비스의 이용과 관련하여 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제2조 (이용자의 의무)</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>타인의 정보를 도용하거나 허위 정보를 제공하지 않습니다.</li>
            <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않습니다.</li>
            <li>특정 브랜드·제품의 광고성 게시글을 무분별하게 게시하지 않습니다.</li>
            <li>타인을 비방하거나 명예를 훼손하는 내용을 게시하지 않습니다.</li>
            <li>허위 시술·성형 후기를 게시하지 않습니다.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제3조 (서비스 이용 제한)</h2>
          <p>서비스는 이용자가 다음 각 호에 해당하는 경우 사전 통지 없이 이용을 제한할 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>약관에 위반되는 행위를 한 경우</li>
            <li>다른 이용자의 서비스 이용을 방해한 경우</li>
            <li>허위 정보를 반복적으로 게시한 경우</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제4조 (콘텐츠의 저작권)</h2>
          <p>이용자가 서비스 내에 게시한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다. 단, 이용자는 서비스가 해당 콘텐츠를 서비스 내에서 사용·복제·수정·게시할 수 있도록 비독점적 라이선스를 부여합니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제5조 (자동 수집 콘텐츠)</h2>
          <p>서비스는 외부 소스에서 자동으로 수집된 콘텐츠를 포함할 수 있습니다. 해당 콘텐츠에는 [자동수집] 표시가 부여되며, 원본 출처 링크가 함께 제공됩니다. 저작권 문제가 있는 경우 admin@grooman.kr로 연락해 주시기 바랍니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제6조 (면책조항)</h2>
          <p>서비스에 게시된 의료·미용 관련 정보는 참고용이며, 전문적인 의료 조언을 대체하지 않습니다. 서비스는 이용자가 게시한 콘텐츠의 정확성을 보증하지 않습니다.</p>
        </div>
      </div>
    </div>
  )
}
