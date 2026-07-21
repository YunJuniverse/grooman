---
status: accepted
date: 2026-07-21
---

# ADR-0003 전 테이블 RLS를 켜고 public-read / owner-write / admin-gated 모델을 적용하되, 저작자 없는 자동 콘텐츠는 service-role(admin client)로 RLS를 우회해 삽입한다

모든 테이블에 Row Level Security를 활성화하고, 콘텐츠는 공개 조회(`SELECT USING true`)·본인만 쓰기(`auth.uid() = user_id`)·운영자 전용(`is_admin`) 게이트로 나눈다. 크롤/봇처럼 저작자가 없거나 시스템이 쓰는 삽입은 클라이언트가 아니라 **service-role 키(`createAdminClient()`)로 RLS를 우회**해 처리한다. 그 대가로 서버 코드가 RLS 우회 지점을 정확히 통제해야 하는 부담을 수용한다.

- Related TODO / issue: —
- Related PR: (retro — 자율빌드 단계에서 이미 구현, 소급 기록)

> ⚠️ 소급(retro) ADR. 현행 정책(`supabase/migrations/001_initial.sql` L344~410)과 클라이언트 3분할(`lib/supabase/{client,server,admin}.ts`)이 담은 결정을 재구성한 것이다.

## Context

- Supabase(PostgREST) 구조상 RLS가 유일한 데이터 접근 경계다. 앱의 모든 쿼리가 RLS를 전제로 동작한다.
- 그런데 자동 크롤 글은 `user_id=null`이라 `posts_insert` 정책(`WITH CHECK auth.uid() = user_id`)을 만족할 수 없다 → 우회 경로가 구조적으로 필요하다([[ADR-0001]]).

## Considered Options

- **옵션 A — RLS 없이 앱 레이어에서만 권한 검사** — 장점: 단순 / 단점: PostgREST 직접 접근 시 무방비, service role 남용, Supabase 안티패턴.
- **옵션 B — 전 테이블 RLS + 저작자 없는 삽입도 정책으로 표현** — 장점: 우회 없음 / 단점: `user_id=null` 자동 글·시스템 쓰기를 정책만으로 안전히 허용하기 까다로움.
- **옵션 C (채택) — 전 테이블 RLS + 시스템 삽입만 service-role로 명시적 우회** — 채택 이유: 사용자 경로는 RLS로 강제하고, 저작자 없는 시스템 삽입만 서버 전용 admin client로 좁게 우회.

## Decision

- `profiles, posts, comments, post_likes, comment_likes, bookmarks, notifications, crawl_sources, crawl_queue, reports` 전부 `ENABLE ROW LEVEL SECURITY`.
- 패턴: 콘텐츠(글/댓글/좋아요) = public SELECT + owner write; `bookmarks`·`notifications` = owner-only SELECT; `crawl_sources`/`crawl_queue`/`reports` = `is_admin` 게이트.
- 클라이언트 3분할: 브라우저 `lib/supabase/client.ts`(anon), 서버 컴포넌트/액션 `server.ts`(쿠키 세션), **시스템/크롤/봇 `admin.ts`(service role — RLS 우회)**. admin client는 서버 전용 경로(`/api/crawl`, `/api/admin/*`)에서만 쓴다.

## Consequences

- 쉬워지는 것: 일관된 보안 경계, 클라이언트가 신뢰 경계를 넘지 못함, 자동 콘텐츠 삽입 경로가 코드상 명확.
- 어려워지는 것: **service-role 키 유출/오용 시 전체 RLS 무력화** → admin client 사용처를 좁게 유지하는 규율이 필수; 새 테이블 추가 시 RLS 정책 누락이 조용한 취약점이 됨.
- **되돌리기 비용**: 모든 쿼리·기능이 이 정책 모델을 전제로 짜여 있다. 모델 변경 시 전 테이블 정책 + 전 쿼리 경로 + admin client 사용처를 재감사해야 한다 — 보안 계약이라 국소 수정이 불가.
- **Change Class 판정**: **B** (인증/인가 모델 · 데이터 접근 경계).

## Approval Evidence

- (retro — 승인 증거 없음. 방법론 적용 후 보안 검토에서 소급 검증 대상. 특히 새 테이블 RLS 누락 여부를 정기 점검할 것.)

## Related

- [[ADR-0001]] 자동 크롤(admin client로 `user_id=null` 글 삽입) · [[ADR-0002]] 봇 시딩(admin 경로) · `lib/supabase/admin.ts`.
