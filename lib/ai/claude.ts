import Anthropic from '@anthropic-ai/sdk'
import type { CategoryEnum } from '@/types/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface CrawlAnalysis {
  category: CategoryEnum
  summary: string
  tags: string[]
  spam_score: number
  is_advertisement: boolean
}

export async function analyzeCrawledContent(
  title: string,
  content: string
): Promise<CrawlAnalysis | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // API 키 없으면 기본값 반환
    return {
      category: 'hair',
      summary: content.slice(0, 150),
      tags: [],
      spam_score: 0,
      is_advertisement: false,
    }
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
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    return JSON.parse(jsonMatch[0]) as CrawlAnalysis
  } catch (err) {
    console.error('Claude API 분석 실패:', err)
    return null
  }
}
