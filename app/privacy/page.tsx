import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '그루맨 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="text-sm text-gray-500 mb-6">최종 업데이트: 2026년 7월 22일</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">1. 개인정보의 처리 목적</h2>
          <p>그루맨(이하 &ldquo;서비스&rdquo;)은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>회원 가입 및 관리</li>
            <li>서비스 제공 및 개선</li>
            <li>맞춤형 콘텐츠 제공</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">2. 수집하는 개인정보 항목</h2>
          <p>소셜 로그인(카카오, 구글) 시 다음 정보가 수집됩니다:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>이름(닉네임)</li>
            <li>프로필 이미지 URL</li>
            <li>이메일 주소(선택적)</li>
          </ul>
          <p className="mt-3">또한 서비스 이용 과정에서 다음 정보가 자동으로 생성·수집됩니다:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>접속 IP 주소, 접속 일시, 서비스 이용 기록</li>
            <li>브라우저·운영체제·기기 종류 등 접속 환경 정보</li>
            <li>쿠키를 통한 페이지 조회 기록 및 유입 경로</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
          <p>회원 탈퇴 시까지 보유하며, 탈퇴 시 즉시 삭제합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">4. 개인정보의 제3자 제공</h2>
          <p>그루맨은 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 특별한 규정이 있거나 수사기관이 적법한 절차에 따라 요구하는 경우에는 예외로 합니다. 서비스 운영에 필요한 범위에서 외부에 처리를 위탁하는 경우는 제5조에 따릅니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">5. 개인정보 처리업무의 위탁</h2>
          <p>서비스는 원활한 운영을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다. 위탁계약 시 개인정보가 안전하게 관리되도록 필요한 사항을 규정하고 있습니다.</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-gray-900">수탁자</th>
                  <th className="py-2 pr-4 font-semibold text-gray-900">위탁 업무</th>
                  <th className="py-2 font-semibold text-gray-900">보관 위치</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Supabase Inc.</td>
                  <td className="py-2 pr-4">회원 인증, 데이터베이스 운영</td>
                  <td className="py-2">대한민국(서울)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Vercel Inc.</td>
                  <td className="py-2 pr-4">웹 서비스 호스팅</td>
                  <td className="py-2">미국</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Google LLC</td>
                  <td className="py-2 pr-4">서비스 이용 통계 분석(Google Analytics, Google Tag Manager)</td>
                  <td className="py-2">미국</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">Vercel Inc. 및 Google LLC에는 접속 로그·기기 정보·페이지 조회 기록 등 <strong>제2조의 자동 수집 항목</strong>이 전송되며, <strong>이름·이메일 등 회원 식별정보는 전송되지 않습니다.</strong> 전송은 서비스 이용 시점에 네트워크를 통해 이루어지며, 각 사업자의 정책에 따른 기간 동안 보관됩니다. 이용자는 제6조의 방법으로 통계 분석 목적의 전송을 거부할 수 있습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">6. 쿠키의 사용</h2>
          <p>서비스는 다음 두 가지 목적으로 쿠키를 사용합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>필수 쿠키</strong>: 로그인 상태 유지 및 보안을 위해 사용하며, 거부할 경우 로그인이 필요한 기능을 이용할 수 없습니다.</li>
            <li><strong>분석 쿠키</strong>: 어떤 콘텐츠가 많이 읽히는지 등 서비스 개선을 위한 통계 분석(Google Analytics)에 사용하며, <strong>거부하더라도 서비스 이용에는 제한이 없습니다.</strong></li>
          </ul>
          <p className="mt-3">쿠키 거부 방법은 다음과 같습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. (예: Chrome — 설정 &gt; 개인정보 보호 및 보안 &gt; 서드파티 쿠키)</li>
            <li>Google Analytics만 선택적으로 차단하려면 <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 애널리틱스 차단 브라우저 부가기능</a>을 설치할 수 있습니다.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">7. 정보주체의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>개인정보 열람 요구</li>
            <li>오류가 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
          <p className="mt-3">프로필 정보는 서비스 내 설정 화면에서 직접 열람·수정할 수 있으며, 회원 탈퇴로 삭제를 요청할 수 있습니다. 그 밖의 요구는 admin@grooman.kr로 접수하면 지체 없이 처리합니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">8. 개인정보 보호책임자</h2>
          <p>개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자는 다음과 같습니다.</p>
          <p className="mt-2">이메일: admin@grooman.kr</p>
          <p className="mt-2 text-sm text-gray-500">개인정보 침해에 대한 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번없이 118), 개인정보 분쟁조정위원회(kopico.go.kr, 1833-6972)에 문의하실 수 있습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">9. 개인정보처리방침 변경</h2>
          <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
        </div>
      </div>
    </div>
  )
}
