# ONBOARDING — 15분 부팅

> 어떤 AI 모델·어떤 PC·어떤 도구에서 시작했든 이 한 페이지만 따르면 된다.
> 본 문서의 위상은 [10_foundation/WHITEPAPER.md](10_foundation/WHITEPAPER.md) §3-G1 (단일 진입점, 15분 첫 작업).

---

## 1단계 — 부팅 (3분)

```
1. .ai/context.json 을 연다 → project.kind 확인
2. must_read 배열의 파일을 순서대로 읽는다
3. last_session.checkpoint_file (= .ai/checkpoint.md) 의 "다음 사람에게" 항목을 첫 작업으로 잡는다
```

도구별 자동화는 [.ai/adapters/](.ai/adapters/) 참조 — 자동 hook이 없는 환경은 [.ai/adapters/generic.md](.ai/adapters/generic.md).

## 2단계 — 환경 검증 (2분)

```bash
python3 60_tools/methodology.py version
# → "methodology vX.Y  (<commit>)  @ <repo root>" 출력되면 OK
```

실패 시: Python 3 미설치이거나 worktree 경로 문제. 사람에게 환경 확인 요청.

## 3단계 — 첫 작업 (10분)

`.ai/checkpoint.md` §"다음 사람에게"의 1번 항목을 수행한다.
중간에 막히면:

- 헌법(철학·원칙·게이트): [10_foundation/WHITEPAPER.md](10_foundation/WHITEPAPER.md)
- AI 운영 규칙(Class A/B/C, 게이트 절차): [CLAUDE.md](CLAUDE.md)
- 폴더 번호 의미: 백서 §부록 C
- 도메인별 작성 지침: [20_guides/README.md](20_guides/README.md)

---

## 외워야 할 명령 3개

| 명령 | 시점 | 의미 |
|---|---|---|
| `python3 60_tools/methodology.py version` | 부팅 시 | 환경 작동 검증 |
| `python3 60_tools/generate-dashboard.py --serve` | 작업 중 | 단일 페이지 가시성 (NOW/NEXT/LIBRARY/THINKTANK) |
| (수동) `.ai/checkpoint.md` 갱신 | 세션 종료 시 | 다음 사람을 위한 인계서 |

## 외워야 할 파일 3개

| 파일 | 위상 |
|---|---|
| [10_foundation/WHITEPAPER.md](10_foundation/WHITEPAPER.md) | 헌법 — 충돌 시 가장 강함 |
| [CLAUDE.md](CLAUDE.md) | 운영 규칙 — Change Class·게이트·Workflow |
| [.ai/checkpoint.md](.ai/checkpoint.md) | 살아있는 인계서 |

---

## 자주 하는 실수 (출시 시점)

- **루트에서 `python3 methodology.py` 실행** — 이전 구조의 잔재. 현재는 `60_tools/methodology.py`.
- **`HANDOFF.md`를 루트에서 찾음** — 현재 상태의 단일 live handoff다. 150줄 이하를 유지한다.
- **변경 직접 커밋** — `CLAUDE.md` §운영 규칙: 사용자 명시 승인 없이 커밋 금지.

## 인계 성공 기준 (체크리스트)

이 페이지만 보고 다음을 *추가 질문 없이* 할 수 있어야 합니다:

- [ ] 이 프로젝트가 무엇인지 한 문장 설명
- [ ] 다음 첫 작업 한 가지 식별
- [ ] 헌법·운영 규칙·인계서 파일 위치 알기
- [ ] 환경 검증 명령 실행

위 4개 중 하나라도 막히면 — 이는 본 ONBOARDING 또는 `.ai/checkpoint.md`의 결함입니다. 다음 세션에서 결함을 수정해 인계 품질을 높이는 것이 *제2원칙(인계 가능성)* 의 자가발전 루프입니다.
