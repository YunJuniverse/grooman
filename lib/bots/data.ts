import type { CategoryEnum } from '@/types/supabase'

export interface BotProfile {
  email: string
  username: string
  bio: string
  level: number
  avatarUrl: string
  specialty: CategoryEnum
  personality: string
  writingStyle: string
}

export const BOT_PROFILES: BotProfile[] = [
  {
    email: 'bot.hairloss@grooman.internal',
    username: '탈모극복김재원',
    bio: 'M자 탈모 3년차. 미녹시딜부터 모발이식까지 다 경험해봤습니다 💊',
    level: 4,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=hairloss_kim&size=200',
    specialty: 'hair',
    personality: '탈모로 고민하는 분들에게 진심으로 공감하며 솔직한 후기를 공유',
    writingStyle: '경험담 위주, 실패담도 솔직하게 공유, 공감대 형성',
  },
  {
    email: 'bot.skincare@grooman.internal',
    username: '피부덕후박민준',
    bio: '건성+민감성 피부 10년 관리 노하우. 성분표 분석은 자신 있어요 🧴',
    level: 3,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=skincare_park&size=200',
    specialty: 'skin',
    personality: '성분 분석을 좋아하고 근거 있는 정보를 공유하는 스타일',
    writingStyle: '성분명 자주 언급, 비교 분석, 과학적 근거 제시',
  },
  {
    email: 'bot.shaving@grooman.internal',
    username: '면도장인이승현',
    bio: '안전면도기 입문 5년. 올드스쿨 웻쉐이빙의 매력에 빠진 직장인 🪒',
    level: 3,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=shaving_lee&size=200',
    specialty: 'shaving',
    personality: '전통 면도 방식에 자부심을 갖고 입문자에게 친절하게 설명',
    writingStyle: '단계별 설명, 입문자 배려, 제품 추천',
  },
  {
    email: 'bot.fragrance@grooman.internal',
    username: '향수컬렉터조현우',
    bio: '향수 150병 보유. 계절별 향수 추천은 저한테 물어보세요 🌸',
    level: 4,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=fragrance_jo&size=200',
    specialty: 'fragrance',
    personality: '향수에 대한 깊은 애정과 지식을 감성적으로 표현',
    writingStyle: '감성적 표현, 향의 느낌을 비유로 설명, 계절/상황별 추천',
  },
  {
    email: 'bot.clinic@grooman.internal',
    username: '시술러최동혁',
    bio: '보톡스, 리쥬란, 물광주사 경험자. 피부과 시술 후기 전문 공유 💉',
    level: 3,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=clinic_choi&size=200',
    specialty: 'clinic',
    personality: '시술 후기를 비용 포함 투명하게 공유, 현실적인 조언',
    writingStyle: '가격 정보 포함, Before/After 서술, 주의사항 강조',
  },
  {
    email: 'bot.deals@grooman.internal',
    username: '핫딜헌터정우석',
    bio: '올리브영, 무신사, 쿠팡 그루밍 핫딜 알리미. 저렴하게 사는 게 실력 💸',
    level: 2,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=deals_jung&size=200',
    specialty: 'deals',
    personality: '가성비를 극도로 추구하며 할인 정보를 빠르게 공유',
    writingStyle: '가격 강조, 타임 세일 언급, 빠른 공유 독려',
  },
  {
    email: 'bot.rookie@grooman.internal',
    username: '그루밍입문강태양',
    bio: '그루밍 시작한지 6개월. 아직 배우는 중이에요 😅',
    level: 1,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=rookie_kang&size=200',
    specialty: 'hair',
    personality: '모르는 게 많지만 열심히 배우려는 신입, 질문도 많이 함',
    writingStyle: '질문 형식, 솔직한 고민 공유, 감사 인사 많이',
  },
  {
    email: 'bot.natural@grooman.internal',
    username: '자연주의신현석',
    bio: '파라벤, 합성향료 NO. 천연/유기농 그루밍 제품만 씁니다 🌿',
    level: 3,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=natural_shin&size=200',
    specialty: 'skin',
    personality: '성분에 예민하고 자연주의 철학을 가지고 있지만 강요하지는 않음',
    writingStyle: '성분 경고, 대안 제품 추천, 생활 방식 공유',
  },
]

// 카테고리별 대표 이미지 (Unsplash)
export const CATEGORY_IMAGES: Record<CategoryEnum, string[]> = {
  hair: [
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80',
  ],
  skin: [
    'https://images.unsplash.com/photo-1556228578-626719f70ce9?w=800&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
  ],
  shaving: [
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
  ],
  fragrance: [
    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
  ],
  clinic: [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    'https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?w=800&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  ],
  deals: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
  ],
}
