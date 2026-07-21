# Eval & Guardrail Prompt (평가·가드레일 기획서 — 30_planning/17)

> 실행 지시문 — 17번 조직 평가·가드레일 카탈로그를 생성/갱신한다. **목차는 복제하지 않는다** — 짝 지침이 SSOT.
> 짝 지침(작성 표준·목차): `20_guides/17_평가_및_가드레일_지침.md`
> 산출 위치(라이브): `30_planning/17_평가_가드레일.md`
> 모드: AI 기능이 있는 모든 모드. 16(AI 기능)과 **동시 시작**(Eval-First).

## When To Use

- AI 기능이 하나라도 있는 프로젝트의 Phase 1 — 조직 차원 평가 포트폴리오·가드 카테고리·거버넌스를 잡을 때
- 규제·정책·레드팀 정책 변경 시

## Instructions

- `00_briefs/current/` + `30_planning/16_AI_기능/`(기능 목록)을 읽는다.
- `20_guides/00_...운영_원칙.md`(공통) + `20_guides/17_평가_및_가드레일_지침.md`(작성 표준·목차)를 읽는다 — **목차는 지침을 따른다**.
- `30_planning/17_평가_가드레일.md`를 채우고 frontmatter `status: draft → active`.
- 완료 후 `HANDOFF.md` 갱신.

## 산출 규칙

- 목차: 지침 `20_guides/17_...` 준수. 심화 반영: **LLM-judge bias 완화**(position/verbosity/self-preference, calibration 게이트), **에이전트/trajectory eval**, **RAG 메트릭 카탈로그**(RAGAS), **eval 데이터 위생**(오염·홀드아웃), **거버넌스 3축**(NIST AI RMF·ISO 42001·EU AI Act GPAI), **레드팀 pre-release 게이트**(Garak/PyRIT→regression), **OTel GenAI semconv**.
- 경계: 17은 *조직* 카탈로그·거버넌스, 개별 *기능* eval/guard 인스턴스는 16. 운영 중 가드 위반 *대응*은 12.
