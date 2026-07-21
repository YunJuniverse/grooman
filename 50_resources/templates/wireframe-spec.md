# 와이어프레임 명세 (Wireframe Spec) — 템플릿

> 용도: Figma 없이 마크다운만으로 구현 참조용 화면 설계(AI·외주 인계 최적). 지침 `20_guides/11_서비스기획서_작성_지침.md` §19.5(스토리보드) · `20_guides/18_개발_마스터_플랜_작성_지침.md` §18.5 참조.
> 2025-26: 고충실 프로토타입(Figma)이 화면의 SSOT이고, 이 문서는 *주석*(상태·엣지케이스·의도)으로 축소(Cagan). AI가 화면을 생성하되 **상태를 빠뜨리므로**(대시보드 92%가 empty state 누락) 5-state를 표로 강제.

| 항목 | 내용 |
|------|------|
| 버전 / 작성일 / Status(Ready for dev?) | |
| 기반 문서 (상류) | |
| 범위 (Phase/Sprint) | |
| Prototype 링크 (시각 SSOT) | (Figma 프레임 URL) |

## 1. Screen List

| Screen ID | Name | Purpose | 소속 Flow/Step | Priority |
|---|---|---|---|---|

## 2. <Screen ID> — <화면명>

- **소속 플로우/Step**: (user-flow 역참조) · **Entry 조건**: (도착 경로·필요 상태)

```
┌────────────────────────────┐
│ [1 Header]                 │
├────────────────────────────┤
│  [2 콘텐츠]                 │
│  [3 액션]                   │
└────────────────────────────┘
```

### 요소 (번호 콜아웃)
| # | 요소 | 설명 | 액션 → 결과 | 검증(validation) |
|---|---|---|---|---|
| 1 | | | | |

### 화면 상태 (5-state — 필수)
> AI가 가장 잘 빠뜨리는 것. 각 상태의 카피·동작을 채운다(카피 원본은 `microcopy.md`).

| 상태 | 표시/동작 |
|---|---|
| Empty (데이터 없음) | (온보딩/액션 유도 — "없음" 금지) |
| Loading | (Skeleton UI 필수, 스피너 단독 금지) |
| Partial (일부 로드/실패) | (진행 표시) |
| Error | (명확·실행가능한 복구) |
| Success (정상) | |

- **Exit / next screens**: (각 액션이 가는 곳 — 플로우 분기와 연결)
- **Responsive**: (mobile / tablet / desktop 브레이크포인트별 레이아웃)
- **Accessibility**: (포커스 순서 · 라벨/역할 · 스크린리더 안내 · 대비)
- **Notes**: (인라인 에러 vs 토스트 구분 등)

**원칙**: 화면마다 요소 콜아웃 + **5-state**(Empty/Loading/Partial/Error/Success) + 접근성·반응형을 고정. 시각 원본은 Figma("prototype is the spec"), 이 문서는 그것이 못 담는 *상태·엣지케이스·의도*를 담는다.
