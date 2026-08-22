# CLAUDE.md

> This file is auto-loaded by Claude Code at the start of each session.
> Fill the project settings before active work begins.

---

## 1. Project Settings

- **Project Name**: grooman (그루맨, grooman.kr)
- **Objective**: 대한민국 남성 그루밍 전문 커뮤니티·콘텐츠 플랫폼 (브랜드 중립성 최우선)
- **Mode**: fullstack  <!-- 모드별 권장 템플릿 세트는 50_resources/templates/_CATALOG.md 참조 — 필요한 템플릿만 로드. planning-handoff(사람 개발자 인계)는 20_guides/09 재포맷 규칙 적용 -->
- **Stack**: Next.js 14 (App Router·RSC·Server Actions) · Supabase (PostgreSQL·Auth·Storage·RLS) · Vercel (배포·Cron·Edge) · Tailwind + shadcn/ui · Tiptap v2 · Cloudinary · Claude API · TypeScript strict
- **Primary Approver**: hayden
- **Started On**: 2026-07-21  <!-- 방법론 적용일. 코드베이스는 이전부터 존재(자율빌드 스펙: 00_briefs/reference/2026-07-21_grooman-autonomous-build-spec.md) -->
- **Release Policy**: staged

---

<!-- methodology:managed:start id=operating-rules -->
## 2. Operating Rules

<!-- 이 섹션은 원칙·load-bearing 규칙만 담는다(Anthropic 권장: <200줄, 준수율↑). 절차 상세는 지침이 정본 — 복제하지 않고 포인터. METH-083. -->

- Code is the source of truth for implementation; ADR for decisions code can't explain.
- `HANDOFF.md` is the only live state file (<150 lines). `TODO.md` is the active backlog (stable IDs + acceptance criteria).
- **세션·작업 종료 (의무)**: 작업 단위가 끝나면 4개 라이브 파일을 갱신하고 `python3 60_tools/methodology.py wrap`(→`4/4 ✓`)로 검증 후 보고. ① `TODO.md`(완료→Done·신규) ② `HANDOFF.md`(**상태 보드**: Working-on·오픈이슈·Recent 5 terse — *세션 서사 금지*) ③ `.ai/checkpoint.md`(**세션 서사 바통**: 방금 한 것·다음 구체 행동·막힌 것 — *누적 상태는 HANDOFF*, 백서 §2-2) ④ 관찰 로그 — **반드시 CLI**: `methodology.py observe --slug <kebab> --task-type <bootstrap|feature|bugfix|refactor|research|docs> --summary "<50~150자>"` (직접 `cat >` 금지 — 형식오류로 wrap 실패). **비자명한 문제·재발·막힘을 겪었으면 `--friction "where|cost_minutes|resolution|repeat_of"`도 남긴다** — catalog→skeleton 학습 루프의 원료(thinktank가 반복 마찰 ≥2회를 승급 후보로 집계). 마찰 없으면 생략(강제 아님 — 노이즈 방지). **프롬프팅 상시 기록(METH-118, 의무)**: 매 세션 `--rounds-total <총 핑퐁 수>`를 기록하고, 두루뭉술 지시·용어 부재로 라운드가 든 교환은 `--prompting "intent|rounds|모호발췌(≤200자)|교정안|용어|상황태그"`로 남긴다 — 판단(발췌·교정안)은 맥락이 있는 wrap 시점의 세션 AI 몫. 원문 전체 저장 금지. wrap이 `50_resources/prompting-report.md`를 자동 재생성한다. 상세 `50_resources/catalog/_README.md`. wrap v4.1+ = sha256 콘텐츠 비교(실내용 갱신만 통과) + 라이브 파일 비대화 경고(METH-101: HANDOFF>150줄·checkpoint>200줄·Done>6건) — 초과 시 오래된 내용을 git·`40_dev/snapshots`로 이관하고 요지만 남긴다(비대한 HANDOFF은 부팅 프라이머로 무력).
- **commit/push (권장)**: 위 갱신 후 `methodology.py ship -m "<conventional>"` 하나로 wrap+manifest+sensitive+(test/build)+commit+push. 별도 `git add`/`commit`/`push` 금지 — *ship만*.
- **머지 착지 (METH-133)**: push 후 `methodology.py land`(또는 `ship --land`)로 **PR 머지→기본 브랜치 동기화→maincheck**까지 한 번에. **자동 머지는 Class A + CI green 일 때만** — 변경 경로에 Class B/C 트리거(마이그레이션·인증·과금·외부 API 계약·백그라운드 작업·CI 파이프라인·법무/정책)가 걸리거나, CI 실패/진행 중이거나, 판정 자체가 불가하면 land 가 거부하고 사람을 부른다(fail-closed). `--no-ci-check` 는 무검증 머지라 기본 금지. ADR-004.
- **운영 모드 키워드 트리거 (의무, METH-136)**: 사용자 요청에 아래 키워드가 나오면 **해당 지침 본문을 먼저 로드한 뒤 착수**한다 — 이 요약만 보고 시작하지 않는다(요약에는 조건·정지 규칙이 없다). 키워드 표·경계 판정은 `20_guides/01` §5.11.
  - **실험 모드 · god 모드 · 자율 실험 · "제약 없이" · "프로토타입 자유롭게" · 샌드박스 · lab** → **지침 28**. 샌드박스 4조건(실데이터·실사용자·실결제·대외산출물 **없음**)을 **전수 확인**하고 하나라도 어긋나면 일반 모드로 진행하며 그 사실을 알린다. 통과 시 `Lab` 선언(기한·범위·목적 필수, 만료 시 자동 일반 모드)으로 Class B/C 를 **유예**하고, 경계를 넘어 운영으로 올릴 때 **졸업 게이트 7항**을 한 번에 정산. 게이트를 없애는 게 아니라 옮기는 것 — 시크릿·비가역 대외 행동·타인 자원·경계 확대 결정은 실험 모드에서도 그대로 막힌다.
  - **자율주행 · 오토파일럿 · "N시간 알아서" · "밤새 돌려" · 무인 진행 · 루프 작업** → **지침 29**. 사전 요구 4종(권한 사전 승인·샌드박스 경계·컴팩션 앵커·ground-truth 판정수단) 확인 — **권한·샌드박스가 없으면 착수하지 않는다.** 시간을 **사이클(≈45~90분)로 환산**해 기획을 먼저 파일로 남기고(`40_dev/snapshots/<date>_autopilot-plan.md`) 개발→검토→QA→신규작업 도출 루프. 진척은 **ground-truth(테스트·빌드·렌더·diff)로만** 판정(자기평가 금지). **기획이 소진되면 시간이 남아도 종료** — 시간은 할당량이 아니다.
  - 시간 지정 없는 일반 자율("알아서 끝까지"·대규모 전파) → **지침 07**(예산 선언 + 정지 조건). 29보다 가벼운 단발 자율.
