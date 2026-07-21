-- ============================================================
-- teardown_bots.sql — 봇(테스트 픽스처) 전량 삭제
-- ⚠️ 자동 마이그레이션 아님. 공개 배포 직전 Supabase SQL Editor에서 수동 실행.
-- 선행: 004_bot_flag.sql (profiles.is_bot) 적용돼 있어야 함.
-- 결정/배경: 40_dev/adr/0002-bot-seeding-cold-start.md (GRM-010) · 릴리스 게이트 SOP
--
-- FK 주의:
--   posts.user_id / comments.user_id = ON DELETE SET NULL
--     → 계정만 지우면 봇 글·댓글이 user_id=null 로 남아 published 상태로 방치된다
--       (자동수집 글과 구분 불가해짐). 반드시 글·댓글부터 삭제.
--   posts 삭제는 그 글의 comments·post_likes·bookmarks 를 FK CASCADE로 함께 지운다.
--   auth.users 삭제는 profiles·comment_likes·notifications 를 FK CASCADE로 함께 지운다.
--   ※ 봇 글에 달린 "실사용자" 댓글도 CASCADE로 삭제된다 — 이 스크립트는
--     실사용자가 없는 "공개 배포 전" 실행을 전제로 한다.
-- ============================================================

BEGIN;

-- 1) 봇이 작성한 게시글 (딸린 댓글·좋아요·북마크 CASCADE)
DELETE FROM posts
WHERE user_id IN (SELECT id FROM profiles WHERE is_bot);

-- 2) 봇이 (비-봇 글에) 단 댓글
DELETE FROM comments
WHERE user_id IN (SELECT id FROM profiles WHERE is_bot);

-- 3) 봇 계정 (profiles·comment_likes·notifications CASCADE)
DELETE FROM auth.users
WHERE id IN (SELECT id FROM profiles WHERE is_bot);

COMMIT;

-- ── 검증 (모두 0 이어야 통과) ──────────────────────────────
-- 남은 봇 계정
SELECT count(*) AS remaining_bots FROM profiles WHERE is_bot;
-- 저작자 없이 남은 비-자동수집 글(=삭제 누락된 봇 글 탐지)
SELECT count(*) AS orphan_non_crawled_posts
FROM posts
WHERE is_auto_crawled = false AND user_id IS NULL;
