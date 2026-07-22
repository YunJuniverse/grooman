-- ============================================================
-- 005_reports_sanctions.sql — GRM-012 신고 처리 + 계정 제재
-- ⚠️ 수동 실행(Supabase SQL Editor). 정본: 12_운영기획서 §4.1(신고)·§5(제재), 서비스기획서 F7.
-- Change Class: B (스키마 + RLS 변경). 롤백: 하단 주석 참조.
-- ============================================================

-- ── 1. 계정 정지 상태 (§5 제재 집행 수단, G4 해소) ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_until timestamptz;

-- ── 2. 신고 처리 추적 (§4.1 조치·사유 기록) ──
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_note text;

-- 중복 신고 방지: 한 신고자는 같은 대상을 한 번만 (reporter_id NULL은 서로 distinct — 문제 없음)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_report_per_reporter_target
  ON reports(reporter_id, target_type, target_id);

-- 처리 큐 정렬/필터용
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- ── 3. 정지 중 작성 차단 (RLS — 정지의 실제 집행) ──
-- posts_insert / comments_insert에 "정지 아님" 조건을 추가한다. (기존 정책 교체)
DROP POLICY IF EXISTS "posts_insert" ON posts;
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND suspended_until IS NOT NULL AND suspended_until > now()
  )
);

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND suspended_until IS NOT NULL AND suspended_until > now()
  )
);

-- ── 4. 관리자 조치 권한 (RLS) ──
-- 신고 상태 전환 (pending → resolved/dismissed)
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));

-- 관리자의 타 사용자 프로필 수정(정지/해제·is_admin). 기존 profiles_update_own은 본인만이라 부족.
-- (부수 효과: 기존 toggleAdmin이 RLS에 막히던 잠재 버그도 해소 — permissive OR로 결합)
-- 내부 SELECT는 profiles_select_all(USING true)로 평가되어 재귀 없음.
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- ── 롤백 ──
-- DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
-- DROP POLICY IF EXISTS "reports_update_admin" ON reports;
-- DROP POLICY IF EXISTS "posts_insert" ON posts;      -- 후 001의 원본 정책 재생성
-- DROP POLICY IF EXISTS "comments_insert" ON comments; -- 후 001의 원본 정책 재생성
-- DROP INDEX IF EXISTS idx_reports_status;
-- DROP INDEX IF EXISTS uniq_report_per_reporter_target;
-- ALTER TABLE reports DROP COLUMN IF EXISTS admin_note, DROP COLUMN IF EXISTS resolved_at, DROP COLUMN IF EXISTS resolved_by;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS suspended_until;
