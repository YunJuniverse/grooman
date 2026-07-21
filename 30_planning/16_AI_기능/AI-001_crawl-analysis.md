---
doc_id: ai-feature-001
title: 크롤 콘텐츠 AI 분석 (분류·요약·필터)
version: v1.1
feature_id: AI-001
last_updated: 2026-07-22
status: active
ai_relevance: feature   # 서비스기획서 v1.1의 tool 분류를 정정 — AI 산출물(요약·분류)이 제품에 포함되므로 지침 16 §1.5 기준 feature
eval_required: true
guardrail_class: medium
parent_feature: F4      # 11 서비스기획서 §5 자동수집 군집
guide: 20_guides/16_AI_기능_기획서_작성_지침.md
machine_readable_links:
  prompts: lib/ai/claude.ts   # 현재 인라인 — P2에 prompts/ 분리 예정
  evals: evals/crawl/golden-v1.jsonl   # 미구축 — §6 축적 계획
  policy_yaml: (미작성 — 17 인스턴스 §5 표가 임시 정본)
human_in_loop_gates:
  - id: eval-spec-approval
    trigger: 본 문서 + 17 인스턴스 v1 확정
    approver: hayden (PR 리뷰)
  - id: model-swap
    trigger: 모델 교체 (Class B)
    approver: hayden
---

# AI-001 — 크롤 콘텐츠 AI 분석 (분류·요약·필터)

> 구현이 선행된 retrofit 명세 — 코드(`lib/ai/claude.ts`·`app/api/crawl/route.ts`)의 현재 동작을 사실로 박제하고, 지침 16 기준 미달 지점을 **개선 백로그**로 명시한다. 조직 표준은 `30_planning/17_평가_가드레일.md`(짝꿍) 참조.

## 1. 기능 개요 & AI 가치 가설

- **한 줄**: RSS 크롤 원문을 받아 카테고리 분류 + 3줄 요약 + 스팸/광고 판정을 반환, 통과분을 자동 게시한다.
- **가치 가설** (지침 §11.1 패턴): 크롤 콘텐츠 분류·요약을 룰/키워드로 처리하면 자연어 다양성 때문에 정밀도가 나오지 않고 에디터 인건비가 필요하다 — 소형 LLM은 이를 **글당 ~₩3**에 처리해 1인 운영 콜드스타트를 성립시킨다(사업기획서 §15).
- **룰로 대체 가능한 부분**: 글자수 하한(200자)·중복(url_hash)은 이미 룰(구현) — LLM 앞단에서 처리. LLM은 분류·요약·의미 기반 스팸 판정만.

## 2. 사용자 시나리오 (AI 관점)

- **트리거**: Vercel Cron → `GET /api/crawl` (사용자 아님 — 스케줄 자동). 사용자는 AI를 호출하지 않는다.
- **흐름**: RSS 수집 → 룰 필터(길이·중복) → **AI 분석** → 스팸/광고 폐기 or `posts` 자동 게시(`is_auto_crawled`·`ai_summary`) → 사용자는 뱃지·출처와 함께 열람.

## 3. 입력 계약

- **입력**: `title: string` + `content: string` (원문 description **1,000자 절단** — 구현). 필수 둘 다.
- **전처리**: 200자 미만 룰 폐기(AI 도달 전). PII redaction 없음 — 입력이 *공개 RSS 콘텐츠*라 저위험(사용자 데이터 미포함).
- **미신뢰 입력 주의(§5.17·LLM01)**: 크롤 원문은 외부 통제 텍스트 — 프롬프트 인젝션 표면. 방어는 §8.

## 4. 모델·프롬프트 설계

- **모델**: Anthropic `claude-haiku-4-5-20251001` (버전 핀 — 구현). max_tokens 500.
- **프롬프트**: 단일 user 메시지, JSON-only 지시 + 카테고리 기준 명시. **enum에서 clinic 의도적 제외**(자동수급 금지의 기계적 강제 — ADR-0001).
- **결정론(§8.4)**: `temperature: 0` 고정 ✅ (B1 — GRM-014 구현).
- 프롬프트 위치: 현재 `lib/ai/claude.ts` 인라인 — **개선 B2**: `prompts/crawl-analysis/` 분리 + 버전 태그(P2).

