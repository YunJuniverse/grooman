# Data Model Snapshot Prompt (코드 기반 역-문서화)

> 실행 지시문 — *현존 스키마/마이그레이션*에서 데이터 모델 현황을 날짜 스냅샷으로 뽑는다(reverse-doc).
> vs. 전방 설계: 새 스키마를 *설계*할 땐 템플릿 `50_resources/templates/data-model.md`(UUIDv7·expand-contract·PII/GDPR·pgvector) + 지침을 쓴다. 이 프롬프트는 *이미 있는 스키마*의 현황 캡처용.

## When To Use

- 날짜 기준 스키마/도메인 모델 문서가 필요할 때

## Instructions

- 실제 스키마 파일·마이그레이션·ORM 모델·테스트·관련 ADR을 읽는다.
- 낡은 기획 문서에 의존하지 않는다.
- 코드 경로별로 스키마가 불일치하면 그대로 명시한다.
- `40_dev/snapshots/data-model-YYYY-MM-DD.md` 로 쓴다. 상단에 스냅샷(비-라이브) 헤더.

## Include

- 현재 엔티티·핵심 필드 (키 전략 포함)
- 관계 (ERD 권장)
- 최근 마이그레이션·스키마 변경 (expand-contract 여부)
- 인증·권한 함의
- PII 분류·데이터 리스크·후속 질문
