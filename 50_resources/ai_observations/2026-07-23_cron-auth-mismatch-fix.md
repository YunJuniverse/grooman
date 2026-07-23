---
session_id: 2026-07-23_cron-auth-mismatch-fix
authored_by:
  agent: "claude-fable-5"
  tool: "claude-code"
  host_os: "darwin"
domain: webapp-next
task_type: bugfix
stack_used:
  - "python3"
  - "methodology@v4.0"
flow_used: ad-hoc
friction:
  - id: F-001
    where: "발견 경위"
    cost_minutes: 10
    resolution: "사용자가 CRON_SECRET 생성을 요청한 김에 실제 소비처(cron 라우트)를 점검하다 발견. 공식 Vercel 문서로 호출 형식(GET+Bearer) 확인 후 수정, 검증 시 실제 DB 쓰기가 발생하는 정상 경로(bot-activity)는 트리거하지 않고 거부 경로만 확인해 부수효과 방지"
    repeat_of: null
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

vercel.json 크론 2건이 실제 Vercel Cron 호출 형식(GET+Authorization Bearer)과 안 맞아 배포돼도 절대 실행 안 됐을 버그 발견·수정. 어드민 수동 트리거 경로는 유지.
