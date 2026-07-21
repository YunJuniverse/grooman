# 기능 명세 (Functional Spec) — 템플릿

> 용도: 요구사항(`requirements-spec.md`) 하류의 *구현 단위* 기능 명세 — 기능 ID 추적 + 비즈니스 규칙·권한·예외 분리. 지침 `20_guides/11_서비스기획서_작성_지침.md` §19.2(⑦) · `20_guides/18_개발_마스터_플랜_작성_지침.md` §18.5 · `20_guides/21_개발명세_작성_지침.md` 참조.
> 2025-26: 스펙은 **AI 에이전트가 구현하고 CI가 검증하는 단일 소스**. 요구는 **EARS 표기**로 써서 한 문장에서 코드·테스트가 도출되게 한다.

| 항목 | 내용 |
|------|------|
| 버전 / 작성일 / Status | |
| 기반 문서 (상류) | |
| 범위 (Phase/Sprint) | |

## 1. Functions (영역별 그룹) — EARS 표기

> **EARS**(Easy Approach to Requirements Syntax — NASA·Airbus·Bosch 표준). 5패턴으로 요구를 제약:
> - **Ubiquitous**: `시스템은 <응답>해야 한다`
> - **Event(When)**: `<트리거>할 때, 시스템은 <응답>해야 한다`
> - **State(While)**: `<상태>인 동안, 시스템은 <응답>해야 한다`
> - **Optional(Where)**: `<기능이 포함된 경우>, 시스템은 <응답>해야 한다`
> - **Unwanted(If…then)**: `만약 <트리거>면, 시스템은 <응답>해야 한다`
> - **Complex**: `<상태>인 동안, <트리거>할 때, 시스템은 <응답>해야 한다`

| FS-ID | 기능명 | EARS 요구문 | Input | Output | 우선순위 |
|---|---|---|---|---|---|
| FS-01 | | | | | |

## 2. Business Rules

| Rule ID | 규칙 | Applies To (FS-ID 역참조) |
|---|---|---|
| BR-01 | | |

## 3. State Transitions (상태 있는 기능만)

| 현재 상태 | 이벤트 | 가드(조건) | 다음 상태 | 부수효과 |
|---|---|---|---|---|
| | | | | |

## 4. Permissions

| Actor | Allowed | Restricted |
|---|---|---|
| | | |

## 5. Exception Handling (레이어별)

- **레이어별 에러 처리 규약**: application 레이어=throw / page=catch & 사용자 메시지 / component=props로 상태 수신 (production console.log 금지, 경계 에러 정규화 — CLAUDE.md §7).

| 레이어(UI/API/도메인/데이터) | 상황 | 시스템 동작 | 사용자에게 보이는 것 |
|---|---|---|---|
| | | | |

## 6. Non-Functional Requirements (측정 가능)

> 각 NFR은 *수치 임계*로 — 테스트 가능해야 한다(EARS State/Ubiquitous 형과 궁합).

| 범주(성능/보안/신뢰성/확장성) | 요구 | 지표·임계 | 검증 방법 |
|---|---|---|---|
| | | (예: 피크부하 중 p95 < 200ms) | |

## 7. Traceability (요구 ↔ 테스트 ↔ 코드)

| Req(FS-ID) | Acceptance Criteria | Test Case ID | Code/PR |
|---|---|---|---|
| | | | |

## 8. Out of Scope (차기 Phase 예고)
- (지금 안 만드는 것 + 진입 조건)

## Change Log

| Version | Date | Changed Because |
|---|---|---|
| | | |

**원칙**: 기능표(FS-ID)와 별개로 Business Rules(역참조)·Permissions·State·Exception을 *분리*. 요구는 EARS로, 각 요구는 테스트 가능한 AC를 가진다. 안정 ID로 상류 요구(requirements-spec)·유저스토리와 하류 코드/테스트를 양방향 추적.
