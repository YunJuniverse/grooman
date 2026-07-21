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

### GRM-013
- **title**: 측정 인프라 구축 — GA4 + Search Console (P1 필수 — G5)
- **mode**: fullstack
- **change-class**: A
- **owner**: AI + Human
- **milestone**: P1
- **acceptance criteria**:
  - [ ] GA4(또는 경량 대안) 설치 — 페이지뷰·세션·가입 전환 이벤트 수집
  - [ ] Search Console 등록 + 소유권 확인 메타 + sitemap 제출
  - [ ] 마케팅기획서 §9 KPI 표의 지표가 실제 수집되는지 확인
- **notes**: 마케팅기획서 작성 중 발견(G5) — 분석 도구·서치콘솔 전무. 검색 유입 전략(P1)의 전제 조건. 계정 생성은 사람(hayden), 코드 삽입은 AI.

### GRM-012
- **title**: 신고 기능 + 계정 제재 수단 구현 (P1 필수 — G1·G4)
- **mode**: fullstack
- **change-class**: B (스키마 변경: reports 처리 상태·profiles 정지 컬럼·RLS)
- **owner**: AI + Human
- **milestone**: P1
- **acceptance criteria**:
  - [ ] 글/댓글 신고 UI(사유 5종) → reports 기록, 중복 신고 방지
  - [ ] 관리자 신고 처리 큐(목록·필터·조치·사유 기록) — 처리 상태 전환
  - [ ] `profiles` 정지 상태(작성 정지 기한) 컬럼 + RLS(정지 중 INSERT 차단) + 관리자 정지/해제 액션
  - [ ] 12 운영기획서 §4.1 프로세스·§5 제재 단계와 정합(문서→코드 순서)
- **notes**: 2026-07-22 사람 결정(G1=P1 필수). G4(정지 수단 부재)는 12 운영기획서 작성 중 발견 — 제재 기준의 집행 수단이라 세트 구현. 상세 기준: [[12_운영기획서]] §4.1·§5·§8.

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
  - [x] 14 브랜드기획서 v1 — 머지(PR#4)·tagline 확정 반영(v1.1)
  - [x] 11 서비스기획서 v1 — 머지(PR#5)·G1=P1 확정 반영(v1.1)
  - [x] 12 운영기획서 v1 — 머지(PR#6)·제안값 확정(v1.1)
  - [x] 13 마케팅기획서 v1 — 머지(PR#7)
  - [x] 15 PM기획서 v1 초안 — 방법론 인스턴스화·OKR·프리모템(법률 검토→크리티컬 패스 승격)·게이트 카탈로그 (리뷰 대기)
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
