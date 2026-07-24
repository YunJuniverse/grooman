---
session_id: 2026-07-24_talmo-recommendations-5-8-font-design
authored_by:
  agent: "claude-fable-5"
  tool: "claude-code"
  host_os: "darwin"
domain: webapp-next
task_type: refactor
stack_used:
  - "python3"
  - "methodology@v4.0"
flow_used: ad-hoc
friction:
  - id: F-001
    where: "자기 회귀 발견"
    cost_minutes: 25
    resolution: "오전에 GRM-001에서 @import 제거하려 넣은 variable 2.0MB가 실은 폰트 전송량을 8배 악화시킨 회귀였음. 당시엔 CLS만 보고 전송량을 안 쟀다. talmo 권고를 검토하다 실측으로 발견 — 측정 지표를 하나(CLS)만 보면 다른 축(전송량)의 회귀를 놓친다"
    repeat_of: font-strategy
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

talmo 권고 5~8: 폰트를 dynamic-subset self-host로(오전 variable 2.0MB 회귀를 홈 256KB로 되돌림)·DESIGN.md 신설·UX 진단(다크모드 제목 13곳 발견)·clinic 신뢰장치 설계.
