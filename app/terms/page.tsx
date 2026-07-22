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
          <p className="text-sm text-gray-500 mb-6">최종 업데이트: 2026년 7월 22일</p>

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

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제6조 (권리침해 게시물의 삭제요청 및 임시조치)</h2>
          <p>이 조는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제44조의2에 따른 절차를 정합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>요청 방법</strong>: 서비스에 게시된 정보로 사생활 침해·명예훼손 등 권리를 침해받은 자는 침해사실을 소명하여 <strong>admin@grooman.kr</strong>로 해당 정보의 삭제 또는 반박내용의 게재를 요청할 수 있습니다. 요청 시 침해 게시물의 URL과 침해사실을 소명할 수 있는 자료를 함께 보내주셔야 합니다.</li>
            <li><strong>처리</strong>: 서비스는 요청을 받으면 지체 없이 삭제·임시조치 등 필요한 조치를 하고, 그 사실을 신청인과 게시자에게 알립니다.</li>
            <li><strong>임시조치</strong>: 권리침해 여부를 판단하기 어렵거나 이해당사자 간 다툼이 예상되는 경우, 서비스는 해당 정보에 대한 접근을 <strong>최대 30일간</strong> 임시적으로 차단할 수 있습니다.</li>
            <li><strong>공시</strong>: 조치를 한 사실은 해당 게시판에 공시하는 등의 방법으로 이용자가 알 수 있도록 합니다.</li>
            <li><strong>이의제기</strong>: 게시자는 조치에 대해 위 이메일로 이의를 제기할 수 있으며, 서비스는 이를 검토하여 재게시 여부를 결정합니다.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제7조 (의료 관련 게시물)</h2>
          <p>시술·성형 등 의료 관련 게시판은 이용자의 <strong>자발적인 경험 공유</strong>를 위한 공간이며, 서비스는 해당 게시판에 자동 수집 콘텐츠를 게재하지 않습니다. 다음 각 호에 해당하는 게시물은 「의료법」 제56조 위반 소지가 있어 삭제 또는 접근 차단될 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>의료인·의료기관으로부터 협찬, 비용 할인 등 <strong>대가를 받고 작성한 후기</strong></li>
            <li>특정 의료기관·의료인의 연락처, 예약 경로, 가격·이벤트 정보를 포함하여 <strong>진료를 유인</strong>하는 내용</li>
            <li>치료 효과를 <strong>오인하게 할 우려</strong>가 있는 내용(전후 비교 사진 중심의 게시물 등)</li>
            <li>이용자가 타인에게 <strong>진단·처방에 해당하는 조언</strong>을 하는 내용</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">제8조 (면책조항)</h2>
          <p>서비스에 게시된 의료·미용 관련 정보는 참고용이며, 전문적인 의료 조언을 대체하지 않습니다. 서비스는 이용자가 게시한 콘텐츠의 정확성을 보증하지 않습니다.</p>
        </div>
      </div>
    </div>
  )
}
