# TODO.md

> Active backlog only.
> Use stable IDs.
> Completed detail belongs in git history, PRs, or dated snapshots — not here.
> 칸반보드(대시보드)가 아래 5개 섹션 헤더(`## Backlog`, `## Ready`, `## InProgress`, `## Blocked`, `## Done`)를 그대로 파싱한다. 헤더 이름을 바꾸지 마라.
> **WIP 캡**: `## InProgress`는 최대 3개(권장 1~2). wrap이 초과 시 경고 — AI 팬아웃/미완결 누적 방지. (METH-086)
> **`milestone:` 태그(선택)**: 페이즈보다 작고 태스크보다 큰 그룹핑이 필요하면 `- **milestone**: M1`. 별도 스프린트 층 없음 — cadence는 flow 메트릭.

## Backlog

### GRM-010
- **title**: 출시 전 봇 제거 게이트 + 안전한 teardown 수단 확보
- **mode**: fullstack
- **change-class**: B (teardown 수단·스키마) + C (공개 배포 릴리스 게이트)
- **owner**: AI + Human
- **acceptance criteria**:
  - [ ] 봇 식별 수단 통일 — `profiles.is_bot` 컬럼 추가(마이그레이션), 시더가 이 플래그를 세팅하도록 수정
  - [ ] 봇 식별자 불일치 정리 — `002_seed_bots.sql`(@grooman.kr)·`data.ts`(@grooman.internal)·런타임 랜덤 이메일(`seed-bots/route.ts:38`) 일원화
  - [ ] teardown 스크립트/마이그레이션 작성 — 봇 계정 + 봇 생성 posts·comments·likes 전량 삭제(`WHERE is_bot`)
  - [ ] **릴리스 게이트**: 공개 배포 직전 "봇 0건"을 쿼리로 검증(체크리스트 항목화). [[ADR-0002]]
- **notes**: 2026-07-22 결정(GRM-010 해소) — 봇은 출시 전 look 확인용 테스트 픽스처. 실사용자 없으므로 프로덕션 공개 표기는 불필요. 진짜 리스크는 "teardown 불가"(is_bot 컬럼·삭제 스크립트 부재, 식별자 3곳 불일치). 비공개인 지금 정리하는 게 가장 쌈. 상세 [[ADR-0002]].

## Ready

### GRM-001
- **title**: 전 페이지 Lighthouse 90+ 감사 및 최적화
- **mode**: fullstack
- **change-class**: A
- **owner**: AI + Human
- **milestone**: M1
- **acceptance criteria**:
  - [ ] 주요 5개 경로(홈 `/`, 카테고리 `/hair`, 게시글 상세 `/posts/[id]`, 검색 `/search`, 프로필 `/profile/[username]`) 모바일 Lighthouse 측정
  - [ ] 각 경로 Performance·SEO·Accessibility·Best Practices ≥ 90
  - [ ] 미달 항목은 원인·조치 기록 후 재측정으로 통과 확인
- **notes**: 구 자율빌드 체크리스트에서 유일하게 미검증으로 남은 항목(나머지 ~53항목은 실코드 대조 결과 구현 완료). 실측 기반 QA 태스크.

## InProgress

_(없음)_

## Blocked

_(없음)_

## Done

### GRM-000
- **title**: 방법론 v4.0 부트스트랩 + 핵심 결정 retro-ADR 문서화
- **notes**: Completed 2026-07-21. 기존 Next.js14+Supabase 앱에 방법론 retrofit, 구 자율빌드 CLAUDE.md는 `00_briefs/reference/`로 보존. 핵심 결정 3건을 소급 문서화 → [[ADR-0001]](자동 크롤 파이프라인)·[[ADR-0002]](봇 시딩)·[[ADR-0003]](RLS 모델). branch `chore/apply-methodology`.
