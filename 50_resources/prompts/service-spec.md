# Service Spec Snapshot Prompt (범위 한정 현황 캡처)

> 실행 지시문 — 특정 범위의 서비스 개요/기능 명세를 날짜 스냅샷으로 캡처한다.
> vs. 라이브 기획: 서비스 *정의*의 원본은 `30_planning/11_서비스기획서.md`(SSOT). 이 프롬프트는 리뷰·인계용 *시점 캡처*.

## When To Use

- 날짜 기준 서비스 개요 또는 범위 한정 기능 명세가 필요할 때 (리뷰·인계)

## Instructions

- `HANDOFF.md`·관련 TODO·PR·ADR과, 설명 대상 범위의 코드만 읽는다.
- 범위를 명시적으로 유지한다. 무엇이 범위 밖인지 밝힌다.
- 생성 후 이 문서를 라이브 진실 원천으로 취급하지 않는다(원본은 11).
- `40_dev/snapshots/service-spec-YYYY-MM-DD.md` 로 쓴다. 상단에 스냅샷(비-라이브) 헤더.

## Include

- 범위 (+ Out of Scope)
- 사용자 아웃컴
- 수용 기준
- 주요 흐름
- 의존
- 리스크
- 증거 링크
