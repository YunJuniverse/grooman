# API Spec Snapshot Prompt (코드 기반 역-문서화)

> 실행 지시문 — *현존 라우트/핸들러*에서 API 현황을 날짜 스냅샷으로 뽑는다(reverse-doc).
> vs. 전방 설계: 새 API를 *설계*할 땐 템플릿 `50_resources/templates/api-contract.md`(계약 우선) + 지침 `20_guides/21`을 쓴다. 이 프롬프트는 *이미 있는 코드*의 현황 캡처용.

## When To Use

- 날짜 기준 API 설명 문서가 필요할 때

## Instructions

- 라우트 핸들러·요청/응답 검증기·테스트·관련 ADR을 읽는다.
- 가정보다 *실제 계약과 테스트 증거*를 우선한다.
- 환경·인증 상태에 따라 동작이 다르면 명시한다.
- `40_dev/snapshots/api-spec-YYYY-MM-DD.md` 로 쓴다. 상단에 스냅샷(비-라이브) 헤더.

## Include

- 엔드포인트 목록
- 인증 요건
- 요청·응답 형태
- 에러 동작
- 외부 계약 의존
- 테스트·PR 링크