- **스택-PR 금지·Done 검증 (의무, METH-120)**: PR은 **main 직행 단일 PR**만 — 열린 PR 브랜치 위에 다음 작업을 쌓지 않는다(앞 PR 머지 후 main에서 새로 분기). 중간 브랜치로 머지되면 "머지됨"이어도 main엔 코드가 없다(6개 repo 실사고). **TODO Done 전이·배포 판정 전 `methodology.py maincheck <sha>`로 main 도달을 기계 확인** — 미도달 상태의 Done 표기는 허위 기록이다.
- **컨텍스트 컴팩션 (의무, 긴 세션)**: 요약 예고 시 *요약 전에* 라이브 파일(특히 `.ai/checkpoint.md`) 먼저 갱신 — 파일에 있으면 요약이 잃어도 복원. 규칙 `20_guides/06_컨텍스트_컴팩션_프로토콜.md`.
- **외부 게이트 = Blocked 강제 (의무, METH-122)**: 대표 승인·결제·자격증명·타인 응답 등 *사람/외부만 풀 수 있는* 대기 항목은 TODO `## Blocked`로 이동하고 HANDOFF Blockers와 일치시킨다 — Ready 체크박스·notes 산문에 숨기지 않는다(전수조사: 4개 repo에서 Blocked 0건인데 실 병목 다수, 최장 19일 은닉). 라이브 파일이 규정 2배를 넘으면 wrap --strict 가 fail — `methodology.py rotate --apply`로 회전(삭제 아님·아카이브 이관). dev 서버 실행 중 build 금지 — ship이 차단하며 수동 빌드는 `60_tools/build-guard.sh` 경유.
- **자율 진행 예산·정지 (권장)**: 다단계 자율 시 착수 전 예산(파일/PR/반복) 선언, no-progress 2회·예산 초과 시 멈춰 보고, 범위 축소 시 남긴 것 보고. `20_guides/07_자율진행_예산_및_정지조건.md` (멀티에이전트 팬아웃 `20_guides/08_서브에이전트_오케스트레이션.md`).
- **외주 인계·로컬 안전망**: 코드만 추출 `methodology.py export --path <p> --dry-run`(방법론·sensitive 기본 차단; `--allow-sensitive`/`--zip`); push 가드 `methodology.py hooks install`(pre-push manifest+wrap --strict).
- 식별자·버전 규칙은 `20_guides/02_식별자_및_버전_관리_규칙.md` 준수 후 새 ID 생성.
- `40_dev/snapshots/`는 날짜 산출물 — 라이브 아님. 사람 승인은 머지된 PR 또는 링크된 ADR·이슈로만 성립.
- Default boot context = `CLAUDE.md` + `HANDOFF.md`; `TODO.md`·관련 코드·테스트·ADR은 필요 시 로드.
- **부팅 시작 (의무)**: 세션 시작 시 *먼저* `python3 60_tools/methodology.py boot` 실행 — 브리프 목록·HANDOFF 포커스·checkpoint 요지·라이브 파일 사이즈 경고·dashboard URL을 한 번에 출력(부팅 계약을 실행 명령으로 격상, METH-101). 그 뒤 ① 나열된 브리프 본문을 *전부* 읽고 반영 보고 — **`00_briefs/standing/`(상시 SOP·반복작업 절차, 아카이브 안 됨)을 항상 먼저**, 그다음 `00_briefs/current/`(날짜순, 옛 브리프 충돌 시 자동 결정 금지·사용자 확인). `00_briefs/_README.md` ② dashboard URL을 첫 보고에 포함. **IR·작업 질문에 곧바로 뛰어들지 말 것** — 부팅 없이·SOP 없이 시작하면 기존 프로세스를 모른 채 오답을 낸다. **반복 작업은 착수 전 해당 `standing/SOP_*`부터 확인.**
- **반복 작업 기억 (요청 시)**: 사용자가 반복·정기 작업을 "기억해줘 / 이건 반복(정기) 작업이야"라고 하면 → `00_briefs/standing/SOP_<topic>.md`로 박제(`00_briefs/standing/SOP_template.md` 형식: 트리거·입력·절차·산출물·주의점). 절차가 바뀌는 걸 감지하면 해당 SOP 갱신 제안. **구분**: 반복 *작업 절차* = repo `standing/` SOP(팀 공유·boot 노출·이 저장소 전용) / 사용자 개인 선호·사실 = 도구 메모리(별개 시스템).
- **방법론 업데이트 제안 (캡슐, METH-117)**: 사용자가 "방법론에 반영해줘 / 나중에 방법론 업데이트에 넣어줘"라고 하면 → **의무**로 `methodology.py capsule --slug <s> --target <t> --summary "<요지>"` 캡슐 생성(1제안=1캡슐=1파일) 후 커밋·push까지. AI 자발 제안은 근거(재발·비용·실사례) 있을 때만 권장 — 노이즈 금지. **포인터+요약 원칙**(git SHA·PR·경로는 `--ref`로, 원문 덤프 금지·시크릿 금지). friction(막힌 사실)과 구분 — 마찰 파생 제안은 `--friction-ref`. 수거는 상류 `collect`(수동)·수거 여부는 상류 원장. 상세 `50_resources/meth_outbox/_README.md`.
- **브리프 자동 분류**: 사용자가 브리프를 던지면 AI가 유형 판별해 해당 폴더에 배치 — 회의→`00_briefs/meetings/`, 리서치·분석→`research/`, 외부 참고자료·링크→`reference/`, 아이디어·방향→`ideas/`, 반복 절차→`standing/SOP_*`. 유형 폴더 파일명 `YYYY-MM-DD_<slug>.md`. 애매하면 사용자에게 유형 확인(그래도 불명확 시 `ideas/`). 규칙표: `00_briefs/_README.md §자동 분류`.
- Do not keep sprint summaries, deliverable tables, or open-issue lists in this file.

