---
status: accepted
date: 2026-07-21
---

# ADR-0001 RSS 소스를 Cron으로 크롤링해 Claude Haiku가 분류·필터한 뒤 저작자 없는(user_id=null) 글로 자동 게시한다

콜드스타트 콘텐츠 볼륨을 확보하기 위해, 외부 RSS 소스를 Vercel Cron으로 주기 수집하고 Claude Haiku가 카테고리 분류·요약·스팸/광고 필터를 수행한 뒤, 통과분을 `user_id=null`·`is_auto_crawled=true`·`source_url` 출처와 함께 `status='published'`로 **사람 검수 없이 즉시 게시**한다. 그 대가로 자동 게시 품질 리스크와 스키마·백그라운드 잡 결합을 수용한다.

- Related TODO / issue: GRM-010(봇/자동수급 표기 정책)
- Related PR: (retro — 자율빌드 단계에서 이미 구현, 소급 기록)

> ⚠️ 소급(retro) ADR — 결정은 방법론 적용 이전 자율빌드 단계에서 이미 코드로 내려졌다. 정식 승인 증거는 없으며, 본 문서는 현행 코드(`app/api/crawl/route.ts`, `lib/crawlers/rss.ts`, `lib/ai/claude.ts`)가 담고 있는 결정을 재구성한 것이다.

## Context

- 신규 커뮤니티는 콘텐츠가 비어 있어 유입·체류가 안 된다(cold start). 남성 그루밍 도메인의 신선한 글을 지속 확보할 값싼 수단이 필요했다.
- 브랜드 중립성이 최우선 원칙이라, 수집 콘텐츠에서 광고·특정 제품/병원 편향을 걸러야 한다.
- 시술·성형(`clinic`)은 UGC 전용이어야 하며 자동수급 대상이 아니다.

## Considered Options

- **옵션 A — 순수 UGC(자동수집 없음)** — 장점: 진정성·법적 단순함 / 단점: 콜드스타트 미해결, 초기 콘텐츠 공백.
- **옵션 B — 크롤 후 사람 검수 큐를 거쳐 게시** — 장점: 품질·저작권 리스크 최소 / 단점: 1인 운영에서 검수 병목, 볼륨 목적 훼손.
- **옵션 C (채택) — 크롤 + AI 자동 분류·필터 + 즉시 게시** — 채택 이유: 1인 운영으로 볼륨·신선도를 확보하는 유일하게 현실적인 수단. 품질은 AI 필터(스팸/광고)와 글자수 하한으로 방어.

## Decision

- Vercel Cron → `GET /api/crawl` (`CRON_SECRET` 헤더/쿼리 검증). 소스당 최대 10건, 200자 미만·중복(`url_hash`) 제외.
- Claude **`claude-haiku-4-5-20251001`** 가 `{category, summary, tags, spam_score, is_advertisement}` 반환. `spam_score >= 0.7` 또는 `is_advertisement`면 `crawl_queue.status='failed'(spam_or_ad)`로 폐기.
- **clinic 자동수급 금지를 AI 프롬프트 레벨에서 강제**: 분류 enum을 `hair|skin|shaving|fragrance|deals`로 한정(=clinic 배제).
- 통과분은 `posts`에 `user_id=null, is_auto_crawled=true, source_url=<원문>, ai_summary=<요약>, status='published'`로 삽입. 저작자 없는 글이므로 **`createAdminClient()`(service role)로 RLS를 우회**해 삽입한다([[ADR-0003]]).

## Consequences

- 쉬워지는 것: 콘텐츠 볼륨·신선도 자동 확보, 카테고리 자동 라우팅, 광고 1차 차단.
- 어려워지는 것: AI 오분류/환각 요약이 그대로 게시됨(검수 게이트 없음); 원문 저작권·출처 표기의 법적 리스크; 검색엔진이 자동 글을 색인.
- **선행조건**: 자동 글의 공개 표기(예: "자동수집" 뱃지) 정책이 정해지지 않았다 → GRM-010에서 봇 시딩과 함께 결정 필요.
- **되돌리기 비용**: 스키마에 `posts.is_auto_crawled`·`user_id` nullable·`crawl_queue`·`crawl_sources` 테이블과 RLS가 묶여 있고, 이미 published·색인된 자동 글이 누적된다. 모델 변경 시 데이터 마이그레이션 + 검색 색인 정리 + 파이프라인 재작성이 필요.
- **Change Class 판정**: **B** (스키마 변경 · 외부 API/RSS 계약 · 백그라운드 잡 · 파괴적이지 않으나 검수 없는 자동 게시).

## Approval Evidence

- (retro — 정식 승인 증거 없음. 방법론 적용 후 첫 human 검토에서 소급 승인 또는 정책 조정 대상.)

## Related

- [[ADR-0003]] RLS 모델(크롤은 admin client로 RLS 우회) · GRM-010(자동수급/봇 표기 정책) · `00_briefs/reference/2026-07-21_grooman-autonomous-build-spec.md`(구 스펙: 카테고리별 자동수급 허용/금지 표).
