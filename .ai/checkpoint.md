# Checkpoint — Supabase 키 마이그레이션(ADR-0004) + 크론 인증 버그 수정(CRON-1)

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)
> Contract: keep this file under 200 lines, use repository-relative paths, and update it at session end.

## 작성자

- Agent: Claude (Sonnet 5, Claude Code)
- Branch: `feat/supabase-key-migration` (아직 PR 미생성, main에서 분기 — 직전 GRM-013은 PR#15로 머지됨)

## 방금 한 것 (이번 세션)

1. **Supabase 키 마이그레이션**(ADR-0004) — 상세는 이전 체크포인트 내용 참조(git log). `lib/supabase/{client,server,admin}.ts`·`lib/utils/posts.ts` env var명 전환, `.env.example` 신설, `@supabase/server`(Edge Functions 전용) 미도입.
2. 사용자가 Vercel에 env 등록한 스크린샷 확인 → **`NEXT_PUBLIC_GTM_ID`가 Preview에도 켜져 있어 Production 전용으로 고치라고 안내**(preview 트래픽이 GA4 오염), `SUPABASE_JWKS_URL`은 코드에서 안 씀(무해, 정보성 안내)으로 지적.
3. 사용자가 "`CRON_SECRET`은 니가 만들어" → `openssl rand -hex 32`로 생성해 전달(값을 어디에도 직접 입력하지 않음 — 사람이 Vercel에 직접 등록).
4. CRON_SECRET 관련 라우트를 점검하다가 **실제 버그 발견**: `vercel.json`의 크론 2건(`/api/crawl`, `/api/admin/bot-activity`)이 Vercel의 실제 Cron 호출 방식(GET + `Authorization: Bearer $CRON_SECRET` — 공식 문서로 확인)과 안 맞음.
   - `/api/crawl`: GET은 있었지만 `x-cron-secret` 헤더/쿼리파라미터만 인식 → Bearer 인식 못 함
   - `/api/admin/bot-activity`: **GET 핸들러 자체가 없음**(POST만 존재, body의 `secret` 필드로 인증) → Vercel Cron이 GET으로 부르면 405
   - 즉 **두 크론 다 배포해도 스케줄대로 절대 실행되지 않았을 상태**였음
5. 사용자 승인("지금 고쳐줘") 후 수정:
   - `/api/crawl/route.ts`: `Authorization: Bearer` 인식 추가. 기존 `x-cron-secret`/쿼리파라미터 방식은 **삭제하지 않고 유지** — `app/admin/AdminDashboard.tsx`의 수동 트리거 버튼(`triggerCrawl()`)이 쿼리파라미터로 호출하고 있어서 하위호환 필요.
   - `/api/admin/bot-activity/route.ts`: 로직을 `runBotActivity()`로 추출, `GET`(Bearer 인증, Vercel Cron용)과 `POST`(body.secret 인증, 어드민 수동 트리거용) 둘 다 이 함수를 호출하도록 리팩터링.

## 검증한 것

- tsc 0 · vitest 21 passed · build 27 routes
- **런타임 검증**(로컬 prod 서버, 실제 CRON_SECRET 값 사용):
  - `/api/crawl`: 헤더 없음→401, 잘못된 Bearer→401, **올바른 Bearer→200**(실제 crawl_sources 3건 읽음, AI 키 없어 fail-closed skip — 쓰기 없음), 기존 쿼리파라미터 방식도 200(하위호환 확인)
  - `/api/admin/bot-activity`: GET 헤더없음→401(수정 전엔 405였을 것), GET 잘못된 Bearer→401, POST 잘못된 secret→401
  - **의도적으로 안 한 것**: `bot-activity`의 올바른-secret 정상 경로는 실행하지 않음 — 실행하면 실제 프로덕션 Supabase(`wqrxuzplcfjtjoiraqsf`)에 봇 글/댓글이 진짜로 삽입되는 부수효과가 있어서, 사용자가 명시적으로 요청하지 않은 데이터 변경을 임의로 만들지 않으려 거부 경로만 확인했다. 코드는 `/api/crawl`과 동일한 패턴(공식 Vercel 예제 그대로)이라 대칭적으로 신뢰 가능.

## 다음 구체 행동

1. 이 브랜치(`feat/supabase-key-migration`, 이제 키 마이그레이션+크론 버그수정 2커밋)를 wrap→ship 해야 함 — **아직 안 함, 이번 세션의 다음 스텝**.
2. PR 생성 → 리뷰·머지
3. **사람**: Vercel에 `CRON_SECRET` 값(`b26de71215ef3c6d9832e6d12733f7c4821097ada99fc59685994030b1f37d9c`) 등록 + `NEXT_PUBLIC_GTM_ID` Preview 체크 해제 + `SUPABASE_JWKS_URL`은 선택적 삭제
4. 머지·배포 후: Vercel Cron 로그에서 `/api/crawl`·`/api/admin/bot-activity`가 실제로 200을 받는지 확인 권장(이번 수정의 최종 증거)

## 막힌 것 / 주의

- 이 버그(CRON-1)는 **사용자가 CRON_SECRET을 만들어달라고 한 요청에서 파생된 발견**이지 원래 이번 세션 목표가 아니었다 — 스코프가 늘어난 것을 사용자에게 명시적으로 알리고 승인("지금 고쳐줘")받은 후 진행했다.
- `NEXT_PUBLIC_CRON_SECRET_HINT`라는 **클라이언트 노출 env var**가 `AdminDashboard.tsx`에서 참조되고 있음을 발견했다(수동 트리거용 secret 힌트). 이번엔 손대지 않았지만, 만약 이 값이 실제 `CRON_SECRET`과 같은 값으로 설정된다면 브라우저 번들에 시크릿이 노출되는 구조적 위험이다. 별도 세션에서 재검토할 것 — 지금은 플래그만 남김.

## 환경

- Next 14.2.35 / npm / Supabase `wqrxuzplcfjtjoiraqsf`(서울, ACTIVE_HEALTHY) / Vercel 대시보드에 5개 env 등록됨(NEXT_PUBLIC_GTM_ID·SUPABASE_JWKS_URL·SUPABASE_SECRET_KEY·NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY·NEXT_PUBLIC_SUPABASE_URL) — `CRON_SECRET` 아직 미등록
