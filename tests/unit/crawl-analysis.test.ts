import { describe, it, expect } from 'vitest'
import { parseCrawlAnalysis } from '@/lib/ai/crawl-analysis'

const valid = {
  category: 'hair',
  summary: '미녹시딜 6개월 사용 후기.\n초기 탈락기 경험 공유.\n사진 기록 포함.',
  tags: ['미녹시딜', '탈모', '후기'],
  spam_score: 0.1,
  is_advertisement: false,
}

describe('parseCrawlAnalysis — 출력 계약 검증 (AI-001 §5, B3)', () => {
  it('정상 JSON을 파싱한다', () => {
    const result = parseCrawlAnalysis(JSON.stringify(valid))
    expect(result).toEqual(valid)
  })

  it('앞뒤 텍스트에 낀 JSON을 추출한다', () => {
    const text = `분석 결과입니다:\n${JSON.stringify(valid)}\n이상입니다.`
    expect(parseCrawlAnalysis(text)).toEqual(valid)
  })

  it('JSON이 없으면 null', () => {
    expect(parseCrawlAnalysis('분석할 수 없습니다')).toBeNull()
  })

  it('깨진 JSON이면 null', () => {
    expect(parseCrawlAnalysis('{ "category": "hair", ')).toBeNull()
  })

  it('clinic 카테고리는 구조적으로 거부한다 — 자동수급 금지 가드 (ADR-0001)', () => {
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, category: 'clinic' }))).toBeNull()
  })

  it('enum 밖 카테고리는 null', () => {
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, category: 'beauty' }))).toBeNull()
  })

  it('spam_score가 범위(0~1) 밖이면 null', () => {
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, spam_score: 1.5 }))).toBeNull()
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, spam_score: -0.1 }))).toBeNull()
  })

  it('spam_score 타입이 틀리면 null', () => {
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, spam_score: '낮음' }))).toBeNull()
  })

  it('tags가 문자열 배열이 아니면 null', () => {
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, tags: 'a,b' }))).toBeNull()
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, tags: [1, 2] }))).toBeNull()
  })

  it('필수 필드가 빠지면 null', () => {
    const { is_advertisement: _omit, ...missing } = valid
    expect(parseCrawlAnalysis(JSON.stringify(missing))).toBeNull()
  })

  it('is_advertisement 타입이 틀리면 null', () => {
    expect(parseCrawlAnalysis(JSON.stringify({ ...valid, is_advertisement: 'no' }))).toBeNull()
  })
})
