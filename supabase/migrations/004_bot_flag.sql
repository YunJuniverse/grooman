-- ============================================================
-- 004_bot_flag.sql
-- profiles.is_bot — 봇(출시 전 테스트 픽스처) 식별용 단일 소스.
-- 공개 배포 전 teardown(supabase/scripts/teardown_bots.sql)의 삭제 기준.
-- 배경/결정: 40_dev/adr/0002-bot-seeding-cold-start.md (GRM-010)
-- ============================================================

-- 1) 컬럼 추가 (기본 false — 실사용자·자동수집(user_id=null) 글에는 영향 없음)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;

-- 봇만 빠르게 스캔/삭제하기 위한 partial index
CREATE INDEX IF NOT EXISTS idx_profiles_is_bot ON profiles(is_bot) WHERE is_bot;

-- 2) 기존 시딩 봇 백필 — 식별자 3곳 불일치를 흡수(belt & suspenders):
--    (a) 알려진 8개 봇 username (data.ts / 002_seed_bots.sql 공통, UNIQUE)
--    (b) 봇 이메일 패턴 — 002(@grooman.kr 고정) · data.ts(@grooman.internal)
--        · 런타임 시더(seed-bots/route.ts: bot.<random>@grooman.kr) 모두 커버
UPDATE profiles p
SET is_bot = true
WHERE p.username IN (
  '탈모극복김재원','피부덕후박민준','면도장인이승현','향수컬렉터조현우',
  '시술러최동혁','핫딜헌터정우석','그루밍입문강태양','자연주의신현석'
)
   OR p.id IN (
     SELECT u.id FROM auth.users u
     WHERE u.email LIKE 'bot.%@grooman.kr'
        OR u.email LIKE 'bot.%@grooman.internal'
   );

-- 검증(참고): 봇 수 확인
-- SELECT count(*) FROM profiles WHERE is_bot;
