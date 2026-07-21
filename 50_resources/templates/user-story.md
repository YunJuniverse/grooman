# 유저스토리 (User Story) — 템플릿

> 용도: 사용자 관점 요구 표현(애자일). 지침 `20_guides/11_서비스기획서_작성_지침.md` §19.2 참조.
> 서비스기획서(부모)가 인덱스로 가리키는 자식 산출물. 수용 기준은 **AI 코딩 에이전트의 스펙이자 검증 오라클** — 선언형으로 쓴다.

| 항목 | 내용 |
|------|------|
| Story ID (안정 키) | (예: US-012 — functional-spec FS-ID·테스트와 상호 링크) |
| 대상 유저 / 대상 페이지 | |
| 버전 / 작성일 / 작성자 | |
| 링크 | (디자인 · 관련 스토리 · FS-ID · 테스트 케이스) |

## 간이형 (표)

| 번호 | 상황(Story) | 필요 기능 | 우선순위 |
|---|---|---|---|
| 1 | | | |

## 정석형 (스토리 카드)

> **형식 선택** — 페르소나가 행동을 좌우하면 **User Story**, 트리거·상황이 더 중요하고 사용자군이 크게 다르지 않으면 **Job Story**(Mike Cohn 휴리스틱: "As a user…"를 반복하게 되면 Job Story로 전환).

- **Title** (10어휘 이하):
- **User Story**: **As a** [Persona] · **I want to** [Goal] · **So that** [Business value]
- **또는 Job Story**: **When** [상황/트리거] · **I want to** [동기] · **So I can** [기대 결과]

- **Acceptance Criteria** — Gherkin(Given/When/Then)로 *선언형*(UI 조작 서술 금지, 관찰 가능한 결과만). AI가 코드·테스트를 같은 기준에서 생성:

```gherkin
Background:
  Given <공통 전제>

Scenario: <시나리오명>
  Given <맥락>
  When <행동>
  Then <관찰 가능한 결과>

# 데이터 구동이면 Scenario Outline + Examples 표 사용
```

  또는 규칙 기반 체크리스트(독립 제약이면):
  - [ ]
  - [ ]

## 품질 게이트

- **INVEST 자가검증**: [ ] Independent [ ] Negotiable [ ] Valuable [ ] Estimable [ ] Small [ ] Testable
- **Definition of Ready** (작업 진입 전 · TODO Ready 승격): [ ] 명확 [ ] 추정됨 [ ] INVEST 통과 [ ] AC 작성됨
- **Definition of Done** (완료): [ ] 코딩 [ ] 테스트 통과 [ ] 리뷰 [ ] 머지 [ ] 문서 갱신

**원칙**: 좋은 스토리 = INVEST. 우선순위 = MoSCoW(Must/Should/Could/Won't). Backlog 분해 = Epic > Task > Sub-Task. **너무 크면 SPIDR로 분할** — Spike(불확실성 제거) / Path(경로별) / Interface(UI·기기별) / Data(데이터 부분집합) / Rules(비즈규칙 완화). AC 4개↑면 대개 분할 신호.
