---
session_id: 2026-07-23_grm-001-font-selfhost-color-contrast
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
    where: "로컬 성능 재측정 신뢰도"
    cost_minutes: 20
    resolution: "병렬 실행 중인 다른 백그라운드 Claude Code 세션과 CPU 경합으로 LCP가 5.0s~13.5s로 크게 흔들림. Performance 절대수치는 production 배포 후로 재확정 미룸, Accessibility/CLS는 결정론적이라 로컬 검증 신뢰"
    repeat_of: null
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

GRM-001 Performance·Accessibility 조치. next/font/local로 Pretendard self-host(렌더블로킹 @import 제거, 로컬 CLS 0.359→0.097). color-contrast 100/100. 부수 발견: Tailwind var()+opacity 컴파일 실패로 헤더·하단내비가 완전 투명 렌더되던 버그 수정.