## 5. 출력 계약

- **스키마**: `{ category: enum5, summary: string(3줄), tags: string[], spam_score: 0~1, is_advertisement: bool }`.
- **검증**: `lib/ai/crawl-analysis.ts` — 정규식 JSON 추출 → `JSON.parse` → **zod 스키마 검증**(enum 5종·타입·범위) 실패 시 전부 `null` → 폐기 ✅ (B3 — GRM-014 구현, 단위 테스트 11종 `tests/unit/crawl-analysis.test.ts`). clinic은 스키마 enum에서 구조적으로 거부.
- **후속 처리**: `spam_score ≥ 0.7 ∨ is_advertisement` → 폐기(crawl_queue failed) / 통과 → 게시.

## 6. 평가 명세 (Eval Spec) — 17 인스턴스 §2~3이 조직 기준

| 메트릭 | 합격 기준 | 채점 |
|---|---|---|
| 카테고리 분류 정확도 | **≥ 90%** (골든셋) | 룰(exact match) |
| **clinic 유출** | **0건 (hard fail)** — 브랜드 가치 1의 기계 보증 | 룰 |
| 스팸/광고 오탐·미탐 | 각 **≤ 5%** | 룰(라벨 대비) |
| 요약 품질 | judge 4/5 이상 ≥ 85% | LLM-as-Judge(17 §4 규율) |

- **골든셋**: `evals/crawl/golden-v1.jsonl` — **미구축**. 축적 계획: P1 운영의 사후 전수 검토(운영기획서 §10)에서 실데이터 라벨링 → 초기 50건(happy 30·edge 10·adversarial 5·out-of-scope 5) → 100건 목표. 책임자: 운영자.
- **회귀 기준**: 프롬프트·모델 변경 시 골든셋 재실행 — 분류 정확도 3%p↓ 또는 clinic 유출 1건이면 배포 차단.
- **retrofit 정직 고지**: Eval-First(§8.1)를 사후 적용 중 — 현재는 "잘 동작하는 것 같다" 상태(지침 §9.1의 실수에 해당). 골든셋 v1 구축 전까지 프롬프트·모델 변경 금지(변경하려면 골든셋 먼저).

## 7. AI 실패 UX (의무)

- **사용자 대면**: 모든 자동 글에 ① "자동수집" 뱃지(AI 관여 표시 — 구현) ② 원문 출처 링크(검증 경로 — 구현) ③ 신고 버튼(**GRM-012 예정** — Escalate 경로).
- **Edit/Reject 주체 = 관리자**(시스템 게시물): 어드민에서 숨김·삭제 가능(구현). Regenerate는 제공 안 함(재크롤로 대체 — 멱등키 url_hash).
- **책임 경계**: 자동수집 글은 요약+출처 표기 — 원문 정확성은 출처 책임, 요약 오류는 신고·관리자 삭제로 대응(이용약관 연계 [미확정 — 약관 문구 검토]).

## 8. 가드레일 (4-카테고리 인스턴스) — 조직 카탈로그는 17 §5

| 카테고리 | 적용 통제(현재) | 위반 시 동작 | 상태 |
|---|---|---|---|
| 콘텐츠 안전 | spam_score·is_advertisement 판정 | 폐기(failed 기록) | ✅ 구현 |
| 보안(인젝션) | JSON 파싱 실패 시 폐기 + 도구 호출 없음(단발 분류) + 출력이 코드 실행에 미연결 | 폐기 | ✅ 구조적 저위험 · B3로 강화 |
| 데이터 보호 | 사용자 데이터 미전송(공개 RSS만) · Anthropic API 기본 비학습 | — | ✅ 저위험 |
| 컴플라이언스 | **clinic enum 차단**(의료 자동수급 금지) · "자동수집" 표시(韓 AI기본법 합성물 표시 선제 대응) | 차단 | ✅ 구현 |

~~⚠️ fail-open 가드(B4)~~ → **해소 ✅ (GRM-014)**: 키 부재·호출 실패·파싱/검증 실패 전부 `null` 반환 → 호출부가 폐기(fail-closed). 키 부재는 이제 "자동수집 중단"일 뿐 무필터 게시 경로 없음.

