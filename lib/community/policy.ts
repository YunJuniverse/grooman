import type { CategoryEnum } from '@/types/supabase'

// 커뮤니티 노출 정책 — 법적 판단이 코드에 박히는 자리.
// 서버 컴포넌트·유틸 양쪽에서 공유한다(server-only 아님).

/**
 * 플랫폼이 카테고리 밖 표면(홈 HOT·타 카테고리 연관글)에 재노출하지 않는 카테고리.
 *
 * 근거: 대가 없는 이용자 후기 자체는 의료광고가 아니지만(복지부 2021 검토의견),
 * **플랫폼이 이를 재게시하면 광고로 전환**된다는 해석이 있다. 광고로 전환되는 순간
 * 의료법 §56①이 광고 주체를 의료인·의료기관장·개설자로 한정하므로, 비의료인인
 * 그루맨이 주체가 되어 고지 문구로는 치유되지 않는다. (§27 환자 유인 리스크도 별도)
 *
 * 적용 범위 = **재게시 표면만**. clinic 글은 clinic 카테고리 목록·검색·글 상세에서
 * 그대로 노출된다 — 원래 자리에 두는 것은 재게시가 아니다.
 *
 * 결정: 사용자 승인 2026-07-24(3개 선택지 중 "HOT에서 clinic 제외"). Class C.
 * 배경 조사: 40_dev/snapshots/talmo-com-cross-project-research-2026-07-24.md §2.2
 */
export const NO_CROSS_CATEGORY_REDISPLAY: CategoryEnum[] = ['clinic']

/** 해당 카테고리를 카테고리 밖 표면에 재노출해도 되는가. */
export function canRedisplayAcrossCategories(category: CategoryEnum): boolean {
  return !NO_CROSS_CATEGORY_REDISPLAY.includes(category)
}

/** PostgREST `not.in` 필터용 리터럴 — 예: `(clinic)` */
export const REDISPLAY_EXCLUDED_FILTER = `(${NO_CROSS_CATEGORY_REDISPLAY.join(',')})`

/**
 * HOT 승격 최소 추천 수.
 *
 * 한국 게시판 표준 로직 = 추천 임계값 + 시간 윈도우(에펨코리아 포텐: 게시판별 17~64,
 * 24h 윈도우). 임계값이 없으면 `hot_rank`의 시간항(Reddit식 `epoch/45000`)이 지배해
 * "HOT = 그냥 최신"이 되어 배지가 죽는다.
 *
 * 값 근거: talmo-com 실측 — 글 80개에 임계값 5를 쓰니 78%가 BEST가 되어 무의미해졌고,
 * 10으로 올려 26%로 정상화. 그루맨은 공개 전이라 더 낮게 시작하되, 글이 쌓이면 상향할 것.
 */
export const HOT_MIN_LIKES = 3
