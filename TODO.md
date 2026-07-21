# TODO.md

> Active backlog only.
> Use stable IDs.
> Completed detail belongs in git history, PRs, or dated snapshots — not here.
> 칸반보드(대시보드)가 아래 5개 섹션 헤더(`## Backlog`, `## Ready`, `## InProgress`, `## Blocked`, `## Done`)를 그대로 파싱한다. 헤더 이름을 바꾸지 마라.
> **WIP 캡**: `## InProgress`는 최대 3개(권장 1~2). wrap이 초과 시 경고 — AI 팬아웃/미완결 누적 방지. (METH-086)
> **`milestone:` 태그(선택)**: 페이즈보다 작고 태스크보다 큰 그룹핑이 필요하면 `- **milestone**: M1`. 별도 스프린트 층 없음 — cadence는 flow 메트릭.

## Backlog

### GRM-010
- **title**: 봇 시딩 진정성·공개(disclosure) 정책 결정
- **mode**: planning-only
- **change-class**: C
- **owner**: Human
- **acceptance criteria**:
  - [ ] AI 생성 봇 계정(실사용자와 구분 불가, `002_seed_bots.sql`)을 서비스에 유지할지 결정
  - [ ] 유지 시 봇/자동수급 콘텐츠 공개 표기(예: "AI 생성"·"자동수집" 뱃지) 여부 결정
  - [ ] 개인정보처리방침·이용약관과 정합성 확인
- **notes**: retro-ADR-0002가 표면화한 미결 결정. 콜드스타트 부트스트랩 목적은 이해하나, 진정성·이용자 신뢰·표기 의무는 사람 판단 필요(Class C). [[ADR-0002]] 참조.

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
