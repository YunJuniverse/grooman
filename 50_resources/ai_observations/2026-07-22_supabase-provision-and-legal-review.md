---
session_id: 2026-07-22_supabase-provision-and-legal-review
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
    where: "legal-review-without-counsel"
    cost_minutes: 30
    resolution: "변호사 없이 법적 검토 요청받음. 가짜 안전보증 대신 공개 법령·판례 조사→구체 조치+한계·잔여리스크 명시로 처리. 사용자의 '광고심의로 커버' 오해도 정정"
    repeat_of: repeat_of:none
prompt_patterns:
  - intent: "l1 observation capture"
    success: true
    rounds: 1
---

Supabase 프로젝트 신규 생성(월$10 승인 후)+마이그 4건 적용+보안 하드닝(advisor 11→1건, SECURITY DEFINER RPC 노출 차단). 사용자 요청으로 법적 검토 직접 수행: 정보통신망법 §44-2 절차가 약관에 없어 법정의무 위반 상태 발견→약관 제6조 신설. 의료법 §56은 '자발적 단순후기는 위반 아님'이 핵심→clinic 존립 근거 확인, 위반선 4유형을 제7조로 고지.
