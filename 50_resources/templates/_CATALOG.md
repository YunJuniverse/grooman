# 템플릿 카탈로그 — 작업 모드별 선택 (`_CATALOG.md`)

> 방법론 템플릿이 25종 이상으로 늘었다. **모든 작업에 모든 템플릿을 쓰지 않는다** — 작업 *모드*에 맞는 세트만 고른다.
> CLAUDE.md §1 `Mode`에 모드를 적고, 이 카탈로그에서 그 모드의 권장 세트만 로드한다. (지침 `20_guides/00_AI_기획_프로젝트_운영_원칙.md` §11.5·11.7)
>
> **경로는 flat 유지** — 폴더로 나누지 않는다(기존 지침·문서의 참조 경로가 깨지므로). 분류는 이 문서가 담당한다.

---

## 1. 작업 모드 (6종) → 권장 세트

| 모드 | 용도 | 권장 템플릿 세트 |
|---|---|---|
| **planning** | 기획전용 (구현 안 함) | prd · requirements-spec · ia-spec · service-policy · user-story · kpi-tree · context-glossary · microcopy |
| **planning-handoff** | 기획전용 → *별도 사람 개발자*에게 인계 (AI 아닌 사람이 읽음) | `planning` 세트 + user-flow · functional-spec · wireframe-spec — **단, 지침 `20_guides/09_기획_핸드오프_재포맷_규칙.md`의 재포맷 규칙을 얹어 산출**(ASCII→실제 목업, ON/OFF→must/should, 의도·읽는 순서·질문 루프 추가). architecture·data-model은 개발자 소유이므로 제외(필요 시 끌어 씀) |
| **dev** | 개발전용 (기획 받아 구현) | architecture · data-model · api-contract · user-flow · wireframe-spec · functional-spec (작성·조합·인계 표준은 지침 `20_guides/21_개발명세_작성_지침.md`) |
| **fullstack** | 기획+개발 일괄 | `planning` ∪ `dev` + wbs |
| **agency** | 외주(수주·납품) SI 라이프사이클 | proposal-go-nogo · research-collection-checklist · profitability-sheet · execution-plan · wbs · qa-acceptance-plan · qa-test-scenario · qa-acceptance-signoff · operation-spec · post-launch-monitoring · work-request-ticket · glossary (+ 산출물은 `planning`/`dev`에서) |
| **lean** | 1인+AI 빠른 반복 | prd · architecture · context-glossary · ADR-template |
| **ops** | 런칭 후 운영 | operation-spec · post-launch-monitoring · work-request-ticket · qa-acceptance-plan · qa-test-scenario · qa-acceptance-signoff |

> **항상(모드 무관)**: `ADR-template`(비가역 결정) · 라이브 상태 파일 `TODO`·`HANDOFF`·`checkpoint`·`context.json`. `MASTER_PLAN`은 `fullstack`/`dev`/`agency`에서 사용. (스프린트 층 폐지 — cadence는 flow 메트릭, 배치 그룹핑은 TODO `milestone:` 태그. METH-086)

---

## 2. 템플릿 카탈로그 (25종, 카테고리별)

