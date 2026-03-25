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
          <p className="text-sm text-gray-500 mb-6">최종 업데이트: 2026년 3월 1일</p>

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

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
          <p>회원 탈퇴 시까지 보유하며, 탈퇴 시 즉시 삭제합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">4. 개인정보의 제3자 제공</h2>
          <p>그루맨은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">5. 쿠키의 사용</h2>
          <p>서비스는 로그인 상태 유지를 위해 필수 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키를 거부할 수 있으나, 이 경우 서비스 이용이 제한될 수 있습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">6. 개인정보 보호책임자</h2>
          <p>개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자는 다음과 같습니다.</p>
          <p className="mt-2">이메일: admin@grooman.kr</p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">7. 개인정보처리방침 변경</h2>
          <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
        </div>
      </div>
    </div>
  )
}
