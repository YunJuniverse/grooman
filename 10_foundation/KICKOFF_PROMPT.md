# Kickoff Prompt

> 새 프로젝트 시작 시 Claude Code 또는 Codex에 붙여넣는 시작 템플릿.
> 목표는 긴 파이프라인을 선언하는 것이 아니라, `CLAUDE/AGENTS/HANDOFF/TODO`를 바로 작동 상태로 만드는 것이다.

---

## 기본 사용 흐름

1. `init-project.sh`로 프로젝트를 만든다.
2. 프로젝트 폴더에서 AI 세션을 연다.
3. 아래 템플릿을 첫 메시지로 보낸다.
4. 첫 응답에서 AI가 `CLAUDE.md`, `AGENTS.md`, `HANDOFF.md`, `TODO.md`를 정리하게 한다.

---

## Fullstack 템플릿

```text
AGENTS.md와 HANDOFF.md를 읽고 프로젝트를 세팅해줘.

1. AGENTS.md와 CLAUDE.md의 Project Settings 빈칸을 먼저 채워줘.
2. 아래 내용을 바탕으로 TODO.md를 acceptance criteria가 있는 작업 목록으로 바꿔줘.
3. 첫 작업의 Change Class를 판별하고, 왜 그렇게 분류했는지 짧게 설명해줘.
4. 바로 시작할 첫 작업 1개를 추천해줘.

## 프로젝트 브리프
- 아이디어:
- 왜 지금 하는가:
- 목표:
- 예상 사용자:
- 선호 스택:
- 제약 조건:
- primary approver:
- public release 여부:

## 현재 자산
- 기존 코드: [없음 / 있음]
- 기존 문서: [없음 / 있음]
- 참고 링크:

## 첫 작업 후보
- [예: 로그인 플로우 MVP]
- acceptance criteria:
  - [ ]
  - [ ]
```

---

## Planning-Only 템플릿

```text
AGENTS.md와 HANDOFF.md를 읽고 planning-only 프로젝트를 세팅해줘.

1. AGENTS.md와 CLAUDE.md의 Project Settings 빈칸을 먼저 채워줘.
2. 아래 내용을 바탕으로 TODO.md를 research/planning backlog로 정리해줘.
3. 첫 산출물을 40_dev/snapshots/ 아래 어떤 문서로 만들지 추천해줘.
4. 필요한 외부 근거가 무엇인지 먼저 정리해줘.

## 프로젝트 브리프
- 주제:
- 왜 지금 필요한가:
- 검토자/승인자:
- 최종적으로 필요한 산출물:
- 기한:

## 현재 자산
- 기존 문서:
- 참고 링크:
- 이미 확인된 제약:

## 첫 작업 후보
- [예: 시장 검증 메모]
- acceptance criteria:
  - [ ]
  - [ ]
```

---

## 권장 첫 요청 예시

### 예시 1: Fullstack

```text
AGENTS.md와 HANDOFF.md를 읽고 프로젝트를 세팅해줘.

1. Project Settings를 채우고
2. TODO.md를 첫 backlog로 만들고
3. 첫 작업의 Change Class를 분류해줘.

## 프로젝트 브리프
- 아이디어: 동네 취미 모임 매칭 앱
- 왜 지금 하는가: 지역 기반 취미 모임을 찾는 경험이 너무 파편화되어 있음
- 목표: RSVP 가능한 MVP 출시
- 예상 사용자: 20~40대 취미 모임 참여자
- 선호 스택: Next.js + Supabase
- 제약 조건: 1인 개발, 6주
- primary approver: 본인
- public release 여부: private beta

## 현재 자산
- 기존 코드: 없음
- 기존 문서: 없음
- 참고 링크: Meetup, 당근 모임

## 첫 작업 후보
- 인증과 프로필 생성 흐름
- acceptance criteria:
  - 이메일 로그인 가능
  - 닉네임/지역/관심사를 저장
  - 기본 프로필 화면에서 값 확인 가능
```

### 예시 2: Planning-Only

```text
AGENTS.md와 HANDOFF.md를 읽고 planning-only 프로젝트를 세팅해줘.

1. Project Settings를 채우고
2. TODO.md를 research backlog로 만들고
3. 첫 snapshot 문서를 추천해줘.

## 프로젝트 브리프
- 주제: 반려동물 건강관리 구독 서비스
- 왜 지금 필요한가: 사업 타당성부터 먼저 확인하고 싶음
- 검토자/승인자: 대표
- 최종적으로 필요한 산출물: 사업기획 snapshot + 서비스 명세 snapshot
- 기한: 2주

## 현재 자산
- 기존 문서: 아이디어 노트 1개
- 참고 링크: 펫프렌즈, 닥터나우
- 이미 확인된 제약: 개발 착수 전 시장성 검토 필요

## 첫 작업 후보
- 시장/사용자 문제 검증
- acceptance criteria:
  - 핵심 경쟁사 3개 비교
  - 타겟 사용자 pain point 5개 정리
  - 다음 snapshot 문서 추천
```

---

## 운영 메모

- 첫 세션에서 AI가 해야 할 일은 큰 기획서를 쓰는 것이 아니라 작업 가능한 backlog를 만드는 것이다.
- `HANDOFF.md`는 세션 상태 파일이므로, 첫 세션부터 짧게 유지한다.
- planning-only에서도 approval evidence는 PR 또는 issue 스레드로 남기는 편이 좋다.