## 9. Fallback 체인

- 1차: Haiku 호출 → 실패(타임아웃·5xx·파싱 실패) 시 **해당 글 폐기, 다음 주기 재시도**(url_hash 멱등 — 중복 게시 없음).
- 2차 모델·사람 강등 **없음(의도적)**: 비대면·비긴급 파이프라인이라 "안 하기"가 안전한 fallback(정중한 거절 상당). 모델 전면 장애 = 자동수집 일시 중단, 사용자 영향 0(운영기획서 §10).
- B4 해소로 "키 부재" 경로도 정상 fallback(폐기)이 됨 ✅.

## 10. Tool/Action 권한

- 에이전트 아님(§5.15 게이트: **워크플로우** — 코드가 흐름 소유, 단발 LLM 호출). 도구 호출·메모리·MCP 없음. 정지 조건 = 소스당 10건 상한(구현).
- 유일한 write-action(게시)은 **LLM 출력이 아니라 코드가 수행** — LLM은 판정만. Tier: 게시=Always(단 §6 eval bar·§8 가드 전제), clinic 게시=**Never**(enum 차단).

## 11. 비용·지연

- 호출당: 입력 ~1,200 + 출력 ~200 토큰 ≈ **$0.002(≈₩3)**. 월(일 30건): **~₩2,700**.
- 캡·알람: **월 ₩10,000 조사 / ₩30,000 크롤 중단** (운영기획서 v1.1 확정).
- 지연: 비대면 — p95 목표 완화(크론 maxDuration 60s 내 배치 완료면 충분). 사용자 체감 지연 없음.

## 12. 관측 명세

- **현재**: `crawl_queue`(status·error_msg·processed_at) + 크론 응답(processed/skipped/failed) — 부분적.
- **개선 B5(P2)**: 17 §8 표준 필드 중 `model_id·prompt_version·tokens·cost` 미기록 — crawl_queue에 컬럼 추가 또는 로그로. 비용 실측이 캡 운영의 전제.

## 13. 모델·프롬프트 변경 절차 (지침 §10 매핑)

| 변경 | Class | 게이트 |
|---|---|---|
| few-shot·기준 문구 미세조정 | A | 골든셋 회귀 권장 |
| 프롬프트 의도 변경·모델 교체·출력 스키마 변경 | **B** | 골든셋 회귀 필수 + PR |
| clinic 차단 해제(enum에 clinic 추가) | **C** | 사람 승인 + ADR (자동수급 금지 정책 변경) |

## 14. 데이터·학습 정책

- 사용자 입력: 전송 없음(공개 RSS만). 학습 사용: 없음(Anthropic API 기본 비학습). 보존: 원문은 posts에 요약·절단본만, 트레이스 보존은 17 §8.

## 개선 백로그 (요약)

| ID | 항목 | 우선 |
|---|---|---|
| ~~B4~~ | ~~fail-open → fail-closed~~ | ✅ 완료 (GRM-014, 2026-07-22) |
| ~~B3~~ | ~~출력 zod 스키마 검증~~ | ✅ 완료 (GRM-014 — 테스트 11종) |
| ~~B1~~ | ~~temperature 0 고정~~ | ✅ 완료 (GRM-014) |
| B2 | 프롬프트 파일 분리·버전 태그 | P2 |
| B5 | 트레이스 필드(model·tokens·cost) 기록 | P2 |

## 변경 이력

| 버전 | 날짜 | 요약 |
|------|------|------|
| v0 | 2026-07-21 | 스켈레톤 |
| v1 | 2026-07-22 | retrofit 명세 — 현재 동작 박제 + ai_relevance tool→feature 정정 + **fail-open 가드 발견(B4)** + 개선 백로그 5건 + Eval Spec(골든셋 축적 계획·clinic 0건 hard) |
| v1.1 | 2026-07-22 | B1·B3·B4 구현 반영(GRM-014) — fail-closed·zod 검증(`lib/ai/crawl-analysis.ts`+테스트 11종)·temperature 0. AC④ 판정: fail-closed로 키 부재가 안전해져 릴리스 게이트 추가 불요(키 부재=크롤 중단, 일일 루틴이 감지) |
