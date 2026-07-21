# TODO.md

> Active backlog only.
> Use stable IDs.
> Completed detail belongs in git history, PRs, or dated snapshots — not here.
> 칸반보드(대시보드)가 아래 5개 섹션 헤더(`## Backlog`, `## Ready`, `## InProgress`, `## Blocked`, `## Done`)를 그대로 파싱한다. 헤더 이름을 바꾸지 마라.
> **WIP 캡**: `## InProgress`는 최대 3개(권장 1~2). wrap이 초과 시 경고 — AI 팬아웃/미완결 누적 방지. (METH-086)
> **`milestone:` 태그(선택)**: 페이즈보다 작고 태스크보다 큰 그룹핑이 필요하면 `- **milestone**: M1`. 별도 스프린트 층 없음 — cadence는 flow 메트릭.

## Backlog

_(없음)_

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

### GRM-011
- **title**: 30_planning 기획서 시리즈 디벨롭 (지침 10~17 기반)
- **mode**: planning-only
- **change-class**: A (문서 — 단, 승인은 PR 리뷰 게이트)
- **owner**: AI + Human
- **acceptance criteria**:
  - [x] 10 사업기획서 v1 초안 — 머지됨(PR#3)
  - [x] 14 브랜드기획서 v1 초안 — Dunford 도출·가치 실체화·다면 메시지·정량화 톤·DBA·SoS, [미확정] 3건(tagline·심볼·다크 WCAG) (리뷰 대기)
  - [ ] 11 서비스기획서
  - [ ] 12 운영기획서 · 13 마케팅기획서
  - [ ] 15 PM기획서
  - [ ] 16 AI 기능 기획서 + 17 평가·가드레일 (Eval-First)
- **notes**: 방법론 권장 순서(30_planning/_README.md)대로 한 문서씩 작성→사람 리뷰 게이트. 각 문서 지침(20_guides/10~17)을 로드해 작성. retrofit 특성상 역방향 문서화+전방향 디벨롭 혼합.

## Blocked

_(없음)_

## Done

### GRM-010
- **title**: 봇 teardown 수단 + 공개 배포 릴리스 게이트
- **notes**: Completed 2026-07-22. `profiles.is_bot` 마이그레이션(`004_bot_flag.sql`)+기존봇 백필, 시더가 is_bot 세팅(식별 일원화), teardown 스크립트(`supabase/scripts/teardown_bots.sql`, 글·댓글 우선 삭제로 SET NULL 방치 방지), 릴리스 게이트 SOP(`00_briefs/standing/SOP_public-release-gate.md`). 실행(프로덕션 teardown+0건 검증)은 공개 배포 시 SOP대로. BOT-1 해소. [[ADR-0002]].

### GRM-000
- **title**: 방법론 v4.0 부트스트랩 + 핵심 결정 retro-ADR 문서화
- **notes**: Completed 2026-07-21. 기존 Next.js14+Supabase 앱에 방법론 retrofit, 구 자율빌드 CLAUDE.md는 `00_briefs/reference/`로 보존. 핵심 결정 3건을 소급 문서화 → [[ADR-0001]](자동 크롤 파이프라인)·[[ADR-0002]](봇 시딩)·[[ADR-0003]](RLS 모델). branch `chore/apply-methodology`.
