---
doc_id: user-guide
title: in-spire 사용자 가이드 — 시작부터 코드 인계까지
version: v1.0.0
status: active
last_updated: 2026-05-14
ai_relevance: rule
audience: human
---

# in-spire 사용자 가이드

> **사람의 워크플로** 기준으로 방법론 시작부터 외주 인계까지 정리.
> AI 측 운영 규칙은 `CLAUDE.md` / `AGENTS.md`. 본 문서는 *당신(인간)* 측 매뉴얼.

---

## 0. 한 줄 요약

> *Finder 에서 `in-spire (mac).app` 더블클릭 → 대시보드 열림 → AI 와 자연어로 대화 → `methodology ship` 한 명령으로 commit·push.*
> 외주 인계는 `methodology export --zip` 한 줄.

---

## 1. 신규 프로젝트에 방법론 적용

```bash
cd ~/Projects
python3 /Users/hayden/methodology/60_tools/methodology.py init my-project --type fullstack
cd my-project
```

결과 폴더 구조:
```
my-project/
├── 00_briefs/         ← 인간 입력 (리서치·아이디어·회의록)
├── 10_foundation/     ← 헌법 (WHITEPAPER 등)
├── 20_guides/         ← 도메인별 작성 지침
├── 30_planning/       ← 기획 산출물
├── 40_dev/            ← 개발 산출물 (ADR·snapshots)
├── 50_resources/      ← templates·prompts·catalog·skeletons
├── 60_tools/          ← methodology CLI
├── _start/            ← 더블클릭 진입점 (3 OS)
├── CLAUDE.md / AGENTS.md / HANDOFF.md / TODO.md / ONBOARDING.md
└── (src/, package.json 등 — 본인 코드 자유)
```

---

## 2. 매일 시작 — 진입점 하나

### macOS
1. Finder → 프로젝트 폴더 → `_start/` → **`in-spire (mac).app` 더블클릭**
2. 자동: dashboard 빌드 + background HTTP 서버 + 브라우저 자동 열림
3. 첫 1회만 *"확인되지 않은 개발자"* 경고 → **우클릭 → 열기**

### Windows
1. 첫 1회 `_start/settings/setup-windows.ps1` 우클릭 → PowerShell 에서 실행
2. 생성된 `_start/in-spire (windows).lnk` 더블클릭

### Linux
1. 첫 1회 `bash _start/settings/setup-linux.sh`
2. `_start/in-spire (linux).sh` 실행 또는 `~/.local/share/applications/` 에 `.desktop` 등록

### AI 세션 시작
1. Claude Code / Codex / 기타 AI 도구 열기
2. **`<프로젝트> 이어서`** 한 줄
3. AI 가 자동: `.ai/context.json` → `must_read` 로드 → `00_briefs/current/*.md` 읽음 → `.ai/checkpoint.md` 보고
4. AI 첫 메시지에 *dashboard URL* 포함됨

---

## 3. 인간이 던지는 입력 — `00_briefs/current/`

### 무엇을 던지나
- **아이디어**: "사용자 onboarding 단순화 해보면 어떨까"
- **리서치 결과**: 시장·경쟁·기술 문서 요약
- **회의록**: 사용자 인터뷰·내부 회의
- **방향성**: "이번 분기는 X 에 집중"

### 어떻게 던지나
파일명 컨벤션 `YYYY-MM-DD_<topic-slug>.md`:

```
00_briefs/current/2026-05-14_onboarding-simplification.md
00_briefs/current/2026-05-14_competitor-research.md
```

내용은 *raw 자유 형식*. Markdown·평문·링크 모두 OK.

### AI 가 언제 읽나
- 매 세션 시작 시 *전체 자동 로드*
- `"브리프 다시 봐줘"` 명시 요청 시
- 작업 보고 시 *어느 brief 의 §몇* 을 반영했는지 명시

### 보관·정리
- *수시 추가/수정* OK
- 시간 지난 brief 는 `00_briefs/archived/` 로 이동 (인간 결정)
- **삭제 금지** — 옛 맥락도 학습 데이터

