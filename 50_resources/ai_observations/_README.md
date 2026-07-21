---
doc_id: ai-observations-readme
title: AI Observations (L1 raw) — 디렉터리 명세
version: v0.1.0
status: active
last_updated: 2026-05-07
ai_relevance: schema
---

# AI Observations (L1 Raw 데이터)

> 매 세션 종료 시 AI가 자동 기록하는 *원천* 로그.
> 위상은 [10_foundation/WHITEPAPER.md](../../10_foundation/WHITEPAPER.md) §5 L1 참조.
> **부패 허용** — 정제는 L3 씽크탱크가 한다. 사용자는 채우지 않는다.
> 작성 규칙은 [20_guides/03_AI_관찰_로그_작성_규칙.md](../../20_guides/03_AI_관찰_로그_작성_규칙.md) 참조 (단일 출처).

---

## 1. 디렉터리 구조

```
50_resources/ai_observations/
├── _README.md
└── YYYY-MM-DD_<slug>.md      ← 세션 1개당 파일 1개
```

파일명 컨벤션:
- 날짜 (UTC) + 짧은 slug (kebab-case, 영문)
- 예: `2026-05-07_l0-bootstrap-and-handoff-sim.md`

## 2. 빠른 스키마 미리보기

상세는 `20_guides/03_AI_관찰_로그_작성_규칙.md`. 요약:

```yaml
---
session_id: ...
authored_by:
  agent: claude-sonnet-4-6
  tool: claude-code-cli
  host_os: darwin-25.4
domain: ...
task_type: bootstrap | feature | bugfix | refactor | research
stack_used: [...]
flow_used: skeleton:webapp-next-v3 | ad-hoc
friction:
  - id: F-001
    where: ...
    cost_minutes: ...
    resolution: ...
    repeat_of: C-014 | null
prompt_patterns:
  - intent: ...
    success: true | false
    rounds: ...
---

(자유서술 1단락 이내)
```

## 2.1 CLI 생성·검증

생성:

```bash
python3 60_tools/methodology.py observe \
  --slug l1-observe-flow \
  --summary "다음 세션 자기 자신에게 남길 1단락 메모" \
  --task-type docs \
  --stack python3 \
  --intent "l1 observation capture" \
  --rounds 2
```

검증:

```bash
python3 60_tools/methodology.py observe --validate 50_resources/ai_observations/YYYY-MM-DD_slug.md
```

## 3. 절대 규칙 (강제)

- ✅ AI가 작성 (사용자 아님)
- ✅ 세션 종료 시점에 작성 — 누락 시 CI fail (백서 §9 리스크 1)
- ✅ 절대 삭제 금지 — *원천 데이터* 보존
- ❌ 칭찬·서술·요약 금지 — 다음 세션의 자기 자신을 위한 사실만
- ❌ 사용자가 손으로 추가/수정 금지 — *원천성* 훼손

## 4. 누가 읽는가

- **L3 씽크탱크** (주간 마이닝) — Catalog 승급 후보 추출, 프롬프트 패턴 분석
- **다음 세션의 AI** — `must_read_optional` 으로 같은 도메인 최근 관찰 N건 로드 (선택)
- **사람** — 분기 회고 시 (직접 읽기보다 L3 인사이트 리포트가 1차)

## 5. 인덱스 (자동 생성 예정)

L3 마이닝 v0 구현 시 `_index.json` 추가 예정 — 도메인·날짜·friction 시그니처별 빠른 조회용.
현재는 파일명 기반 수동 검색.

## 6. 첫 시드

이 디렉터리는 *Stage 1 — L1 관찰 로그* 의 인프라. 첫 관찰은 본 세션 종료 시 작성된다 (`2026-05-07_*.md`).
