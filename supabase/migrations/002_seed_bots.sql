-- ============================================================
-- 봇 계정 생성 (auth.users + profiles 직접 삽입)
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- pgcrypto 확장 (비밀번호 해싱용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  bot_ids uuid[] := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];
  bots RECORD;
  i int := 1;
BEGIN
  -- auth.users에 봇 계정 삽입
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    aud, role, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
  (
    bot_ids[1], '00000000-0000-0000-0000-000000000000',
    'bot.hair@grooman.kr',
    crypt('BotPass!hair1', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"탈모극복김재원"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[2], '00000000-0000-0000-0000-000000000000',
    'bot.skin@grooman.kr',
    crypt('BotPass!skin2', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"피부덕후박민준"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[3], '00000000-0000-0000-0000-000000000000',
    'bot.shaving@grooman.kr',
    crypt('BotPass!shave3', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"면도장인이승현"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[4], '00000000-0000-0000-0000-000000000000',
    'bot.fragrance@grooman.kr',
    crypt('BotPass!frag4', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"향수컬렉터조현우"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[5], '00000000-0000-0000-0000-000000000000',
    'bot.clinic@grooman.kr',
    crypt('BotPass!clin5', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"시술러최동혁"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[6], '00000000-0000-0000-0000-000000000000',
    'bot.deals@grooman.kr',
    crypt('BotPass!deal6', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"핫딜헌터정우석"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[7], '00000000-0000-0000-0000-000000000000',
    'bot.rookie@grooman.kr',
    crypt('BotPass!rook7', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"그루밍입문강태양"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  ),
  (
    bot_ids[8], '00000000-0000-0000-0000-000000000000',
    'bot.natural@grooman.kr',
    crypt('BotPass!nat8', gen_salt('bf', 6)),
    now(), now(), now(),
    '{"name":"자연주의신현석"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    'authenticated', 'authenticated', '', '', '', ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- profiles 업데이트 (트리거가 이미 기본 생성했을 것)
  UPDATE profiles SET
    username = '탈모극복김재원',
    bio = 'M자 탈모 3년차. 미녹시딜부터 모발이식까지 다 경험해봤습니다 💊',
    level = 4,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=hairloss_kim&size=200'
  WHERE id = bot_ids[1];

  UPDATE profiles SET
    username = '피부덕후박민준',
    bio = '건성+민감성 피부 10년 관리 노하우. 성분표 분석은 자신 있어요 🧴',
    level = 3,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=skincare_park&size=200'
  WHERE id = bot_ids[2];

  UPDATE profiles SET
    username = '면도장인이승현',
    bio = '안전면도기 입문 5년. 올드스쿨 웻쉐이빙의 매력에 빠진 직장인 🪒',
    level = 3,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=shaving_lee&size=200'
  WHERE id = bot_ids[3];

  UPDATE profiles SET
    username = '향수컬렉터조현우',
    bio = '향수 150병 보유. 계절별 향수 추천은 저한테 물어보세요 🌸',
    level = 4,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=fragrance_jo&size=200'
  WHERE id = bot_ids[4];

  UPDATE profiles SET
    username = '시술러최동혁',
    bio = '보톡스, 리쥬란, 물광주사 경험자. 피부과 시술 후기 전문 공유 💉',
    level = 3,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=clinic_choi&size=200'
  WHERE id = bot_ids[5];

  UPDATE profiles SET
    username = '핫딜헌터정우석',
    bio = '올리브영, 무신사, 쿠팡 그루밍 핫딜 알리미. 저렴하게 사는 게 실력 💸',
    level = 2,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=deals_jung&size=200'
  WHERE id = bot_ids[6];

  UPDATE profiles SET
    username = '그루밍입문강태양',
    bio = '그루밍 시작한지 6개월. 아직 배우는 중이에요 😅',
    level = 1,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=rookie_kang&size=200'
  WHERE id = bot_ids[7];

  UPDATE profiles SET
    username = '자연주의신현석',
    bio = '파라벤, 합성향료 NO. 천연/유기농 그루밍 제품만 씁니다 🌿',
    level = 3,
    avatar_url = 'https://api.dicebear.com/7.x/adventurer/png?seed=natural_shin&size=200'
  WHERE id = bot_ids[8];

END $$;

-- 확인
SELECT id, username, level, bio FROM profiles
WHERE username IN (
  '탈모극복김재원','피부덕후박민준','면도장인이승현','향수컬렉터조현우',
  '시술러최동혁','핫딜헌터정우석','그루밍입문강태양','자연주의신현석'
);
