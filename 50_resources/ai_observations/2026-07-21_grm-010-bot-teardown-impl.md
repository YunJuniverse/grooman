---
session_id: 2026-07-21_grm-010-bot-teardown-impl
authored_by:
  agent: "unknown"
  tool: "unknown"
  host_os: "unknown"
domain: meta
task_type: feature
stack_used:
  - "python3"
  - "methodology@v4.0"
flow_used: ad-hoc
friction:
  - id: F-001
    where: "fk-set-null-orphan"
    cost_minutes: 10
    resolution: "posts/comments.user_id=SET NULL이라 계정만 지우면 봇글 방치→teardown이 글·댓글 우선 삭제하도록 설계"
    repeat_of: repeat_of:none
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

GRM-010 구현: profiles.is_bot 마이그레이션(004)+백필, 시더 is_bot 세팅으로 식별 일원화, teardown 스크립트(글·댓글 우선 삭제로 ON DELETE SET NULL 방치 방지), 릴리스 게이트 SOP. types에 is_bot 추가. Class B.
