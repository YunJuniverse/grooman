# Checkpoint — GRM-013 GTM 설치 + 개인정보처리방침 정비

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> "방금 한 것 · 다음 할 것 · 막힌 것 · 환경"만 담는다 — **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)
> Contract: keep this file under 200 lines, use repository-relative paths, and update it at session end.
> 형식 정의: `10_foundation/WHITEPAPER.md` §2-2.

## 작성자

- Agent: Claude (Opus 4.8, Claude Code)
- Branch: `feat/grm-013-analytics`

## 방금 한 것 (이번 세션)

- **GRM-013 GTM 설치** — 컨테이너 `GTM-WJVFXRBT`
  - 사용자가 준 raw `<script>`/noscript 스니펫을 **그대로 붙이지 않았다**. Vercel `NEXTJS_USE_NEXT_SCRIPT` 컨포먼스 규칙이 raw script·`dangerouslySetInnerHTML`을 플래그한다. 대신 `@next/third-parties@16.2.11`의 `GoogleTagManager`(내부적으로 `next/script` 사용) 채택. peer 확인 완료(`next ^13||^14||^15||^16` → 14.2.35 지원).
  - 이 컴포넌트는 **noscript 폴백을 렌더하지 않는다**(dist 소스 직접 확인) → `app/layout.tsx` body에 iframe 직접 추가.
  - `NEXT_PUBLIC_GTM_ID` 게이트: 미설정 시 GTM 자체가 미렌더. PR preview 트래픽이 프로덕션 컨테이너를 오염시키는 것을 막기 위함.
- **개인정보처리방침 정비**(`app/privacy/page.tsx`) — GTM 설치의 법적 전제. 기존 §4 "제3자 제공 안 함"·§5 "필수 쿠키만"이 설치 즉시 **거짓이 되는** 상태였다.
  - §2 자동수집 항목 신설 / §4 제3자 제공 정리 / §5 **처리위탁 표**(Supabase·Vercel·Google) / §6 쿠키 2종 + 거부 방법 / §7 **정보주체 권리**(개인정보보호법 §30 필수 기재, 기존 누락) / §8 신고센터 연락처
  - Supabase 리전은 MCP로 실제 확인(`ap-northeast-2` 서울) → DB 국내 보관으로 정확히 기재.
  - 이로써 검토메모(`40_dev/snapshots/legal-compliance-review-2026-07-22.md`) §5-4 "개인정보처리방침 적정성 = 별도 점검" 항목이 대체로 해소.

## 검증한 것

- tsc 0 · vitest 21 passed · build 27 routes
- **런타임 실측**(로컬 prod 서버 + 브라우저): `google_tag_manager["GTM-WJVFXRBT"]` 로드됨, `dataLayer`에 `gtm.start` 푸시, `gtm.js?id=GTM-WJVFXRBT` 로드, noscript iframe 원시 HTML에 존재. 방침 페이지 렌더도 확인.

## 다음 구체 행동

1. 이 브랜치 PR → 리뷰·머지
2. **사람(hayden)**: Vercel env 설정 후 Redeploy
   - Supabase 자격증명(URL·anon·service_role) + `ANTHROPIC_API_KEY`·`CRON_SECRET`
   - `NEXT_PUBLIC_GTM_ID=GTM-WJVFXRBT` — **Production 환경만 체크**(Preview 해제)
3. **사람**: GTM 콘솔에서 GA4 구성 태그 연결 + 컨테이너 게시 → 그 후 AI가 가입 전환 `sendGTMEvent` 삽입
4. **사람**: Search Console 등록·소유권 확인·sitemap 제출

## 막힌 것 / 주의

- **`NEXT_PUBLIC_*`는 빌드 타임 인라인**이다. 검증 중 이걸 놓쳐서 첫 두 번의 확인이 500/하이드레이션 크래시였다 — build와 start 양쪽에 넣어야 한다.
- 위 사실의 부수 소득: **GRM-001 숫자 측정 블로커가 실은 해소 가능**하다. `NEXT_PUBLIC_SUPABASE_URL` + anon key만 빌드에 주입하면 로컬 `next start`로 정상 렌더된다(service_role 불필요 — 공개 읽기는 RLS 허용). Vercel 배포를 기다릴 필요 없음. TODO GRM-001 notes에 기록해 뒀다.
- 로컬 `.env.local`은 아직 없다. 만들면 위 두 건이 모두 편해진다(anon key는 공개용이라 커밋만 안 하면 무해).

## 환경

- Next 14.2.35 / npm / Supabase `wqrxuzplcfjtjoiraqsf`(서울, ACTIVE_HEALTHY) / Vercel 대시보드 연결됨(env 미설정)
