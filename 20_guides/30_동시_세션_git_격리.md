---
doc_id: guide-30
title: 동시 세션 git 격리 (Concurrent Session Isolation)
version: v5
status: active
last_updated: 2026-11-09
ai_relevance: foundational
---

# 30. 동시 세션 git 격리

> 한 저장소에서 **세션이 둘 이상 동시에** 돌 때의 git 규율. 지침 08(서브에이전트 오케스트레이션)이 *한 세션 안의* 팬아웃을 다룬다면, 이 문서는 *서로 다른 세션들이* 같은 체크아웃을 공유할 때의 사고를 막는다.
>
> 승급 근거: 캡슐 2건(`icons__2026-08-27_isolated-worktree-for-concurrent-sessions` · `icons__2026-08-27_shared-checkout-path-add-not-safe`)과 상류 자체 사고 1건(2026-08-22 지침 22 전파 중 브랜치 전환 레이스로 sync 커밋이 남의 피처 브랜치에 유입, 이력 오염 존치). METH-142.

---

## 1. 원칙 — 겹치면 격리한다

한 체크아웃은 **브랜치·인덱스·작업트리를 한 벌만** 가진다. 세션 둘이 그것을 공유하면 브랜치 전환·스테이징·커밋·배포가 서로를 덮는다. 조율로 막을 수 없다 — 상대의 미커밋 편집은 보이지 않기 때문이다.

- 같은 repo 에 다른 세션이 돌고 있을 가능성이 있으면 **`origin/<기본브랜치>` 기반 격리 워크트리에서 시작**한다.
- 작업·커밋·PR·배포를 전부 그 워크트리에서 한다. 끝나면 워크트리를 제거한다.
- 판단이 서면 격리한다 — 격리 비용(수 초)이 오염 복구 비용보다 항상 싸다.

```bash
git -C <repo> fetch -q origin
git -C <repo> worktree add --detach <경로> origin/main
# 작업 → commit → git push origin HEAD:main (또는 PR 브랜치)
git -C <repo> worktree remove <경로>
```

- **워크트리에서 `push origin HEAD:main` 하면 원본 체크아웃의 로컬 `main` 은 따라오지 않는다.** 원격만 앞서고 로컬은 그 자리다. 다음 세션이 그 체크아웃에서 main 에 커밋하면 뒤처진 main 위에 쌓여 push 가 거부되고, 같은 파일을 만졌으면 충돌한다(상류 실사고: invest-ops 1차 전파를 워크트리로 push → 2차 전파에서 로컬 main 이 1커밋 뒤처져 `.methodology-version`·`README`·`methodology.py` 3파일 충돌). 워크트리를 제거한 뒤 **원본 체크아웃이 main 이면 `git pull --ff-only`, 다른 브랜치면 `git fetch` 만 해두고 이 사실을 checkpoint 에 남긴다** — 그 체크아웃의 브랜치를 바꾸는 것은 지침 §1 위반이다.

## 2. 경로 지정 `git add` 는 안전장치가 아니다

기존 규율은 `git add -A` 금지까지만 다뤘다. **실사고는 `add -A` 없이 났다** — 동시 세션이 *같은 파일의 다른 블록*을 편집 중이면 파일 단위 스테이징이 남의 훅을 통째로 가져간다(icons `d216eff5` 혼입 → `d92ffd8c` 분리).

- 파일이 겹칠 가능성이 있으면 `git add -p` 로 훅을 고르거나, 애초에 격리 워크트리에서 시작한다.
- **착수 전 확인은 `git status` 의 미추적 파일로 끝나지 않는다.** 진짜 함정은 *이미 추적 중인 파일 안의 미커밋 편집*이다 — `git diff --stat` 까지 본다.
- `ship` 은 `--no-add-all` 일 때 인덱스에 작업트리 변경이 아닌 스테이징이 있으면 목록을 보이고 멈춘다(METH-142). 그 경고가 뜨면 **누가 올렸는지 확인하기 전에 `--index-verified` 를 쓰지 않는다.**

## 3. 워크트리 배포의 함정 — 링크 파일

