---
session_id: 2026-07-23_grm-001-lighthouse-deployed-measurement
authored_by:
  agent: "claude-fable-5"
  tool: "claude-code"
  host_os: "darwin"
domain: webapp-next
task_type: research
stack_used:
  - "python3"
  - "methodology@v4.0"
flow_used: ad-hoc
friction:
  - id: F-001
    where: "측정 대상 URL"
    cost_minutes: 10
    resolution: "배포별 URL이 Deployment Protection(SSO)에 막혀 302. project alias(grooman.vercel.app)로 전환해 해결. lighthouse CLI --preset=perf가 Performance만 실행함을 뒤늦게 발견해 --only-categories로 재실행"
    repeat_of: null
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

GRM-001 배포환경 Lighthouse 실측(production alias, 3/5경로). Performance 미달 원인을 globals.css의 웹폰트 @import(렌더블로킹+서드파티 origin, CLS 주범)로 진단. 조치는 사람 확인 후 진행.
