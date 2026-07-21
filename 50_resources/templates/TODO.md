# TODO.md

> Active backlog only.
> Use stable IDs.
> Completed detail belongs in git history, PRs, or dated snapshots — not here.
> 칸반보드(대시보드)가 아래 5개 섹션 헤더(`## Backlog`, `## Ready`, `## InProgress`, `## Blocked`, `## Done`)를 그대로 파싱한다. 헤더 이름을 바꾸지 마라.
> **WIP 캡**: `## InProgress`는 최대 3개(권장 1~2). wrap이 초과 시 경고 — AI 팬아웃/미완결 누적 방지. (METH-086)
> **`milestone:` 태그(선택)**: 페이즈보다 작고 태스크보다 큰 그룹핑이 필요하면 `- **milestone**: M1`. 별도 스프린트 층 없음 — cadence는 flow 메트릭.

## Backlog

### [ID]-010
- **title**: [짧은 제목]
- **mode**: fullstack / planning-only
- **change-class**: A / B / C
- **owner**: Human / AI / Human + AI
- **acceptance criteria**:
  - [ ] [criterion 1]
- **notes**: 아직 Ready로 끌어올리기 전의 아이디어

## Ready

### [ID]-001
- **title**: [짧은 제목]
- **mode**: fullstack / planning-only
- **change-class**: A / B / C
- **owner**: Human / AI / Human + AI
- **milestone**: M1
- **acceptance criteria**:
  - [ ] [criterion 1]
  - [ ] [criterion 2]
- **notes**: [optional short context]

## InProgress

### [ID]-003
- **title**: [짧은 제목]
- **mode**: fullstack
- **change-class**: B
- **owner**: AI
- **milestone**: M1
- **acceptance criteria**:
  - [x] [done criterion]
  - [ ] [pending criterion]
- **notes**: 현재 작업 중

## Blocked

### [ID]-002
- **title**: [짧은 제목]
- **mode**: planning-only
- **change-class**: C
- **owner**: Human
- **acceptance criteria**:
  - [ ] [criterion 1]
- **notes**: Blocked by [reason].

## Done

### [ID]-000
- **title**: [짧은 제목]
- **notes**: Completed [YYYY-MM-DD]. See [PR / snapshot link].