---

## 3. Change Class Triggers

### Class A

- Default class.
- Applies to normal feature work, UI copy/style changes, internal refactors, and bug fixes that do not change schema, auth, or external contracts.
- Gate: merged PR.

### Class B

Automatic `Class B` triggers:

- DB migration or schema change
- New external API or changed integration contract
- Authentication or authorization change
- Destructive data change
- Background job, scheduler, or queue introduction

Required evidence in the PR:

- decision rationale
- impact scope
- rollback plan
- data/auth/external-contract risk

### Class C

Automatic `Class C` candidates:

- pricing or billing policy
- legal, compliance, or policy change
- brand or public messaging change
- public release or launch decision
- scope commitment made to outside stakeholders

Process:

- pause implementation
- create or update an ADR or linked issue discussion
- wait for explicit human approval evidence
- implement only after that approval exists

Additional rule:

- AI may escalate work upward from `A` to `B/C`.
- AI must not silently downgrade an automatic `B/C` trigger.

---

## 4. File Roles

| File | Contains | Must NOT contain |
|------|----------|-----------------|
| `CLAUDE.md` | Project settings, change-class rules, workflow rules, file-role definitions, code/test conventions | Current sprint summaries, deliverable version tables, open-issue inventories, evolving implementation status |
| `AGENTS.md` | Codex-facing mirror of `CLAUDE.md` | Same restrictions as `CLAUDE.md` |
| `HANDOFF.md` | **누적 상태 보드**(대시보드 파싱): current focus, open issues/decisions, active links, recent changes(terse 1-line board) | Session narrative — 방금 한 것·step-by-step 다음 행동·막힌 것(→ `.ai/checkpoint.md`); long history, sprint archives, essays, duplicated ADR |
| `.ai/checkpoint.md` | **세션 서사 바통**(콜드스타트 인계·매 세션 덮어씀·컴팩션 생존 앵커): 방금 한 것(이번 세션)·다음 구체 행동·막힌 것·환경 | 누적 상태 — open-issue/decision 표·링크·running history(→ `HANDOFF.md`) |
| `TODO.md` | Active backlog items with stable IDs, mode, change class, owner, acceptance criteria | Full completion archives — move historical detail to git, PRs, or dated snapshots |
| `40_dev/adr/` | Durable decisions that code cannot explain | Implementation detail that belongs in code |
| `40_dev/snapshots/` | Dated outputs, reviews, plans, runbooks | Live operating state — never promote a snapshot to a live document |
| Output channel (`30_planning/*` 기획서, 서비스/랜딩 페이지, 앱 UI, 브랜드 카피 — 맥락 없는 외부 독자와 공유되는 배포물) | 독자가 알아야 할 순수·무시간적 내용 | 작업 메타 — 워크플로우 기제·결정 서사·편집 라벨 (메시지 채널로 라우팅; `20_guides/05_산출물_채널_분리_규칙.md`) |

