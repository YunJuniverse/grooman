import { z } from 'zod'

// 자동수급 허용 카테고리만 — clinic은 의도적으로 제외 (UGC 전용, ADR-0001).
// enum이 곧 가드: 모델이 clinic을 반환해도 스키마 검증에서 폐기된다.
export const crawlCategorySchema = z.enum(['hair', 'skin', 'shaving', 'fragrance', 'deals'])

export const crawlAnalysisSchema = z.object({
  category: crawlCategorySchema,
  summary: z.string().min(1),
  tags: z.array(z.string()),
  spam_score: z.number().min(0).max(1),
  is_advertisement: z.boolean(),
})

export type CrawlAnalysis = z.infer<typeof crawlAnalysisSchema>

// 모델 응답 텍스트 → 검증된 CrawlAnalysis. 실패는 전부 null (fail-closed — 폐기는 호출부 책임).
export function parseCrawlAnalysis(text: string): CrawlAnalysis | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  let raw: unknown
  try {
    raw = JSON.parse(jsonMatch[0])
  } catch {
    return null
  }

  const result = crawlAnalysisSchema.safeParse(raw)
  return result.success ? result.data : null
}
