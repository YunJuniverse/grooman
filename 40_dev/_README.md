# 40_dev — 개발 산출물 (Dev Artifacts)

> 30_planning/이 *무엇을 만드는가*를 정의했다면, 40_dev/는 *어떻게 빌드하는가*를 담는다.

## 구성

- `MASTER_PLAN.md` — 18번 지침 기반. 프로젝트당 1개의 살아있는 페이즈/MVP/게이트 단일 출처
- `adr/` — Architecture Decision Records (Class B/C 결정 기록)
- `snapshots/` — 날짜별 산출물·리뷰·런북

## 흐름

```
30_planning/* (무엇)
   ↓
40_dev/MASTER_PLAN.md (어느 페이즈에)
   ↓
TODO.md (어느 작업으로 · 선택: milestone: 태그)
   ↓
code + adr/ + snapshots/
```
