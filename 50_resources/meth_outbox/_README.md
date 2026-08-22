---
doc_id: meth-outbox-readme
title: 캡슐 outbox — 상류행 방법론 업데이트 제안함
version: v1.0.0
status: active
last_updated: 2026-07-29
ai_relevance: schema
---

# meth_outbox (캡슐 발신함 — METH-117 역방향 루프)

> 이 repo에서 **방법론(상류)에 반영할 제안**을 캡슐로 적재하는 곳.
> 상류가 수동 트리거 `methodology collect`로 일괄 수거한다 — 이 디렉터리는 상류가 절대 변경하지 않는다(읽기 전용).
> 캡슐은 git push와 함께 origin으로 이동해야 타 호스트에서도 수거된다 — **작성 후 커밋·push 필수**.

## 1. 원칙

- **1 제안 = 1 캡슐 = 1 파일.** 서로 다른 제안을 한 파일에 섞지 않는다(catalog "1문제 1엔트리"와 동일 granularity). 트리아지·채택/기각·원장 기록이 전부 캡슐 단위다.
- **포인터 + 요약 — 원문 덤프 금지.** git 이력은 커밋 SHA·PR URL로, 문서는 repo 상대경로로 가리키고, 본문에는 제안 요지와 근거 발췌만 담는다. 원문 정본은 이 repo다. 본문 120줄 초과는 생성·검증에서 차단된다.
- **friction과 역할 구분.** friction(관찰 로그) = 막힌 *사실*의 기록, 캡슐 = 변경 *제안*. 마찰에서 파생된 제안은 `friction_ref`로 해당 관찰로그 session_id를 가리킨다.

## 2. 작성 트리거

| 상황 | 규칙 |
|---|---|
| 사용자가 "방법론에 반영해줘 / 나중에 방법론 업데이트에 넣어줘"라고 명시 | **의무** — 그 세션 wrap 전에 캡슐 생성 |
| AI가 자발적으로 제안하고 싶을 때 | 근거(재발·비용·실사례)가 있을 때만 **권장** — 노이즈는 상류 트리아지를 마비시킨다 |
| 막힘·재발의 단순 기록 | 캡슐 아님 — `observe --friction` |

## 3. 생성 — 반드시 CLI

```bash
python3 60_tools/methodology.py capsule \
  --slug ppt-deck-method --type guide-update --target guide-22 \
  --summary "차트 xlsx→PNG 파이프라인을 지침 22 P3에 표준 절차로 추가 제안" \
  --ref "abc1234" --ref "https://github.com/org/repo/pull/42" \
  --ref "40_dev/snapshots/IR/build-notes.md"
```

- `--type`: `guide-update`(지침 보강) | `friction-escalation`(마찰 승급 제안) | `pattern`(재사용 패턴) | `tool-change`(methodology.py·도구 변경)
- `--target`: `guide-NN` | `catalog` | `skeleton/<도메인>` | `tool/<명령>` 등 반영 목표
- 파일명 `YYYY-MM-DD_<slug>.md`, id는 `<repo>__<파일명 stem>` 자동 부여(수거 중복 방지 키)
- 검증: `capsule --validate <path>`

## 4. 민감정보

- 캡슐은 원격을 거쳐 상류로 이동한다 — **시크릿·개인정보·조합원 정보 등은 절대 본문에 넣지 않는다**(refs로만 가리킴). ship의 sensitive 검사가 캡슐 내용의 시크릿 의심 패턴을 차단한다.
- 민감 도메인 repo는 `.methodology-version`에 `"capsule_policy": "restricted"`를 두면 발신이 차단된다(사람 승인 시 `--allow-restricted`).

## 5. 수거 이후

- 상류 `collect`가 `_inbox/`로 복사하고 원장(`_ledger.json`)에 id를 기록한다. **이 디렉터리의 파일은 수거 후에도 그대로 남는다**(도장 안 찍힘 — 수거 여부는 상류 원장이 정본).
- 채택되면 지침·catalog·skeleton이 되어 sync-all로 되돌아온다(그게 사실상의 응답). 기각 통지는 v1 스코프 밖.
- 오래 묵은 캡슐을 지우고 싶으면 이 repo에서 자유롭게 정리해도 된다 — 이미 수거된 것은 원장 기준으로 중복 수거되지 않는다.
