-- 광고 테이블
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link_url text NOT NULL,
  badge text,
  placement text NOT NULL DEFAULT 'sidebar', -- sidebar | feed | banner
  is_active boolean NOT NULL DEFAULT true,
  order_num integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON ads TO anon, authenticated;
GRANT ALL ON ads TO service_role;

-- RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads_select" ON ads FOR SELECT USING (true);
CREATE POLICY "ads_admin_all" ON ads FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 샘플 광고 데이터
INSERT INTO ads (title, description, image_url, link_url, badge, placement, order_num) VALUES
(
  '탈모 걱정? 두피부터 케어하세요',
  '그루맨 추천 두피앰플 TOP5\n임상 검증된 성분으로 모발을 강화',
  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=300&fit=crop',
  '/hair',
  '📦 무료배송',
  'sidebar',
  1
),
(
  '필립스 전동면도기 할인 특가',
  '새벽 피부 자극 없는 습식 면도기\n그루맨 회원 특별 15% 할인',
  'https://images.unsplash.com/photo-1621607505282-7c51e7c1e1c2?w=400&h=300&fit=crop',
  '/shaving',
  '🔥 15% 할인',
  'sidebar',
  2
),
(
  '남성 기초 스킨케어 입문 세트',
  '토너 + 에센스 + 보습크림 3종 세트\n민감성 피부도 OK',
  'https://images.unsplash.com/photo-1556228578-567ba9c5a27a?w=400&h=300&fit=crop',
  '/skin',
  '🎁 3종 세트',
  'feed',
  1
),
(
  '향수 추천 서비스 오픈',
  '나만의 시그니처 향 찾기\n10가지 테스터를 집에서 체험',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&h=300&fit=crop',
  '/fragrance',
  '✨ 무료 체험',
  'feed',
  2
),
(
  '그루맨 × 클리닉 제휴 이벤트',
  '피부과 레이저·보톡스 최대 40% 할인\n서울·경기 25개 제휴 클리닉',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop',
  '/clinic',
  '🏥 40% 할인',
  'banner',
  1
),
(
  '그루맨 프리미엄 멤버십',
  '광고 없이 더 깨끗한 환경에서\n그루밍 정보를 즐기세요',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
  '/my',
  '👑 프리미엄',
  'sidebar',
  3
);
