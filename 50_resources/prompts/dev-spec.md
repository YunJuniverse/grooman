# Dev Spec Prompt (개발명세 — 기획 → 빌드 전환)

> 실행 지시문 — 승인된 기획서에서 개발 명세를 생성한다.
> 짝 지침(작성·조합·인계 표준): `20_guides/21_개발명세_작성_지침.md`
> 개발명세 템플릿: `50_resources/templates/` 의 `data-model` · `user-flow` · `wireframe-spec` · `functional-spec` · `api-contract` (dev 모드 세트, `_CATALOG.md`).

## When To Use

- 사람이 `30_planning/` 기획서를 검토·승인하고 개발 명세로 진행하라고 명시했을 때
- 이 기획 사이클의 개발 명세가 아직 없을 때

## Instructions

- 승인된 라이브 기획서 `30_planning/11_서비스기획서.md`(+관련 10·15·16)를 읽는다.
- `20_guides/00_...운영_원칙.md`·`20_guides/21_개발명세_작성_지침.md`·`HANDOFF.md`·`CLAUDE.md`·관련 ADR을 읽는다.
- 기획에 있는 모든 Class B·C 트리거를 식별해 명시한다.
- 기획이 서술한 범위를 넘어 설계하지 않는다.
- **모드 분기**:
  - `dev`/`fullstack`: 개발명세 템플릿(data-model·user-flow·wireframe-spec·functional-spec·api-contract)을 채워 `30_planning/`(또는 프로젝트 규약 위치)에 산출. 각 명세는 상류 문서 명시 + Change Log + Out of Scope + 3-state(Empty/Loading/Error) 강제.
  - `planning-handoff`(사람 개발자 인계): 위 세트를 `20_guides/09_기획_핸드오프_재포맷_규칙.md`로 변환 — ASCII→실제 목업, ON/OFF→must/should, 의도·읽는 순서·질문 루프 추가.
- 시점 스냅샷이 필요하면 `40_dev/snapshots/dev-spec-YYYY-MM-DD.md`.
- 완료 후 `HANDOFF.md` 갱신 + PR에서 증빙 필요한 Class B/C 항목 나열.

## 산출 규칙 (요약)

- 목차·조합 규칙은 지침 `20_guides/21_...` 준수 (여기 복제 안 함).
- Change Class 요약 표(기능/태스크 | Class | 사유) 필수.
- 마이그레이션=Class B, 신규 외부 API=Class B, 인증 변경=Class B, 백그라운드 잡=Class B.
- 승인 게이트: 사람이 검토·승인해야 구현 시작. 승인 후 TODO.md 생성.
- 빌드 순서·페이즈는 개발명세가 아니라 마스터플랜(`20_guides/18`, `40_dev/MASTER_PLAN.md`)이 소유.