격리 워크트리에는 배포 도구의 프로젝트 링크가 없다. 그대로 배포하면 **엉뚱한 새 프로젝트가 생긴다**(icons 실사고: `vercel deploy` 가 새 프로젝트 생성 → 링크 복사 후 재배포 → 잘못 생긴 프로젝트 삭제).

- 배포 전에 링크·자격 파일을 원본 체크아웃에서 복사한다(`.vercel/project.json` 류).
- 배포 산출물의 **프로젝트 이름·URL 을 배포 직후 확인**한다 — 성공 로그만으로는 어디에 올라갔는지 알 수 없다(지침 23 §1-4).

## 4. 브랜치 전환 레이스

상태 스캔과 실제 커밋 사이에는 시차가 있다. 그 사이 다른 세션이 브랜치를 바꾼다.

- 대규모 전파·스윕에서 「스캔 시점의 branch/dirty」를 근거로 커밋하지 않는다 — **커밋 직전에 다시 확인**하거나 격리 워크트리를 쓴다.
- 활성 세션이 있는 repo 는 예외 없이 격리 워크트리로 처리한다(상류 sync-all 의 확립된 절차).

## 6. 리베이스 충돌에서 라이브 파일을 일괄 `ours` 로 풀지 않는다 (METH-147)

리베이스 중 `ours` 는 **upstream** 이다. 라이브 파일(TODO·HANDOFF·checkpoint) 충돌을 일괄 `ours` 로 풀면 **내 checkpoint 와 HANDOFF 줄이 사라지고**, 그대로 ship 하면 wrap 이 4/4 미달로 선다(icons, docs PR 2건).

- HANDOFF 의 내 줄(Working-on·Recent)은 **재삽입**한다.
- checkpoint 는 «치환»이 아니라 **맨 위에 이번 세션 절(`## YYYY-MM-DD · <slug>`)을 추가**한다 — 치환 대상 문자열이 리베이스로 사라져 있을 수 있다. 이것이 checkpoint 의 정식 모델이다(methodology:ADR-006): 최근 3절 유지, 오래된 절은 `rotate --checkpoint --apply`.
- 리베이스 직후 `wrap` 으로 4/4 를 확인하고 ship 한다.
- TODO·HANDOFF 는 `.gitattributes merge=union` 이라 대부분 자동 합쳐진다. wrap 구조 검증이 잡는 것은 **Working-on 2줄·섹션 제목 중복·깨진 헤더**까지다. **같은 항목의 두 판이 줄 단위로 나란히 남는 것**(같은 Recent 줄의 옛판·새판, 두 Recent 목록 이어붙음)은 **못 잡는다** — gamblescan 실측 20분 + 정정 커밋 2건. union 머지 직후에는 `git diff HEAD~1 -- HANDOFF.md TODO.md` 로 중복 줄을 눈으로 확인하고 오래된 쪽을 지운다.

## 7. TODO ID 는 예약하고 쓴다 (METH-147)

병렬 세션이 같은 번호를 선점해 번호 충돌·커밋 혼입이 월 3건 이상(cafe24-renewal·icons). 새 항목을 만들기 전에 `methodology.py reserve` 로 번호를 받는다 — 원격 태그 `id/METH-N` 의 생성은 원자적이라 두 세션 중 하나만 성공하고, 밀린 쪽은 다음 번호를 받는다. 예약 없이 쓴 번호가 충돌하면 **나중 세션이 재부여**한다.

- Blocked 등록 전에는 기존 `## Blocked` 와 HANDOFF Blockers 를 grep 해 **같은 건이 PM 판정과 함께 이미 있는지** 본다(icons: 판정 있는 08-20 항목이 있는데 CI 결제 건을 중복 등재해 PM 에게 다시 물음). 판정 요청서는 뒤의 ADR 이 같은 결론을 세우면 스스로 닫힌다 — **월 1회 Blocked 를 후속 결정과 대조**해 stale 을 종결한다(16일 stale 실사례).

## 8. 생성물은 커밋하지 않는다 (METH-147)

`.ai/wrap-state.json`·`50_resources/prompting-report.md` 는 관찰로그와 HEAD 에서 언제든 재계산되는 생성물이다. 이것들이 모든 PR 에 실려 **PR 13건 중 11건이 이 두 파일과 라이브 파일 충돌**로 리베이스됐다(내용 충돌 0). ship 이 인덱스에서 빼고 `.gitignore` 가 막는다. wrap 의 baseline 은 HEAD 에서 재계산한다 — 파일이 없어도 판정은 같다.


