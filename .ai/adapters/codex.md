# Codex Adapter

> Codex 계열 도구에서 본 방법론을 사용할 때의 보조 지침.

## 부팅 절차

1. `.ai/context.json`을 읽는다.
2. `must_read` 배열의 파일을 순서대로 읽는다.
3. `.ai/checkpoint.md`의 "다음 사람에게" 첫 항목을 즉시 수행한다.
4. 작업이 문서 또는 코드 변경이면, 완료 후 `TODO.md`와 `HANDOFF.md`를 갱신한다.

## 세션 종료 절차

세션 종료 전 다음을 수행한다.

1. `.ai/checkpoint.md`를 현재 세션 기준으로 갱신한다.
2. `.ai/context.json`의 `last_session`, `active_todos`, `adapters_present`를 실제 상태에 맞춘다.
3. L1 관찰 로그가 필요한 작업이면 `20_guides/03_AI_관찰_로그_작성_규칙.md`를 따른다.

## 주의

- 코어 파일(`.ai/`, `60_tools/` 공통 CLI)에 Codex 전용 지시를 넣지 않는다.
- Codex 전용 자동화나 제한사항은 이 파일에만 둔다.
- 로컬 Git 쓰기 권한이 제한될 수 있으므로, 커밋 실패 시 파일 변경과 검증 결과를 명확히 남긴다.
