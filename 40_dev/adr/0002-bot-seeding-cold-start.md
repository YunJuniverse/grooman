---
status: accepted
date: 2026-07-21
---

# ADR-0002 AI 생성 봇 계정 8개를 auth.users에 직접 시딩해 콜드스타트 UGC(게시글·댓글)를 부트스트랩한다

빈 커뮤니티 문제를 풀기 위해, 카테고리별 페르소나 봇 8개를 SQL 마이그레이션으로 `auth.users`에 직접 삽입하고 Claude로 게시글·댓글을 생성해 초기 활동을 채운다. 그 대가로 진정성·공개(disclosure) 리스크와 Supabase 인증 플로우 우회를 수용한다. **이 결정의 진정성/표기 측면은 미결(Class C)이며 사람 판단이 필요하다.**

- Related TODO / issue: **GRM-010(봇 진정성·공개 정책 결정 — 미결)**
- Related PR: (retro — 자율빌드 단계에서 이미 구현, 소급 기록)

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

- 쉬워지는 것: 즉각적 초기 활동감·카테고리 커버리지 확보.
- 어려워지는 것: **봇이 실사용자와 구분 불가** → 이용자 신뢰·표시광고/기만 관련 리스크; `auth.users` 직접 조작은 Supabase 업그레이드·인증 로직 변경 시 깨질 수 있음; 마이그레이션에 봇 비밀번호가 평문 리터럴로 남음.
- **선행조건 / 미결(OPEN)**: 이 결정은 **브랜드·이용자 신뢰·표기 의무**에 닿으므로 방법론상 **Class C**다. 봇 유지 여부와 "AI 생성/자동수집" 공개 표기 여부는 사람이 결정해야 한다 → **GRM-010**. 정책이 정해질 때까지 본 ADR은 리스크를 명시적으로 노출한 상태로 둔다.
- **되돌리기 비용**: 봇 콘텐츠가 실 콘텐츠와 섞여 누적되고 hot_rank·검색 색인에 반영된다. 사후 제거 시 어떤 글이 봇 것인지 식별·정리 + 지표 왜곡 보정이 필요.
- **Change Class 판정**: **C** (공개 서비스의 진정성·표기 — 사람 승인 필요. AI가 임의로 "완료" 처리하지 않는다).

## Approval Evidence

- (retro — 승인 증거 없음. **GRM-010에서 사람 결정 대기 중.** 승인 없이 자동으로 accepted 처리하지 않으며, status=accepted는 "코드에 이미 존재함"을 뜻할 뿐 정책 승인을 뜻하지 않는다.)

## Related

- [[ADR-0001]] 자동 크롤 파이프라인(자동수급 콘텐츠와 동일한 표기 미결 이슈 공유) · GRM-010 · `00_briefs/reference/2026-07-21_grooman-autonomous-build-spec.md`(브랜드 중립성 원칙).
