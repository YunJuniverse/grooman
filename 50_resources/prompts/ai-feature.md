# AI Feature Prompt (AI 기능 기획서 — 30_planning/16/AI-NNN)

> 실행 지시문 — 16번 AI 기능을 *기능 단위*로 생성/갱신한다. **목차는 복제하지 않는다** — 짝 지침이 SSOT.
> 짝 지침(작성 표준·목차): `20_guides/16_AI_기능_기획서_작성_지침.md`
> 산출 위치(라이브): `30_planning/16_AI_기능/AI-NNN_<slug>.md` (AI 기능당 1개)
> 모드: AI 기능이 있는 모든 모드 (fullstack·dev·lean·planning). 17(평가·가드레일)과 **동시 시작**(Eval-First).

## When To Use

- 서비스기획서(11)에 AI 기능 진입점이 정의된 뒤, 그 기능을 단위 명세할 때
- 새 AI 기능 추가 또는 모델·프롬프트·도구 구성 변경 시

## Instructions

- `00_briefs/current/` + `30_planning/11_서비스기획서.md`(AI 진입점)를 읽는다.
- `20_guides/00_...운영_원칙.md`(공통) + `20_guides/16_AI_기능_기획서_작성_지침.md`(작성 표준·목차)를 읽는다 — **목차는 지침을 따른다**.
- **Eval-First**: 이 기능의 평가/가드는 `30_planning/17_평가_가드레일.md`(조직 카탈로그)를 참조해 *기능 인스턴스*로 건다. 골든셋 없이 배치 금지.
- `30_planning/16_AI_기능/AI-NNN_<slug>.md`를 채우고 frontmatter `status: draft → active`.
- 완료 후 `HANDOFF.md` 갱신.

## 산출 규칙

- 목차: 지침 `20_guides/16_...` 준수. 심화 반영: **에이전트 아키텍처**(workflow vs agent 게이트·정지조건), **에이전트 메모리**, **MCP 통합**(tool 응답=미신뢰), **RAG 설계+RAG-eval**(RAGAS), **구조화 출력**(JSON Schema·strict), **컨텍스트 엔지니어링**, **OWASP LLM Top10 2025** 체크.
- 경계: *기능* eval/guard 인스턴스는 16, *조직* 카탈로그·거버넌스는 17. 작업 관리는 15, 장애 대응은 12.
