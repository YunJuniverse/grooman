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

### GRM-012
- **title**: 신고 기능 + 계정 제재 수단 구현 (G1·G4 해소)
- **notes**: Completed 2026-07-22. 신고 5종 UI(`ReportButton`)→reports(중복방지 unique)·어드민 신고관리 탭(목록·필터·처리/기각)·계정 정지(`005` 마이그: suspended_until+INSERT RLS·회원관리 7/30/영구·해제). 순수로직 `lib/moderation/reports.ts`+테스트 10종. 부수: `profiles_update_admin` RLS로 기존 toggleAdmin 잠재버그 해소. 테스트 21/21·build ✓. 정합: 12 v1.2·11 v1.3. Class B(스키마·RLS). [[12_운영기획서]] §4.1·§5.

### GRM-014
- **title**: AI-001 가드 강화 — fail-closed + zod 스키마 검증 + temperature 0
- **notes**: Completed 2026-07-22. `lib/ai/crawl-analysis.ts` 신설(zod 스키마 — clinic enum 구조 거부) + `claude.ts` fail-closed 재작성 + **테스트 인프라 도입**(vitest, 단위 테스트 11종 전부 통과) + tsc·build 클린. CRAWL-2 해소. AC④: fail-closed로 키 부재가 안전해져 릴리스 게이트 추가 불요 판정. [[AI-001_crawl-analysis]] v1.1.

### GRM-011
- **title**: 30_planning 기획서 시리즈 디벨롭 (지침 10~17 기반)
- **notes**: Completed 2026-07-22. 7/7 — 10 사업·14 브랜드·11 서비스·12 운영·13 마케팅·15 PM·16 AI-001+17 평가(PR#3~#9 머지). 부산물: 구현 갭 4건 적발(G1 신고·G4 제재·G5 측정·CRAWL-2 fail-open)→GRM-012/013/014, 법률 검토 크리티컬 패스 승격(프리모템). 전 문서 status: active 전환.

### GRM-010
- **title**: 봇 teardown 수단 + 공개 배포 릴리스 게이트
- **notes**: Completed 2026-07-22. `profiles.is_bot` 마이그레이션(`004_bot_flag.sql`)+기존봇 백필, 시더가 is_bot 세팅(식별 일원화), teardown 스크립트(`supabase/scripts/teardown_bots.sql`, 글·댓글 우선 삭제로 SET NULL 방치 방지), 릴리스 게이트 SOP(`00_briefs/standing/SOP_public-release-gate.md`). 실행(프로덕션 teardown+0건 검증)은 공개 배포 시 SOP대로. BOT-1 해소. [[ADR-0002]].


