---
session_id: 2026-07-22_grm-001-lighthouse-static-audit
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
    where: "no-env-no-lighthouse"
    cost_minutes: 15
    resolution: "자격증명 없어 데이터 구동 페이지 렌더 실패→실측 불가. 가짜 점수 대신 정적 감사+안전 최적화로 정직 처리, 측정은 배포 이연"
    repeat_of: repeat_of:none
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

GRM-001: 로컬 Supabase 자격증명 부재로 실 Lighthouse 측정 불가 → 정직하게 정적 감사로 전환. 5경로×4카테고리 코드감사(SEO·a11y 양호, 주약점=raw img 크기부재) + 안전 최적화(viewport/themeColor·리스트 img lazy/async) 적용. 숫자 ≥90 측정은 배포 env 필요로 Blocked 명시. 테스트 21/21·build ✓.
