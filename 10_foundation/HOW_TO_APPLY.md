# How To Apply

> 이 방법론을 새 프로젝트에 붙이는 실무 절차.

---

## 1. Choose A Mode

| Mode | 언제 쓰는가 | 생성되는 코드 폴더 |
|------|-------------|-------------------|
| `fullstack` | 구현까지 갈 프로젝트 | `src/`, `tests/` 생성 |
| `planning-only` | 리서치/기획만 필요한 프로젝트 | 없음 |

핵심 차이는 코드 유무다. 승인 방식은 둘 다 PR 또는 issue evidence를 남기는 쪽으로 가져간다.

---

## 2. Initialize A Project

```bash
METHODOLOGY="/Users/hayden/Library/Mobile Documents/iCloud~md~obsidian/Documents/methodology"
cd ~/Projects
python3 "$METHODOLOGY/60_tools/methodology.py" init my-project --type fullstack
```

생성 결과:

```text
my-project/
├── CLAUDE.md, AGENTS.md
├── HANDOFF.md, TODO.md
├── .github/PULL_REQUEST_TEMPLATE.md
├── 10_foundation/    # WHITEPAPER / HOW_TO_APPLY / KICKOFF / DIAGRAM
├── 20_guides/        # 작성 지침서 11종
├── 30_planning/      # 기획 산출물 v0
├── 40_dev/           # MASTER_PLAN / adr / snapshots
├── 50_resources/     # templates / prompts
├── 60_tools/         # methodology.py / generate-dashboard.py / methodology-graph.json
├── src/              # fullstack만
└── tests/            # fullstack만
```

---

## 3. Fill Project Settings

처음 세션에서 아래 값만 채우면 된다.

- project name
- objective
- mode
- stack
- primary approver
- release policy

이 값들은 `CLAUDE.md`와 `AGENTS.md` 상단에 들어간다.

---

## 4. Start The First Session

프로젝트 폴더로 이동한 뒤 AI 세션을 연다.

```bash
cd ~/Projects/my-project
```

첫 메시지는 [KICKOFF_PROMPT.md](KICKOFF_PROMPT.md)를 기준으로 보낸다 (같은 폴더).

첫 세션의 목표는 보통 아래 네 가지다.

1. Project Settings 채우기
2. `TODO.md`를 첫 backlog로 만들기
3. `HANDOFF.md`를 현재 상태 기준으로 초기화하기
4. 첫 작업의 Change Class를 판별하기

---

## 5. Session Rhythm

> **Day-1 코드 가드레일**: 프로젝트 첫 설정 시 `20_guides/19_클린아키텍처_클린코드_개발규칙.md` §9 체크리스트로 4-레이어 + 4 린트 가드레일(레이어경계·`no-explicit-any`·`no-console`·`max-lines=400`)을 `warn` 베이스라인으로 깐다 → 0 수렴 후 `error` 승격(래칫). 코드 품질은 *린트가 fail-closed로 강제*.

1. 인간이 TODO와 acceptance criteria를 적는다.
2. AI는 `CLAUDE.md`와 `HANDOFF.md`를 읽는다.
3. 필요한 코드, 테스트, ADR만 추가 로드한다.
4. Change Class를 판별한다.
5. 지침 19 규칙(4-레이어·타입 정직성·파일 크기·테스트)을 지켜 구현하고, lint·typecheck·build·test 게이트 통과 후 PR을 연다.
6. 인간이 리뷰하고 merge한다.
7. AI가 `HANDOFF.md`와 `TODO.md`를 갱신한다.

### Planning-Only

1. 인간이 TODO를 적는다.
2. AI가 필요한 외부 자료를 조사한다.
3. 결과를 `40_dev/snapshots/`에 생성한다.
4. 인간이 PR 또는 issue에서 검토한다.
5. AI가 `HANDOFF.md`와 `TODO.md`를 갱신한다.

---

## 6. Change Class Rules

변경의 위험도에 따라 게이트가 달라진다 — 요지:

- **Class A** (기본): 일반 기능·리팩터·버그픽스. Gate = merged PR.
- **Class B**: 스키마/마이그레이션·외부 API·인증/권한·파괴적 데이터·백그라운드 잡. PR에 근거·영향범위·롤백·리스크 명시.
- **Class C**: 가격/과금·법무/규정·브랜드·공개 릴리스·외부 약속 범위. 구현 전 ADR 또는 이슈 승인 증거 필요.

> **전문(트리거·요구 증거·프로세스·자동 B/C 무단강등 금지)은 [`CLAUDE.md §3`](../CLAUDE.md)이 단일 출처다.** 이 절은 요지만 담는다 — 규칙이 갈릴 땐 항상 CLAUDE.md §3을 따른다. (등급 판정 quickref 표는 `USER_GUIDE.md §8`.)

---

## 7. Keep HANDOFF Short

`HANDOFF.md`는 현재 상태만 담는 파일이다.
길어지기 시작하면 분리하지 말고 먼저 지운다.

정리 기준:

- 완료된 항목은 삭제
- 장기 결정은 ADR로 이동
- 열린 이슈는 상위 몇 개만 유지
- snapshot은 링크만 남기고 본문 요약은 지움

권장 한도는 150줄 이하다.

---

## 8. Snapshot Discipline

Snapshot 문서는 필요할 때만 만든다.

- 날짜를 파일명에 포함
- 문서 상단에 snapshot 경고 삽입
- 외부 사실은 링크로 증명
- 증거 없는 내용은 `Evidence Needed`로 명시

on-demand prompt 예시는 [50_resources/prompts/](50_resources/prompts/)에 있다.

---

## 9. Review Checklist

세션 종료 전에 아래만 확인하면 된다.

- `TODO.md`가 현재 backlog를 반영하는가
- `HANDOFF.md`가 다음 세션 시작점이 되는가
- 필요한 ADR이 빠지지 않았는가
- PR 또는 issue에 승인 증거가 남아 있는가
