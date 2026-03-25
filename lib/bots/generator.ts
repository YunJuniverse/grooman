import Anthropic from '@anthropic-ai/sdk'
import type { CategoryEnum } from '@/types/supabase'
import type { BotProfile } from './data'
import { CATEGORY_IMAGES } from './data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GeneratedPost {
  title: string
  content: Record<string, unknown>
  content_text: string
  thumbnail_url: string
  tags: string[]
  ai_summary: string
}

export interface GeneratedComment {
  content: string
  replyTo?: number // index of parent comment
}

const CATEGORY_TOPICS: Record<CategoryEnum, string[]> = {
  hair: [
    '미녹시딜 사용 후기', '두피 스케일링 방법', '탈모 샴푸 비교', '헤어 에센스 추천',
    '모발이식 상담 후기', '두피 마사지 효과', '탈모 초기 증상', '헤어 왁스 추천',
  ],
  skin: [
    '레티놀 입문 가이드', '비타민C 세럼 효과', '자외선 차단제 비교', '세안 루틴 공유',
    '남자 기초 스킨케어', '각질 제거 방법', '여드름 흉터 케어', '보습 크림 추천',
  ],
  shaving: [
    '안전면도기 입문기', '쉐이빙 크림 추천', '면도 후 트러블 케어', '전기면도기 vs 수동',
    '웻쉐이빙 입문 가이드', '면도날 관리법', '쉐이빙 오일 사용법', '역방향 면도 팁',
  ],
  fragrance: [
    '봄 향수 추천', '출근용 향수 TOP5', '향수 레이어링 방법', '오드퍼퓸 vs 오드뚜왈렛',
    '겨울 머스크 향수', '첫 향수 입문 가이드', '향수 뿌리는 위치', '국산 향수 추천',
  ],
  clinic: [
    '리쥬란힐러 후기', '보톡스 비용 정리', '피부과 첫 방문 가이드', '모공 레이저 후기',
    '피코 레이저 경험담', '물광주사 효과', '탈모 치료 시작하기', '여드름 치료 과정',
  ],
  deals: [
    '올리브영 세일 정리', '무신사 그루밍 핫딜', '아마존 직구 꿀템', '편의점 스킨케어',
    '다이소 그루밍 추천', '정기배송 할인 팁', '멤버십 혜택 정리', '시즌 오프 공략법',
  ],
}

function buildTiptapDoc(paragraphs: string[], imageUrl?: string): Record<string, unknown> {
  const content: unknown[] = []

  paragraphs.forEach((para, i) => {
    if (para.trim()) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: para.trim() }],
      })
    }
    // 2번째 문단 뒤에 이미지 삽입
    if (i === 1 && imageUrl) {
      content.push({
        type: 'image',
        attrs: { src: imageUrl, alt: '그루밍 이미지', title: null },
      })
    }
  })

  return { type: 'doc', content }
}

export async function generateBotPost(
  bot: BotProfile,
  topicHint?: string
): Promise<GeneratedPost> {
  const topics = CATEGORY_TOPICS[bot.specialty]
  const topic = topicHint ?? topics[Math.floor(Math.random() * topics.length)]
  const images = CATEGORY_IMAGES[bot.specialty]
  const imageUrl = images[Math.floor(Math.random() * images.length)]

  const prompt = `당신은 "${bot.username}"라는 한국 남성 그루밍 커뮤니티 유저입니다.
성격: ${bot.personality}
글쓰기 스타일: ${bot.writingStyle}

주제 "${topic}"에 대한 커뮤니티 게시글을 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "제목 (20-50자, 클릭하고 싶은 제목)",
  "paragraphs": [
    "첫 번째 문단 (도입부, 2-3문장)",
    "두 번째 문단 (본론1, 3-4문장)",
    "세 번째 문단 (본론2, 3-4문장)",
    "네 번째 문단 (결론/추천, 2-3문장)"
  ],
  "tags": ["태그1", "태그2", "태그3"],
  "summary": "2-3줄 요약"
}

글쓰기 규칙:
- 진짜 커뮤니티 유저처럼 자연스럽게
- 개인 경험담 포함
- 이모지 1-2개 자연스럽게 사용
- 반말/존댓말 혼용 금지 (해요체 통일)`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse bot post JSON')

  const parsed = JSON.parse(jsonMatch[0]) as {
    title: string
    paragraphs: string[]
    tags: string[]
    summary: string
  }

  const content = buildTiptapDoc(parsed.paragraphs, imageUrl)
  const content_text = parsed.paragraphs.join(' ')

  return {
    title: parsed.title,
    content,
    content_text,
    thumbnail_url: imageUrl,
    tags: parsed.tags.slice(0, 5),
    ai_summary: parsed.summary,
  }
}

export async function generateBotComments(
  postTitle: string,
  postSummary: string,
  bots: BotProfile[],
  count = 4
): Promise<GeneratedComment[]> {
  const botNames = bots.map(b => b.username).join(', ')

  const prompt = `다음 그루밍 커뮤니티 게시글에 달린 댓글 대화를 생성하세요.

게시글 제목: "${postTitle}"
게시글 요약: ${postSummary}
댓글 작성자들: ${botNames}

아래 JSON 배열 형식으로만 응답하세요:
[
  {"author": "유저명", "content": "댓글 내용", "replyTo": null},
  {"author": "유저명", "content": "댓글 내용", "replyTo": null},
  {"author": "유저명", "content": "댓글 내용", "replyTo": 0},
  {"author": "유저명", "content": "댓글 내용", "replyTo": 1}
]

규칙:
- 총 ${count}개 댓글
- 자연스러운 대화 흐름 (동의, 반론, 추가 정보, 질문 등)
- replyTo는 답글 대상 인덱스 (없으면 null)
- 각 댓글 1-3문장
- 커뮤니티 분위기로 (ㅋㅋ, ㄷㄷ 등 자연스럽게)
- 반드시 작성자들 중에서만 선택`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    author: string
    content: string
    replyTo: number | null
  }>

  return parsed.map(c => ({
    content: c.content,
    authorName: c.author,
    replyTo: c.replyTo ?? undefined,
  })) as GeneratedComment[]
}
