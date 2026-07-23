---
status: accepted
date: 2026-07-22
---

# ADR-0004 Supabase legacy anon/service_role 키를 신규 publishable/secret 키 체계로 전환하고, `@supabase/server`(Edge Functions 전용 SDK)는 도입하지 않는다

grooman의 3분할 Supabase 클라이언트(`lib/supabase/{client,server,admin}.ts`)가 읽는 환경변수 이름을 `NEXT_PUBLIC_SUPABASE_ANON_KEY`→`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`→`SUPABASE_SECRET_KEY`로 바꾼다. 클라이언트 생성 함수(`createBrowserClient`/`createServerClient`/`createClient`)의 시그니처는 그대로이며 값만 교체되므로 코드 구조 변경은 없다. 함께 안내된 `@supabase/server` 패키지는 **도입하지 않는다** — Deno/Cloudflare Workers용 Edge Functions SDK로, Vercel Node.js 런타임인 grooman과 실행 환경이 다르다.

- Related TODO / issue: GRM-013 작업 중 Supabase 대시보드 "Connect" 패널 안내를 사용자가 전달, 확인 질문 후 "전체 마이그레이션"으로 승인
- Related PR: (이 브랜치)

## Context

- Supabase가 기존 `anon`/`service_role` 키를 `publishable`(`sb_publishable_...`)/`secret`(`sb_secret_...`) 키로 교체하는 정책 변경을 발표했다([공지](https://github.com/orgs/supabase/discussions/29260)). legacy 키는 **2026년 말까지** 병행 동작하나 신규 키 사용을 공식 권고한다.
- 사용자가 Supabase 대시보드에서 `@supabase/server` 설치 + `SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY`/`SUPABASE_JWKS_URL` 안내를 그대로 전달했다. 이 안내는 범용 백엔드/Edge Functions 온보딩 흐름이라 Next.js 전용 안내와 이름 규칙이 다르다(예: `NEXT_PUBLIC_` 접두사 없음).
- 공식 문서(`search_docs`) 확인 결과: `@supabase/server`는 `withSupabase()`로 `Deno.serve` 핸들러를 감싸 요청마다 인증된 클라이언트를 만들어주는 **Edge Functions 전용** 패키지다. grooman은 Vercel의 Next.js 서버리스 함수로 동작하므로 이 패키지가 요구하는 런타임 계약과 맞지 않는다.
- Next.js 전용 공식 예제는 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 그대로 `createBrowserClient`/`createServerClient`에 넘기는 형태로, 함수 시그니처 변경이 없다.

## Considered Options

- **옵션 A — 현행 legacy anon/service_role 키 유지** — 장점: 아무 작업 불필요, 2026년 말까지 정상 동작 / 단점: 마감 임박 시 몰아서 전환해야 함, 신규 키가 제공하는 보호(브라우저에서 secret key 사용 시 401 차단 등)를 못 받음.
- **옵션 B — `@supabase/server` 설치 + 안내된 이름 그대로 전 계층 재작성** — 장점: 사용자가 받은 안내를 그대로 따름 / 단점: 잘못된 런타임(Edge Functions)용 패키지를 Next.js 서버리스에 억지로 끼워 넣게 됨 — 실행되지 않거나 불필요한 의존성만 추가.
- **옵션 C (채택) — 키 값만 publishable/secret으로 교체, `@supabase/server`는 도입하지 않음** — 채택 이유: `@supabase/ssr`/`@supabase/supabase-js`가 이미 새 키 포맷을 그대로 받으므로 클라이언트 구조를 바꿀 이유가 없다. 코드 변경을 환경변수 이름 교체로 최소화하면서 신규 키 체계의 이점(조기 전환·세분화된 키 관리)은 확보한다.

## Decision

- `lib/supabase/client.ts`, `lib/supabase/server.ts`: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `lib/supabase/admin.ts`: `SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SECRET_KEY`.
- `lib/utils/posts.ts`의 `isSupabaseConfigured()` 가드도 동일하게 갱신.
- `@supabase/server` 패키지는 설치하지 않는다. grooman에 Edge Functions가 생기면(현재 없음) 그때 별도로 재검토.
- `.env.example` 신설(기존에 없었음) — 새 키 이름을 캐노니컬 레퍼런스로 문서화.
- 실제 키 값 발급·회전(Supabase Dashboard → Settings → API Keys)과 Vercel/로컬 `.env.local`에 값을 넣는 작업은 **사람(hayden)** 이 한다 — AI는 시크릿 값을 다루지 않는다.

## Consequences

- 쉬워지는 것: 2026년 말 강제 마감 이전에 미리 전환 완료. 신규 키의 브라우저-secret-key 차단 등 부가 보호를 받는다.
- 어려워지는 것: 사람이 Dashboard에서 새 키를 발급하고 Vercel(Production/Preview) + 로컬 `.env.local`에 값을 넣기 전까지는 **모든 Supabase 연동이 끊긴다**(값 자체가 아니라 이름이 바뀌었으므로 기존 legacy 값은 새 변수명 아래에서 인식되지 않음). 배포 전 반드시 값 교체가 선행돼야 한다.
- **되돌리기 비용**: 낮음 — 환경변수 이름 4곳 + `.env.example` 롤백이면 legacy 키로 복귀 가능. 코드 구조(3분할 클라이언트)는 그대로다.
- **Change Class 판정**: **B** (인증/인가 관련 키 체계 변경).

## Approval Evidence

- 사용자가 Supabase 대시보드 안내를 전달 → AI가 "전체 마이그레이션 / 새 키만 발급 / 보류" 중 확인 질문 → 사용자가 "전체 마이그레이션" 선택 (AskUserQuestion, 2026-07-22).

## Related

- [[ADR-0003]] RLS 보안 모델 — `admin.ts`(구 service-role, 신 secret key)가 우회하는 경계를 정의.
