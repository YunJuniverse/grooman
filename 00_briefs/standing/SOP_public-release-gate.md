# SOP: 공개 배포 릴리스 게이트

> **상시 브리프** — grooman을 공개(퍼블릭)로 배포하기 직전 반드시 통과해야 하는 체크. 날짜 없음 = 아카이브 안 됨. `boot`이 항상 최상단 노출.
> 새 세션은 "공개 배포/런칭" 작업을 시작하기 *전에* 이 파일부터 읽는다. 절차가 바뀌면 덮어써 갱신(SSOT).

## 트리거 (언제 도는가)
- **인식 신호**: "실배포/공개 배포/런칭하자", "프로덕션 공개", "grooman 오픈", 도메인 grooman.kr 공개 연결 언급.
- **주기 / 이벤트**: 비공개 → 공개 전환 직전 1회 (그리고 이후 공개 상태 재확인 시).

## 입력 (선행조건)
- 프로덕션 Supabase 접근(SQL Editor 또는 MCP).
- `004_bot_flag.sql` 적용됨(`profiles.is_bot` 존재).
- teardown 스크립트: `supabase/scripts/teardown_bots.sql`.

## 절차 (단계별)
1. **봇 teardown 실행** — 프로덕션에서 `supabase/scripts/teardown_bots.sql`을 실행한다(테스트 봇·봇 콘텐츠 전량 삭제).
2. **게이트 검증 쿼리** — 아래 두 값이 **모두 0**인지 확인한다. 0이 아니면 배포 **중단**.
   ```sql
   SELECT count(*) AS remaining_bots FROM profiles WHERE is_bot;                                    -- 0
   SELECT count(*) AS orphan_non_crawled_posts FROM posts WHERE is_auto_crawled = false AND user_id IS NULL;  -- 0
   ```
3. **시더 비활성 확인** — 공개 환경에서 `POST /api/admin/seed-bots`가 호출되지 않는지(운영 크론/수동 트리거에 남아있지 않은지) 확인.
4. 통과 시에만 공개 배포 진행.

## 산출물 · 위치
- 게이트 통과 결과(쿼리 0/0)를 배포 PR 또는 릴리스 노트에 기록.
- 이 게이트는 Change Class **C**(공개 릴리스). 사람 승인 후 배포.

## 주의점 · 스코프 경계 · 자주 하는 실수
- **계정만 지우지 말 것**: `posts.user_id`·`comments.user_id`는 `ON DELETE SET NULL`이라, 봇 계정만 삭제하면 봇 글·댓글이 `user_id=null`로 남아 published 방치된다. teardown 스크립트가 글·댓글부터 지우는 이유. (검증 쿼리 2가 이 누락을 잡는다.)
- **자동수집 글(user_id=null·is_auto_crawled=true)은 삭제 대상 아님** — 정상 프로덕션 콘텐츠. 검증 쿼리는 `is_auto_crawled=false`만 센다.
- teardown은 봇 글에 달린 실사용자 댓글도 CASCADE로 지운다 → 반드시 **실사용자 유입 전(공개 전)** 실행.
- 봇 식별의 단일 소스는 `profiles.is_bot`. 이메일 패턴/username에 의존하지 말 것.

## 관련 (근거 링크)
- [[ADR-0002]] (봇=테스트 픽스처, 배포 전 삭제) · `supabase/migrations/004_bot_flag.sql` · `supabase/scripts/teardown_bots.sql` · TODO GRM-010 · HANDOFF BOT-1.
