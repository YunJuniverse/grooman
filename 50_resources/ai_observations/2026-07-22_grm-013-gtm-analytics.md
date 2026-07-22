---
session_id: 2026-07-22_grm-013-gtm-analytics
authored_by:
  agent: "claude-fable-5"
  tool: "claude-code"
  host_os: "darwin"
domain: webapp-next
task_type: feature
stack_used:
  - "python3"
  - "methodology@v4.0"
flow_used: ad-hoc
friction:
  - id: F-001
    where: "검증"
    cost_minutes: 20
    resolution: "NEXT_PUBLIC_*가 빌드타임 인라인임을 놓쳐 build에 GTM_ID만 주입 → Supabase 값 빈 번들로 하이드레이션 크래시. build·start 양쪽 주입으로 해소하며 GRM-001 로컬측정 가능성도 확인"
    repeat_of: null
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

GRM-013 GTM(GTM-WJVFXRBT) 설치 — @next/third-parties+noscript 폴백, NEXT_PUBLIC_GTM_ID 게이트로 preview 오염 차단. 설치로 거짓이 되는 개인정보처리방침 §4·§5를 처리위탁표·분석쿠키·정보주체권리로 정비.
