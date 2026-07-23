# Checkpoint — Supabase publishable/secret 키 마이그레이션 (ADR-0004)

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> "방금 한 것 · 다음 할 것 · 막힌 것 · 환경"만 담는다 — **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)
> Contract: keep this file under 200 lines, use repository-relative paths, and update it at session end.
> 형식 정의: `10_foundation/WHITEPAPER.md` §2-2.

## 작성자

- Agent: Claude (Sonnet 5, Claude Code)
- Branch: `feat/supabase-key-migration` (main에서 새로 분기, 직전 GRM-013은 PR#15로 이미 머지됨)

## 방금 한 것 (이번 세션)

- **GRM-013 GTM 설치 마무리**: PR#15로 머지 확인. TODO/HANDOFF는 InProgress에 남겨둠(사람 콘솔 작업 잔여 있음).
- **Supabase 키 마이그레이션**: 사용자가 Supabase 대시보드의 "`@supabase/server` 설치 + `SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY`/`SUPABASE_JWKS_URL`" 온보딩 안내를 전달. 이건 Class B(인증 키 변경)라 AskUserQuestion으로 범위 확인 → "전체 마이그레이션" 승인받고 진행.
  - **조사 결과(공식 문서 확인, 학습 데이터 의존 안 함)**: `@supabase/server`는 **Deno/Cloudflare Workers 등 Edge Functions 전용 SDK**(`withSupabase()`로 `Deno.serve` 핸들러를 감쌈)다. grooman은 Vercel Node.js 서버리스라 이 패키지가 요구하는 런타임과 안 맞는다 → **설치하지 않기로 결정**.
  - Next.js 공식 예제 확인: `createBrowserClient`/`createServerClient`는 새 키를 문자열째 그대로 받는다(시그니처 불변) → 코드 구조는 그대로 두고 **환경변수 값만 교체**.
  - 변경: `lib/supabase/client.ts`·`server.ts` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`→`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), `lib/supabase/admin.ts` (`SUPABASE_SERVICE_ROLE_KEY`→`SUPABASE_SECRET_KEY`), `lib/utils/posts.ts`의 가드도 동일 갱신.
  - `.env.example` 신설(기존에 아예 없었음 — 발견한 진짜 갭).
  - `40_dev/adr/0004-supabase-publishable-secret-keys.md` 작성 — 옵션 A(현행 유지)/B(안내 그대로 `@supabase/server` 도입)/C(채택: 키값만 교체) 비교.

## 검증한 것

- tsc 0 · vitest 21 passed · build 27 routes(새 변수명으로 빌드).
- **런타임 배선 검증**: 새 변수명(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)에 기존 legacy anon 키 *값*을 넣어 로컬 prod 서버 기동 → `/terms` 200, `/hair`(데이터 구동 페이지) 정상 렌더 확인. **주의**: 이건 "새 변수명을 코드가 올바르게 읽는지"만 검증한 것이지, "실제 새 포맷 키(`sb_publishable_...`/`sb_secret_...`)가 Supabase API와 호환되는지"는 검증하지 못했다 — 실제 신규 키 값을 갖고 있지 않기 때문(사용자가 붙여넣은 secret 값은 마스킹돼 있었음).

## 다음 구체 행동

1. 이 브랜치 PR → 리뷰·머지
2. **사람(hayden)**: Supabase Dashboard → Settings → API Keys에서 publishable/secret 키 발급(또는 이미 발급된 값 확인 — 사용자가 앞서 붙여넣은 안내에 publishable 값은 전체 노출돼 있었음: `sb_publishable_3OgNrIueTUh4cgjzA880sQ_s9_WAmdV`, secret은 마스킹됨)
3. **사람**: Vercel(Production+Preview 둘 다) + 로컬 `.env.local`에 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`·`SUPABASE_SECRET_KEY`로 값 설정 — **배포 전 필수**. 변수명이 바뀌었으므로 기존 legacy 값이 남아있어도 인식 안 됨 → 이 전환이 배포되는 순간부터 값을 안 넣으면 Supabase 연동 전체가 끊긴다.
4. 그 다음 GRM-013 잔여 체크박스(GA4 연결·Search Console)·GRM-001 숫자측정으로 복귀.

## 막힌 것 / 주의

- **하지 않은 것 확인**: `@supabase/server` npm install은 **의도적으로 안 함** — Edge Functions 전용이라 grooman에 안 맞음. 이후 세션에서 이 패키지를 다시 설치하라는 안내를 받으면 ADR-0004를 먼저 참조할 것.
- 시크릿 값은 다루지 않았다: 사용자가 붙여넣은 `SUPABASE_SECRET_KEY`는 마스킹돼 있어 애초에 온전한 값을 받은 적이 없고, 어떤 파일·필드에도 입력하지 않았다.

## 환경

- Next 14.2.35 / npm / Supabase `wqrxuzplcfjtjoiraqsf`(서울, ACTIVE_HEALTHY) / Vercel 대시보드 연결됨(env 미설정) / 로컬 `.env.local` 아직 없음
