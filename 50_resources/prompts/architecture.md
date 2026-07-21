# Architecture Snapshot Prompt (코드 기반 역-문서화)

> 실행 지시문 — *현존 코드*에서 아키텍처 현황을 날짜 스냅샷으로 뽑는다(reverse-doc).
> vs. 전방 설계: 새 시스템을 *설계*할 땐 템플릿 `50_resources/templates/architecture.md`(C4·arc42·fitness functions) + 지침을 쓴다. 이 프롬프트는 *이미 있는 코드*의 현황 캡처용.

## When To Use

- 날짜 기준 아키텍처 현황 문서가 필요할 때 (리뷰·인계·감사)

## Instructions

- 대상 영역의 코드·테스트·ADR을 읽는다.
- 옛 문서보다 *코드가 실제로 하는 것*을 우선한다.
- 가정·미지를 매끄럽게 덮지 말고 명시한다.
- `40_dev/snapshots/architecture-YYYY-MM-DD.md` 로 쓴다. 상단에 스냅샷(비-라이브) 헤더.

## Include

- 시스템 경계 (C4 Context/Container 수준 권장)
- 주요 모듈·책임
- 데이터 흐름
- 외부 연동
- 알려진 제약
- ADR·PR 링크
