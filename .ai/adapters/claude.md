# Claude Code Adapter

> Claude Code CLI에서 본 방법론을 사용할 때의 보조 지침.

## 자동 로드되는 것

Claude Code는 세션 시작 시 다음을 자동 컨텍스트에 포함:

- 루트 `CLAUDE.md` — *AI 운영 규칙*
- `.claude/settings.json` (있으면)

본 방법론은 위에 더해 **명시적**으로 다음을 요청:

- `.ai/context.json` — 부팅 컨텍스트
- `must_read` 배열의 파일들

## 첫 메시지 권장 형식

새 세션을 열 때 사용자가 다음 한 줄을 보내면 충분 — 실제로는 *"<프로젝트> 이어서"* 만 쳐도 AI가 본 절차를 알아서 수행:

```
.ai/context.json을 읽고, must_read 배열의 파일들을 순서대로 읽어 부팅해줘.
그 다음 .ai/checkpoint.md의 "다음 사람에게" 첫 항목 + methodology dashboard URL 을 보고해줘.
```

AI는 부팅 마지막 단계로 *반드시* `python3 60_tools/methodology.py dashboard` 를 호출하고 URL을 첫 보고에 포함한다 (`CLAUDE.md` §2 의무 규칙).

## 세션 종료 자동화

**기본 절차 (의무, 모든 어댑터 공통)**: `CLAUDE.md` / `AGENTS.md`의 *"세션·작업 종료 절차"* 규칙을 따른다 — 4개 라이브 파일(`TODO`, `HANDOFF`, `.ai/checkpoint.md`, ai_observations) 갱신 후 `methodology wrap` 호출.

### Claude Code SessionEnd hook (권장)

`.claude/settings.json` 또는 `.claude/settings.local.json`에 다음 추가:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "python3 60_tools/methodology.py wrap" }
        ]
      }
    ]
  }
}
```

동작:
- 매 세션 종료 시 `methodology wrap` 자동 호출
- 4개 파일 갱신 누락 표시 + git status 요약 출력
- 출력이 다음 세션 컨텍스트에 흔적으로 남아 누락을 후속 세션이 보완하도록 유도

**주의**: hook은 *검증 도구*일 뿐 *자동 갱신*은 하지 않는다. 갱신 책임은 세션 내 AI에 있음. hook은 누락을 *드러낼 뿐*. (α 패턴: AI 자동 작성 → wrap이 검증)

### 수동 호출 (hook 미설정 환경)

세션 종료 직전 사용자가:
```
methodology wrap 호출해서 4개 라이브 파일 갱신 누락 점검해줘. 누락 있으면 갱신하고 다시 호출.
```

## 도구 매핑

| 본 방법론 동작 | Claude Code 구현 |
|---|---|
| 백서 검색 | `Read 10_foundation/WHITEPAPER.md` |
| 폴더 컨벤션 확인 | 백서 §부록 C 참조 |
| 대시보드 빌드·서빙 (URL 보고용) | `Bash python3 60_tools/methodology.py dashboard` (세션 부팅 의무 호출) |
| 부팅·환경 검증 | `Bash python3 60_tools/methodology.py version` |
| 새 프로젝트에 적용 | `Bash python3 60_tools/methodology.py init <path>` |
| 기존 적용 프로젝트 갱신 | `Bash python3 60_tools/methodology.py sync --apply` |
| 폴더 단위 탐색 | `Glob "20_guides/*.md"` 등 |

## 주의

- worktree 환경에서 작업 중일 수 있음. `pwd`와 `git branch --show-current`로 항상 확인.
- Claude Code 자동 로드 컨텍스트가 본 방법론의 운영 규칙(`CLAUDE.md`)과 충돌 시, **`CLAUDE.md`가 이김** — 백서 §8-1 우선순위.
