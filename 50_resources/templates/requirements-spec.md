# 기능요구사항 정의서 (Requirements Spec) — 템플릿

> 용도: 요구사항을 추적 가능하게 정의하는 *상류 대장*(VOC → 요구 → 수용결정 → 추적). 부정 결론(불가/보류)은 *사유 필수*.
> 위상: `functional-spec`(EARS 구현 명세)의 **상류** — 여기 요구는 **"shall" 선언형**, 하류 구현 명세는 EARS. 표준: ISO/IEC/IEEE 29148. 지침 `20_guides/11_서비스기획서_작성_지침.md` §19 · `20_guides/21_개발명세_작성_지침.md` 참조.

| 항목 | 내용 |
|------|------|
| 프로젝트 | |
| 버전 / 작성일 / 작성자 | v0.1 |

## 1. 범위·전제
- **목적/범위**: (이 대장이 다루는 것)
- **제약(Constraints)**: (기술·법·예산·일정)
- **가정(Assumptions)·의존(Dependencies)**:
- **정의·약어**:

## 2. 요구사항 대장
> 경량 모드 최소 컬럼 = `ID·명·상세·중요도·수용여부·상태`. 아래는 표준(29148/RTM) 완전형.

| 번호 | 요구ID(모듈+숫자, ex.Order001) | 유형(계층) | 요구사항명 | 상세("shall"·atomic) | 인수기준(측정가능) | 중요도(M/S)+출시(Pn) | 출처(VOC)·비즈니스근거 | 검증(I/A/D/T) | 수용(Y/N/보류)+사유 | 상태 | 하위추적(FS-ID/US/TC) | 변경등급(A/B/C) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | 제안 | | |

- **유형(계층, BABOK)**: business(왜) / stakeholder / functional / **NFR**(성능·보안·가용·사용성) / transition(이행 — 데이터변환·교육·컷오버) / constraint. — NFR·이행 요구를 빠뜨리지 않게.
- **상태(생명주기)**: `제안 → 검토 → 승인(baselined) → 구현 → 검증` + 종료 오프램프 `보류(deferred)` / `반려(rejected)` / `취소(cancelled)` (각 사유 필수). 완료 정의 = 모든 요구가 *검증·보류·반려* 중 하나.

## 3. 작성 규율 (품질 — 29148)
- **"shall" 규약**: `shall`=구속 요구 / `should`=권장·목표 / `will`=사실·의도 / `may`=선택. **요구는 shall 문장만**.
- **atomic(단수)**: 1문장 = 1요구. "and/or" 금지 → 분리(각각 테스트 가능하게).
- **금지 모호어**: "빠른·편리한·효율적·견고한·적절히·등" → 측정 기준으로("P95 200ms 이내").
- **개별 요구 9특성**: necessary · appropriate · unambiguous · complete · singular · feasible · verifiable · correct · conforming.
- **요구 SET 5특성**: complete · consistent · feasible · comprehensible · validatable(검증 가능).

## 4. 검증방법 범례 (I/A/D/T)
각 요구는 *어떻게 충족을 증명할지* 를 선언(→ verifiable 강제):
- **Inspection(검사)** — 문서·감각으로 확인 · **Analysis(분석)** — 모델·시뮬·시험데이터 · **Demonstration(시연)** — 작동 관찰(정성) · **Test(시험)** — 계측·정량 임계 비교.

## 5. 우선순위 프레임
- 기본 **MoSCoW**(Must/Should/Could/Won't) + **출시단계 Pn**(빌드 순서). (`prd.md` §5 표기 동일)
- 버킷 내 정렬 필요 시 숫자화: **WSJF**(지연비용 ÷ 작업크기, SAFe — 지연이 실제 매출손실일 때) 또는 **RICE**((Reach×Impact×Confidence)÷Effort). 발굴 단계엔 **Kano**(기본/성능/감동).

## 6. 추적성 (RTM — 양방향)
- **후방**: 요구 → 출처(VOC·비즈니스 목표·규제) — 근거 없는 gold-plating 방지(necessary 증명).
- **전방**: 요구 → 설계 → 코드 → 테스트 — 누락 방지. 커버리지 = 검증 링크 있는 요구 %.
- **링크, 복사 금지**: 하류(functional-spec·user-story·테스트)는 요구ID를 *참조*("implements REQ-042")하고 내용을 재기술하지 않는다(드리프트 방지 · 2025-26 SSOT).

**작성 원칙**: ① ID로 양방향 추적 ② 요구는 Needs(What) 아닌 Purpose(Who·How)로 ③ 부정 시 사유 필수 ④ 버전 관리 ⑤ shall·atomic·측정가능(verifiable) ⑥ 하류는 링크(복사 금지). Class B/C 트리거(스키마·인증·외부계약 / 가격·법·공개) 요구는 변경등급에 표기해 게이트와 연결(`CLAUDE.md` §3).