---

## 5. Human Approval Gates

Phase gates require explicit human instruction before the AI proceeds to the next phase.

Rules:
- AI does not cross a phase gate without a human review and an explicit next instruction.
- A phase gate is only passed when the human provides a named trigger phrase or links durable approval evidence (merged PR, ADR, or issue).
- AI may surface a gate recommendation ("ready for Phase N review") but must not self-advance.

Typical gate points:

| Gate | When | What the human provides |
|------|------|-------------------------|
| Research → Planning | After research deliverable | Instruction to begin planning document |
| Planning → Dev Spec | After planning review | Instruction to write development spec |
| Dev Spec → Build | After spec review | Instruction to start implementation |
| Build → Feedback | After build review | Instruction to begin feedback/hardening pass |
| Feedback → Next Sprint | After feedback integration | Instruction to update spec and start next sprint |
| Final | Work declared complete | Explicit completion declaration |

> Customize gate labels and trigger phrases for your project in `HANDOFF.md` or a project-specific ADR. Keep this section as the structural rule only.

---

## 6. Workflow

### Fullstack

1. Human adds or confirms a backlog item in `TODO.md`.
2. AI reads `CLAUDE.md` and `HANDOFF.md`.
3. AI loads only the relevant TODO, code, tests, and ADRs.
4. AI determines the change class.
5. AI implements the change and opens a PR.
6. Human reviews and merges.
7. AI updates `HANDOFF.md` and `TODO.md`.

### Planning-Only

1. Human adds or confirms a planning item in `TODO.md`.
2. AI reads `CLAUDE.md` and `HANDOFF.md`.
3. AI performs research and writes a dated snapshot under `40_dev/snapshots/`.
4. Human reviews through a PR or issue thread.
5. AI updates `HANDOFF.md` and `TODO.md`.

Restrictions:

- no direct push to `main`
- no approval claims without linked evidence
- no snapshot may be treated as a live operating document

---

## 7. Code And Review Rules

> fullstack/dev 트랙은 아래 규칙을 *린트 가드레일로 fail-closed 강제*한다 — 메커니즘·레이어 의존성 규칙·god파일 분할 패턴은 `20_guides/19_클린아키텍처_클린코드_개발규칙.md` 참조.

### Naming

- files: plural nouns where appropriate (`users.ts`, `orders.ts`)
- banned suffixes: `Manager`, `Helper`, `Util`, `Thing`
- components/classes: PascalCase
- functions/variables: camelCase
- constants/env vars: UPPER_SNAKE_CASE
- types: PascalCase, no `I` prefix

### Structural Rules

- split functions that exceed 50 lines
- avoid nesting deeper than 3 levels
- no `any`; use `unknown` plus type guards
- no production `console.log`
- update barrel exports intentionally, not blindly

### Testing And Errors

- business logic changes require tests
- start from tests by default; if you cannot write tests first, explain why in the PR
- lint and type checks must pass before review
- do not swallow errors; normalize boundary errors intentionally
- auth, data, and external API changes must call out risk explicitly in the PR

### Decision Records

- architecture and product decisions go to `40_dev/adr/`
- use ADRs only when code cannot explain the reason

### Commit Types

- `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

<!-- methodology:managed:end -->
