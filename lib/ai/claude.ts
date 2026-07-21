import Anthropic from '@anthropic-ai/sdk'
import { parseCrawlAnalysis, type CrawlAnalysis } from '@/lib/ai/crawl-analysis'

export type { CrawlAnalysis }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function analyzeCrawledContent(
  title: string,
  content: string
): Promise<CrawlAnalysis | null> {
  // fail-closed: 키가 없으면 분석 없이 통과시키지 않고 폐기한다 (지침 17 §4.2, AI-001 B4).
  // null → 호출부(/api/crawl)가 해당 글을 skip — 무필터 자동 게시 경로를 차단.
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY 없음 — 크롤 분석 불가, 해당 글 폐기 (fail-closed)')
    return null
  }

  const prompt = `다음 남성 그루밍 관련 글을 분석하고 JSON만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

제목: ${title}
내용: ${content.slice(0, 1000)}

응답 형식:
{
  "category": "hair | skin | shaving | fragrance | deals",
  "summary": "3줄 한국어 요약 (각 줄 30자 이내)",
  "tags": ["태그1", "태그2", "태그3"],
  "spam_score": 0.0~1.0,
  "is_advertisement": false
}

카테고리 기준:
- hair: 탈모, 헤어케어, 모발, 샴푸, 두피
- skin: 스킨케어, 세안, 보습, 선크림, 피부
- shaving: 면도, 쉐이빙, 면도기, 애프터쉐이브
- fragrance: 향수, 퍼퓸, 프래그런스, 향
- deals: 할인, 이벤트, 핫딜, 쿠폰, 세일`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      temperature: 0, // 분류·판정 작업 — 평가 재현성 (AI-001 B1)
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return parseCrawlAnalysis(text)
  } catch (err) {
    console.error('Claude API 분석 실패 — 해당 글 폐기 (fail-closed):', err)
    return null
  }
}
