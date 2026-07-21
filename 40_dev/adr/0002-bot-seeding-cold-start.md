---
status: accepted
date: 2026-07-21
updated: 2026-07-22
---

# ADR-0002 AI 봇 8개는 출시 전 look 확인용 테스트 픽스처이며, 공개 배포 전 전량 삭제한다

카테고리별 페르소나 봇 8개를 SQL 마이그레이션으로 `auth.users`에 직접 삽입하고 Claude로 게시글·댓글을 생성한다. **용도는 콜드스타트 프로덕션 부트스트랩이 아니라, 출시 전 UI/레이아웃(look)을 실 데이터로 확인하기 위한 테스트 픽스처다.** grooman은 현재 비공개(실사용자 없음)이며, **공개 배포 시 봇 계정과 봇 생성 콘텐츠를 전량 삭제**하는 것을 조건으로 이 방식을 수용한다.

> **2026-07-22 결정 (GRM-010 해소)**: 봇은 실사용자를 겨냥한 기만 장치가 아니라 출시 전 테스트 픽스처다 → 프로덕션 공개 표기(disclosure)는 불필요. 대신 **"공개 배포 전 봇 0건" 릴리스 게이트**가 필수다. 현재 teardown이 불가능한 상태가 실제 리스크다(아래 Consequences).

- Related TODO / issue: **GRM-010(출시 전 봇 제거 게이트 + 안전한 teardown 수단 확보)**
- Related PR: [grooman#1](https://github.com/YunJuniverse/grooman/pull/1)

> ⚠️ 소급(retro) ADR. 현행 코드(`supabase/migrations/002_seed_bots.sql`, `lib/bots/generator.ts`, `lib/bots/data.ts`, `app/api/admin/seed-bots/route.ts`, `bot-likes`·`bot-activity`)가 담은 결정을 재구성한 것이다.

## Context

- 신규 커뮤니티는 "아무도 없어서 아무도 안 온다"는 콜드스타트에 빠진다. 초기에 그럴듯한 게시글·댓글·좋아요 활동이 필요했다.
- 1인 운영이라 초기 UGC를 사람이 수동으로 채우기 어렵다.

## Considered Options

- **옵션 A — 봇 없이 실사용자만** — 장점: 진정성·법적 단순 / 단점: 콜드스타트 미해결.
- **옵션 B — 운영자가 수동으로 초기 글 작성(투명한 공식 계정)** — 장점: 정직함 / 단점: 볼륨 한계, 시간 비용.
- **옵션 C (채택) — AI 페르소나 봇 8개를 `auth.users`에 직접 시딩 + AI 생성 콘텐츠** — 채택 이유: 볼륨·다양성을 즉시 확보. 단, 진정성/표기 리스크를 남긴다.

## Decision

- `002_seed_bots.sql`이 `pgcrypto`로 봇 비밀번호를 해싱해 `auth.users`에 **직접 INSERT**(Supabase signup 플로우 우회), 대응 `profiles` 생성. 페르소나 예: "탈모극복김재원", "피부덕후박민준" 등 카테고리별 8개.
- `lib/bots/generator.ts`가 카테고리별 토픽 풀로 Claude를 호출해 게시글/댓글을 생성. `bot-likes`·`bot-activity` 어드민 라우트로 봇 활동을 조절.
- 봇 콘텐츠는 실사용자 콘텐츠와 **구분 표기 없이** 동일 `posts`/`comments`에 저장된다.

## Consequences

- 쉬워지는 것: 출시 전 실 데이터로 UI/레이아웃·인게이지먼트 컴포넌트(HOT보드·좋아요·댓글) look 확인.
- **핵심 리스크 — teardown 불가능**: "출시 전 전량 삭제"가 결정이지만, 현재 봇을 **안전·검증 가능하게 삭제할 수단이 없다**:
  - `profiles`에 `is_bot` 구분 컬럼 없음(`is_admin`만 존재) → 단일 플래그로 봇 식별 불가.
  - 봇 식별자가 3곳에서 불일치: `002_seed_bots.sql`=`bot.<cat>@grooman.kr`, `lib/bots/data.ts`=`bot.<cat>@grooman.internal`, 런타임 시더 `seed-bots/route.ts:38`=**랜덤 이메일** `bot.<random>@grooman.kr`.
  - 삭제 스크립트(un-seeder)가 아예 없음. 봇 콘텐츠는 hot_rank·검색 색인에도 반영됨.
- **되돌리기 비용**: 위 식별 불일치 때문에, 늦게 정리할수록 "어떤 계정·글이 봇인지" 판별이 어려워진다. → **지금(비공개 상태에서) 봇 마커 + teardown 수단을 확보**하는 게 가장 싸다.
- **Change Class 판정**: 공개 배포 결정 자체는 **C**(릴리스 게이트: "봇 0건" 검증). teardown 수단 구현(`is_bot` 컬럼 등 스키마 변경)은 **B**.

## Approval Evidence

- 2026-07-22: 사람 결정 — 봇은 출시 전 테스트 픽스처, 공개 배포 시 전량 삭제. 프로덕션 표기는 불필요, "봇 0건" 릴리스 게이트로 대체. (retro였던 부분은 유지: 최초 봇 도입 자체의 승인 증거는 없음.)

## Related

- [[ADR-0001]] 자동 크롤 파이프라인(자동수급 콘텐츠와 동일한 표기 미결 이슈 공유) · GRM-010 · `00_briefs/reference/2026-07-21_grooman-autonomous-build-spec.md`(브랜드 중립성 원칙).