---

## 4. 작업 중 — AI 와의 흐름

| 사용자 입력 | AI 동작 |
|---|---|
| "사업기획서 §3 다듬어줘" | 30_planning/10_사업기획서.md 편집 + 변경 사항 보고 |
| "ICONS-042 (다운로드 통계 섹션) 구현해줘" | src/ 코드 작성 + 테스트 + 결과 보고 |
| "어제 브리프 다시 봐줘" | 00_briefs/current/*.md 재로드 + 반영 가능성 보고 |
| "이거 Class B 야" | ADR 작성 + PR 본문에 영향·롤백 명시 |
| **"마무리"** 또는 **"ship"** | `methodology ship` 7단계 자동 |

### 결과 확인 — 진입점 분리
| 종류 | 어떻게 |
|---|---|
| **Dashboard** (현재 진행 상황) | `_start/in-spire (mac).app` 더블클릭 |
| **로컬 dev server** (pnpm dev) | Dashboard 의 **Local Dev Servers** 카드 → Start |
| **Vercel preview** (라이브) | PR 머지 또는 push 후 GitHub → Vercel 자동 배포 |
| **다른 브랜치 dashboard** | Dashboard 의 **Branches** 카드 → 라디오 선택 → Open dashboard |

---

## 5. 작업 종료 — `methodology ship` 한 줄

```bash
methodology ship -m "feat: 기능 X 구현"
```

자동 7단계:
1. wrap (4 라이브 파일 갱신 검증)
2. manifest-check (60_meta 격리)
3. sensitive 파일 검사 (.env/credentials)
4. pnpm test (package.json 있으면)
5. pnpm build
6. git add -A + commit
7. git push origin <branch>

하나라도 실패 → push 안 됨. 안전.

### pre-push hook (1회 설치)
```bash
methodology hooks install
```
이후 `git push` 직접 호출해도 *wrap + manifest-check 자동* 검증.

---

## 6. 외주 인계 — `methodology export` 한 줄

```bash
# 1. 미리보기
methodology export --dry-run

# 2. 추출
methodology export                  # ~/<project>-handover/ 폴더
methodology export --zip            # tar.gz 압축

# 3. sensitive (.env 등) 의도 확인 후
methodology export --allow-sensitive
```

자동 제외:
- 모든 NN_ 방법론 폴더 (00_briefs ~ 90_archive)
- `_start/`, `.ai/`, `.claude/`, `.codex/`, `.methodology-version`
- `CLAUDE.md`, `AGENTS.md`, `HANDOFF.md`, `TODO.md`, `ONBOARDING.md`
- 빌드 산출물 (`node_modules`, `.next`, `dist`, `coverage` 등)
- OS·캐시 (`.DS_Store`, `.eslintcache`, `*-debug.log`)

자동 검증:
- 결과 폴더에 *방법론 흔적 0* 보장 (이중 안전망)
- sensitive 파일 *기본 차단* (의식적 `--allow-sensitive`)

---

## 7. 자주 사용 명령 (Cheatsheet)

> 대시보드의 **Commands** 카드에서도 클릭 한 번으로 클립보드 복사.

### 부팅·작업
| 명령 | 시점 |
|---|---|
| `_start/in-spire (mac).app` (더블클릭) | 매일 시작 |
| `methodology dashboard` | dashboard 빌드 + 서빙 + 브라우저 |
| `methodology dashboard list` | 떠 있는 모든 dashboard |
| `methodology dashboard stop --all` | 모두 종료 |
| `methodology dashboard --branch feat/x` | 다른 브랜치 dashboard (worktree 격리) |

### 종료·검증
| 명령 | 시점 |
|---|---|
| `methodology ship -m "..."` | 작업 종료 (검증+commit+push) |
| `methodology wrap` | 4 라이브 파일 갱신 점검 |
| `methodology wrap --strict` | 누락 1건이라도 있으면 exit 1 |
| `methodology hooks install` | pre-push 자동 검증 (1회) |

### 운영
| 명령 | 시점 |
|---|---|
| `methodology status` | 본 저장소 commit 격차 확인 |
| `methodology sync --apply` | 방법론 자산 최신화 |
| `methodology manifest-check` | 격리 안전망 검증 |
| `methodology observe --slug X --summary "..."` | L1 관찰 직접 작성 (보통 자동) |

### 외주 인계
| 명령 | 시점 |
|---|---|
| `methodology export --dry-run` | 인계 미리보기 |
| `methodology export --zip` | tar.gz 추출 |
| `methodology export --allow-sensitive` | .env 의도 포함 |

---

## 8. 변경 클래스 (Class A/B/C)

| Class | 트리거 | 게이트 |
|---|---|---|
| **A** | 기본 — 기능·UI·리팩토링·버그수정 | PR 머지 |
| **B** | DB 마이그레이션 / 외부 API / 인증 / 파괴적 데이터 | PR + 결정 근거·영향·롤백 |
| **C** | 가격·법무·브랜드·공개 릴리스·헌법(WHITEPAPER) 변경 | ADR + 명시적 사람 승인 |

AI 는 자동 트리거를 *임의로 A 로 강등하지 않음*. 사용자도 B/C 를 *상향 분류 가능*.

---

## 9. 문제 해결 (Troubleshooting)

| 증상 | 진단 / 해결 |
|---|---|
| dashboard 안 열림 | `methodology dashboard stop --all` 후 재호출 |
| dashboard 가 *다른 프로젝트* 표시 | 현재 폴더에서 `methodology dashboard` 호출 (자동 포트 또는 다른 프로젝트 종료) |
| `http://localhost:8765/` Directory listing | 이미 fix됨. 옛 dashboard 라면 `sync --apply` |
| ship 실패 — wrap 4/4 ✗ | 누락된 라이브 파일 갱신 후 ship 재호출 |
| ship 실패 — sensitive 차단 | `.env` 의도 확인. 별도 처리 또는 `--allow-sensitive` |
| ship 실패 — test/build | 코드 수정 후 ship |
| 적용 프로젝트의 CLI 가 옛 동작 | `cd ~/methodology && git pull` 후 `python3 60_tools/methodology.py sync --apply --path <project>` |
| 외주 인계 후 *방법론 흔적 발견* | 본 저장소 export 로직 점검 — `60_tools/methodology.py` 의 EXPORT_EXCLUDE_* |

---

## 10. 흐름 다이어그램

```
[신규 프로젝트]
    └─ methodology init → 폴더 구조 + 진입점 자동 생성

[매일]
    ├─ in-spire (mac).app 더블클릭
    │       └─ dashboard 열림 (http://localhost:8765)
    │
    ├─ 00_briefs/current/ 에 메모 던지기 (수시)
    │
    ├─ AI 세션: "이어서" → AI 가 brief + checkpoint 자동 로드
    │
    ├─ AI 와 자연어 대화 — 코드·문서 작성
    │
    ├─ Dashboard 의 Dev Servers 카드 → pnpm dev (필요시)
    │
    └─ 작업 단위 종료
        └─ methodology ship -m "..." (7단계 자동)
            └─ GitHub 에 push

[외주 인계]
    └─ methodology export --zip → 코드만 tar.gz
```

---

## 11. 더 알아보기

- **철학·원칙**: `10_foundation/WHITEPAPER.md` (헌법)
- **AI 측 운영 규칙**: `CLAUDE.md` / `AGENTS.md`
- **인계서**: `.ai/checkpoint.md`
- **현재 상태**: `HANDOFF.md`
- **백로그**: `TODO.md`
- **자가발전 자산**: `50_resources/catalog/` (Problem-Solution), `70_meta/` (메타-방법론)

본 가이드는 *살아있는 문서*. 워크플로 변화 시 갱신 — `methodology ship` 시 본 파일도 함께.
