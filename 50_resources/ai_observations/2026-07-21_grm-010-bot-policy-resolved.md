---
session_id: 2026-07-21_grm-010-bot-policy-resolved
authored_by:
  agent: "unknown"
  tool: "unknown"
  host_os: "unknown"
domain: meta
task_type: docs
stack_used:
  - "python3"
  - "methodology@v4.0"
flow_used: ad-hoc
friction:
  - id: F-001
    where: "bot-teardown-impossible"
    cost_minutes: 15
    resolution: "is_bot 마커·삭제스크립트 부재 발견, GRM-010 실행항목으로 전환"
    repeat_of: repeat_of:none
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

GRM-010 결정: 봇은 출시 전 look 확인용 테스트 픽스처, 실배포 시 전량 삭제(현재 비공개)→프로덕션 표기 불필요, '봇 0건' 릴리스 게이트로 대체. 진짜 리스크는 teardown 불가(is_bot 컬럼 없음·식별자 3곳 불일치·삭제 스크립트 부재)임을 발견해 BOT-1로 등록.