### 기획 (Planning)
| 템플릿 | 한 줄 |
|---|---|
| `prd.md` | 제품 요구사항(무엇) — 비전·목표/비목표·범위·불변식·기능요구(M/S·Pn·테스트가능 AC)·AI 제품요구(eval bar·가드레일·fallback)·성공지표 metric tree(HEART·가드레일)·가정 레지스터(RAT) |
| `requirements-spec.md` | 요구사항 추적 대장(ISO/IEC/IEEE 29148) — ID·유형(계층)·shall·인수기준·검증(I/A/D/T)·상태 생명주기·RTM 양방향 추적·M/S+Pn |
| `ia-spec.md` | 정보구조 기능정의서 — Screen-ID 규약·화면 인벤토리·메뉴트리·RBAC 매트릭스·IA 검증(카드소트/트리테스트) |
| `service-policy.md` | 서비스 정책 정의서 — 의사결정 표(조건→액션·hit policy)·effective-dating·변경이력·AI 가드레일, 2-시트 |
| `user-story.md` | 유저스토리·시나리오 — User/Job Story·Gherkin(G/W/T) AC·INVEST·DoR/DoD·SPIDR |
| `kpi-tree.md` | KPI 단위경제 — 비즈모델 top-line 토글(마켓/구독/거래/AI)·마진 워터폴·단위경제(LTV/CAC/payback)·NRR/GRR·자본효율(Rule40·burn multiple)·AI COGS·드라이버 트리(North Star) |
| `context-glossary.md` | 도메인 용어집(유비쿼터스 언어/SKOS) — 표준어·`_Avoid_`·바운디드 컨텍스트·상태/소유자·Code/UI 매핑·약어·예시 대화·AI 스티어링/린트 훅 |
| `microcopy.md` | UX 라이팅 — 콘텐츠원칙·Voice(상수)/Tone(맥락)·에러패턴·용어사전·i18n·AI 프롬프트 |

### 개발명세 (Dev-spec)
| 템플릿 | 한 줄 |
|---|---|
| `architecture.md` | 아키텍처(어떻게) — as-built→목표(C4)→이전경로 · 품질속성 top3 · fitness functions · 신뢰경계/위협(STRIDE) · 런타임/배포 뷰 · AI 아키텍처 · 리스크/기술부채 (arc42 매핑) |
| `data-model.md` | 데이터 모델 — Mermaid ERD·키 전략(UUIDv7)·인덱스·cascade·제약·history(SCD2/soft-delete)·**expand-contract 무중단 마이그레이션**·PII 분류/GDPR·벡터(pgvector) |
| `api-contract.md` | API·인터페이스 계약 — 엔드포인트·요청/응답·에러·버전·인증 (개발리드→개발자, FE/BE 병렬 조율축). functional-spec의 상위 시스템 레벨 |
| `user-flow.md` | 사용자 플로우 — Mermaid 다이어그램·정상/대안/실패(+복구)/분기·엣지케이스 체크리스트·actor 태그 |
| `wireframe-spec.md` | 화면설계(텍스트 ASCII) — 화면별 번호 콜아웃·**5-state**(Empty/Loading/Partial/Error/Success)·접근성·반응형·Figma 링크 |
| `functional-spec.md` | 기능명세 — FS-ID·**EARS 표기**·상태전이·권한·예외(레이어별)·측정가능 NFR·추적(요구↔테스트↔코드) |

### PM·일정
| 템플릿 | 한 줄 |
|---|---|
| `wbs.md` | 작업분해 — Step→Activity→Task·3점추정·직무 8레인 |

### 제안·수주 (Proposal / Agency)
| 템플릿 | 한 줄 |
|---|---|
| `proposal-go-nogo.md` | 제안여부검토서 — 8축 점수 → 진행/추가수집/포기 |
| `research-collection-checklist.md` | 자료수집표 — 경쟁/고객/사이트 현황 추적 |
| `profitability-sheet.md` | 수익율 관리표 — 직급단가×M/M + 간접비 + 월별 수익율 |
| `execution-plan.md` | 수행계획서 — 업무범위·M/M 매트릭스·RACI·산출물 4계층 |

### 검수 (QA)
| 템플릿 | 한 줄 |
|---|---|
| `qa-acceptance-plan.md` | 검수계획서 — 범위·환경·합격기준·예외약정 |
| `qa-test-scenario.md` | 검수 시나리오 — 무작위형/시나리오형 2모드·결과 enum |
| `qa-acceptance-signoff.md` | 검수확인서 — 양측 서명 sign-off(대금 근거) |

