# Checkpoint — GRM-001 배포환경 Lighthouse 실측

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Sonnet 5, Claude Code)
- Branch: `main` (아직 이 작업 커밋 전 — 다음 스텝에서 브랜치 분리 필요)

## 방금 한 것 (이번 세션)

- 사용자가 PR#17 머지 확인 → GRM-001 "숫자 측정해줘" 요청.
- `grooman-2y5xehc05-....vercel.app`(배포별 URL)은 Vercel Deployment Protection(SSO)에 막혀 302 리다이렉트 — 측정 불가. **`grooman.vercel.app`(project alias)는 보호 없이 200** — 이걸로 측정.
- `npx lighthouse` CLI(13.4.1)로 mobile 4카테고리 실측. **주의**: 처음에 `--preset=perf`를 썼더니 Performance만 나옴(다른 3카테고리 실행 안 됨) — `--only-categories=performance,accessibility,seo,best-practices`로 바꿔서 재실행.
- production에 **게시글이 0건**이라 `/posts/[id]`·`/profile/[username]`은 측정 불가 — 3/5경로(`/`, `/hair`, `/search`)만 측정.
- 결과: `/` perf 61(LCP 5.0s·CLS 0.359, 둘 다 나쁨) / `/hair` perf 88(근접 미달) / `/search` perf 98·SEO 66(의도된 noindex, 결함 아님). Accessibility 전 경로 95(color-contrast만).
- **근본 원인 진단**: `app/globals.css:1`의 `@import url('https://cdn.jsdelivr.net/.../pretendard.../...css')`가 렌더블로킹+서드파티 origin이라 CLS·LCP를 끌어올림. GTM 스크립트(114KB)도 최대 리소스지만 이건 의도된 비용.
- `40_dev/snapshots/lighthouse-measurement-2026-07-24.md` 작성 — 결과표·원인진단·fix 후보 정리.
- TODO.md GRM-001, HANDOFF.md(Open Issues에 PERF-1 신규, Recent Changes) 갱신 완료.

## 다음 구체 행동

1. **아직 커밋 안 함** — 이 세션 다음 스텝: 새 브랜치 분리 → wrap → ship → PR (측정 문서 + TODO/HANDOFF 갱신만, 코드 변경 없음)
2. **사용자에게 물어볼 것**: Performance 미달의 fix 후보는 `next/font/local`로 폰트 self-host인데, 실제 폰트 파일(Pretendard Variable, OFL 라이선스)을 저장소에 추가해야 하는 코드 변경이다 — "측정해줘"라는 원래 요청 범위를 넘어서므로 진행 여부를 사용자에게 확인 후 진행할 것.
3. color-contrast(Accessibility 95→100)는 Tailwind 클래스 치환 수준이라 상대적으로 안전 — 같이 진행할지도 물어볼 것.
4. `/posts/[id]`·`/profile/[username]` 재측정은 크롤/봇 콘텐츠가 생긴 뒤.

## 막힌 것 / 주의

- 없음. 순수 측정+진단 세션.

## 환경

- production alias: `grooman.vercel.app` (측정용, 보호 없음) — 배포별 URL은 SSO로 막힘, 커스텀 도메인(grooman.kr) 아직 미연결
- Lighthouse 리포트 원본: `/private/tmp/claude-501/.../scratchpad/lighthouse/{home,hair,search}.json` (세션 스크래치패드, 영구 아님)
