-- ============================================================
-- 006_security_hardening.sql — Supabase security advisor 대응
-- 적용 완료: 2026-07-22, 프로젝트 grooman(wqrxuzplcfjtjoiraqsf)
-- 배경: 001~005 적용 직후 advisor가 WARN 11건 검출 → 본 마이그레이션으로 10건 해소.
--       HANDOFF SEC-1(RLS·보안 누락이 조용한 취약점이 되는 문제) 계열.
-- Change Class: B (보안·권한 변경). 롤백: 하단 주석.
-- ============================================================

-- 1) 전 함수 search_path 고정
--    미고정 시 호출자가 search_path를 조작해 동명 객체로 유도할 수 있다
--    (SECURITY DEFINER 함수에서 특히 권한 상승 벡터).
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_hot_rank() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_post_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_comment_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_post_like_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_comment_like_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_level_upgrade() SET search_path = public, pg_temp;

-- 2) SECURITY DEFINER 트리거 함수의 공개 RPC 노출 차단
--    handle_new_user는 auth.users AFTER INSERT 트리거 전용인데,
--    PostgREST가 /rest/v1/rpc/handle_new_user 로 anon·authenticated에게 노출하고 있었다.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- ── 미해소(의도적 보류) ──
-- extension_in_public: pg_trgm이 public 스키마에 설치됨.
--   현재 pg_trgm을 쓰는 인덱스·쿼리가 없고(전문검색은 to_tsvector 사용),
--   extensions 스키마로 옮기면 search_path 해석 문제로 향후 trigram 사용 시
--   깨질 수 있어 보류. 실제 trigram 도입 시 함께 이동할 것.

-- ── 롤백 ──
-- ALTER FUNCTION public.handle_new_user() RESET search_path;  -- (각 함수 동일)
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