## 8b. 작업물은 저장소 안 영속 경로에 둔다 (METH-149)

세션 스크래치·`/tmp`·바탕화면은 세션이 끝나면 사라진다. 실사고: 외부 repo 를 세션 스크래치에 클론해 작업 → 유실, 재클론과 env 재구성(lifeManager 25분 2회, checkpoint 는 지금도 사라진 경로를 가리킴) · 디자인 QA 의 근거 스크린샷 전부가 `/tmp/…` (icons-ax) · 바탕화면에만 있던 완성본이 사라져 재제작 30분(ai-icons).

- 이어서 쓸 작업물(다른 repo 클론·산출물·검증 증거)은 `~/Development/...` 의 정식 위치나 repo 의 `40_dev/snapshots/<date>_<slug>/` 에 둔다. 스크래치는 버려도 되는 중간물만.
- checkpoint·HANDOFF 의 «환경» 줄이 휘발 경로를 가리키면 그 자체가 인계 결함이다.

## 8c. 세션은 대상 repo 에서 시작한다 (METH-149)

도구 메모리·설정은 **세션을 시작한 폴더** 기준으로 붙는다. 방법론 repo 에서 세션을 연 뒤 다른 repo 로 `cd` 해 24일을 일하자, 그 프로젝트의 규칙(대외 가안 수치 금지·명사형 종결·시트 정본)이 **방법론 프로젝트의 메모리**에 저장됐다 — 그 프로젝트의 다른 세션·다른 에이전트(Codex)는 그 규칙을 못 보고, 방법론 세션에는 무관한 규칙이 주입된다(drip-chat-planning).

- 작업할 repo 에서 세션을 연다. 다른 repo 를 다뤄야 하면 그 repo 의 세션을 따로 연다.
- **프로젝트 규칙은 도구 메모리가 아니라 repo 에 박제**한다 — CLAUDE.md 프로젝트 섹션 또는 `00_briefs/standing/`. 도구 메모리는 사용자 개인 선호용(CLAUDE.md §2 «반복 작업 기억» 구분).
- 같은 repo 의 검증용 dev 서버를 세션마다 띄워야 하면 **산출물·DB 디렉터리를 분리**한 실행 설정을 둔다(`NEXT_DIST_DIR=.next-s2`·`PGLITE_DIR` 분리·다른 포트 — `.claude/launch.json` 에 정의). build-guard 와 다른 축의 회피책이다.

## 9. 적용 지점

- 전파·sync·릴리스처럼 **여러 repo 를 순회하는 작업**: 비-main·dirty repo 는 전부 격리 워크트리.
- 같은 repo 에서 사람과 AI 가 동시에 작업할 때, 또는 AI 세션이 둘 이상일 때.
- CLAUDE.md §2 의 branch-first 규율과 함께 읽는다 — 브랜치를 나누는 것으로 부족한 경우가 이 문서의 대상이다.

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v5 | 2026-11-09 | §6 checkpoint = 세션별 절 정식화(methodology:ADR-006 D1) |
| v4 | 2026-11-09 | §6 union 중복 검출 범위 정정(줄 단위 두 판은 wrap 이 못 잡는다 — gamblescan) · **§8b 작업물 영속 경로** · **§8c 세션은 대상 repo 에서 시작**(도구 메모리 오배치·dev 서버 디렉터리 분리). METH-149 전수조사 |
| v3 | 2026-09-15 | §6 리베이스 라이브 파일 · §7 ID 예약(`reserve`)·Blocked 중복 등록 방지 · §8 생성물 비커밋·union. 캡슐 5회차 병렬 세션 경합 7건 병합(METH-147) |
| v2 | 2026-09-02 | §1 보강 — 워크트리 push 는 로컬 기본브랜치를 따라오게 하지 않는다(invest-ops 2차 전파 충돌 실사고, METH-142 friction) |
| v1 | 2026-09-02 | 신설 — 캡슐 2건 승급(METH-142). 지침 08(서브에이전트, 한 세션 내 팬아웃)과 축이 달라 별도 지침으로 분리 |
