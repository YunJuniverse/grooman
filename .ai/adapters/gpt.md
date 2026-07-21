# GPT Adapter

> GPT 웹 UI, API 기반 에이전트, 또는 OpenAI 계열 도구에서 본 방법론을 사용할 때의 보조 지침.

## 부팅 절차

1. `.ai/context.json` 전체를 입력한다.
2. `must_read` 배열의 파일 내용을 순서대로 입력한다.
3. 사용 가능한 컨텍스트가 제한되면 `ONBOARDING.md`, `HANDOFF.md`, `.ai/checkpoint.md`를 우선한다.
4. 첫 응답은 `.ai/checkpoint.md`의 "다음 사람에게" 첫 항목을 수행하는 것으로 시작한다.

## 세션 종료 절차

세션 종료 전 다음 파일을 갱신할 내용을 제안하거나 직접 수정한다.

- `.ai/checkpoint.md`
- `.ai/context.json`
- `HANDOFF.md`
- `TODO.md`

## 주의

- 저장소 상대 경로만 사용한다.
- 특정 GPT 기능, 플러그인, API 전용 전제를 코어 문서에 넣지 않는다.
- 대화 전문이 저장되지 않는 환경에서는 L1 관찰 로그와 Git/PR 메타데이터가 주 신호원이다.