### 운영 (Ops)
| 템플릿 | 한 줄 |
|---|---|
| `operation-spec.md` | 운영명세서 — 일/주/월/수시·시스템·리포트 체계 |
| `post-launch-monitoring.md` | 오픈후 모니터링 리포트 — 결함 추적(접수/처리중/완료) |
| `work-request-ticket.md` | 업무요청·처리서 — 접수→영향분석→결정(운영 RFC) |
| `glossary.md` | 용어규약집 — 단계별 표준용어·개정이력 |

### 결정·계획 (항상/공용)
| 템플릿 | 한 줄 |
|---|---|
| `ADR-template.md` | 결정 기록 — 결정문장 제목·Considered Options·되돌리기 비용 |
| `MASTER_PLAN.md` | 개발 마스터플랜 — 비전→페이즈·게이트 매핑 (cadence는 flow 메트릭, `20_guides/15` §6.19~6.20) |

---

## 3. 모드 × 템플릿 매트릭스

> ✓ = 그 모드의 권장 세트. `agency`는 제안·검수·운영 산출물 + 실제 기획/개발 산출물(planning/dev)을 함께 쓴다.

| 템플릿 | planning | planning-handoff | dev | fullstack | agency | lean | ops |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| prd | ✓ | ✓ | | ✓ | ✓ | ✓ | |
| requirements-spec | ✓ | ✓ | | ✓ | ✓ | | |
| ia-spec | ✓ | ✓ | | ✓ | ✓ | | |
| service-policy | ✓ | ✓ | | ✓ | ✓ | | |
| user-story | ✓ | ✓ | | ✓ | ✓ | | |
| kpi-tree | ✓ | ✓ | | ✓ | ✓ | | |
| context-glossary | ✓ | ✓ | | ✓ | ✓ | ✓ | |
| microcopy | ✓ | ✓ | | ✓ | ✓ | | |
| architecture | | | ✓ | ✓ | ✓ | ✓ | |
| data-model | | | ✓ | ✓ | ✓ | | |
| api-contract | | | ✓ | ✓ | ✓ | | |
| user-flow | | ✓ | ✓ | ✓ | ✓ | | |
| wireframe-spec | | ✓† | ✓ | ✓ | ✓ | | |
| functional-spec | | ✓ | ✓ | ✓ | ✓ | | |
| wbs | | | | ✓ | ✓ | | |
| proposal-go-nogo | | | | | ✓ | | |
| research-collection-checklist | | | | | ✓ | | |
| profitability-sheet | | | | | ✓ | | |
| execution-plan | | | | | ✓ | | |
| qa-acceptance-plan | | | | | ✓ | | ✓ |
| qa-test-scenario | | | | | ✓ | | ✓ |
| qa-acceptance-signoff | | | | | ✓ | | ✓ |
| operation-spec | | | | | ✓ | | ✓ |
| post-launch-monitoring | | | | | ✓ | | ✓ |
| work-request-ticket | | | | | ✓ | | ✓ |
| glossary | | | | | ✓ | | |
| ADR-template | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MASTER_PLAN | | | ✓ | ✓ | ✓ | | |

> **† `planning-handoff`의 산출물은 AI가 아닌 *사람 개발자*가 읽는다** — 위 세트를 지침 `20_guides/09_기획_핸드오프_재포맷_규칙.md`의 재포맷 규칙으로 변환해 산출한다: `wireframe-spec`은 ASCII 대신 **실제 목업/Figma**로, `service-policy`의 ON/OFF는 **must/should**로, `context-glossary`의 `_Avoid_`는 경량화, 그리고 **의도(왜)·읽는 순서·열린 질문 루프**를 얹는다. `architecture`·`data-model`은 개발자 소유이므로 기본 제외(필요 시 끌어 씀).

---

**원칙**: 모드는 *시작점*이지 족쇄가 아니다 — 필요하면 다른 모드의 템플릿을 끌어 쓰되, *불필요한 템플릿을 의무로 채우지 않는다*. 새 템플릿을 추가하면 이 카탈로그(카테고리·매트릭스·해당 모드 세트)도 함께 갱신한다.
