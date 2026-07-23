---
session_id: 2026-07-23_supabase-publishable-secret-key-migration
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
    where: "요구범위 파악"
    cost_minutes: 15
    resolution: "사용자가 붙여넣은 대시보드 안내가 Next.js 전용이 아닌 범용 Edge Functions 온보딩이라 이름 규칙(SUPABASE_ vs NEXT_PUBLIC_SUPABASE_)이 달랐음. search_docs로 @supabase/server의 실제 대상 런타임(Deno)을 확인 후 미도입 결정 — 학습데이터 추측이었다면 잘못 설치했을 것"
    repeat_of: null
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

Supabase legacy anon/service_role 키를 publishable/secret 키명으로 전환(ADR-0004). @supabase/server는 Edge Functions 전용임을 확인해 미도입 — 대신 client/server/admin 클라이언트 env var명만 교체.
