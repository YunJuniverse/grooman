// Tiptap 문서(JSON) 파생값 추출. 서버 액션과 클라이언트 폼 양쪽에서 쓴다 — server-only 아님.

/** 문서에서 순수 텍스트만 뽑는다(검색 색인·표현 경계 검사용). */
export function extractText(content: Record<string, unknown>): string {
  let text = ''
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    if (n.type === 'text' && typeof n.text === 'string') text += n.text + ' '
    if (Array.isArray(n.content)) n.content.forEach(walk)
  }
  walk(content)
  return text.trim()
}

/** 첫 번째 이미지 src를 썸네일로 쓴다. */
export function extractThumbnail(content: Record<string, unknown>): string | null {
  function walk(node: unknown): string | null {
    if (!node || typeof node !== 'object') return null
    const n = node as Record<string, unknown>
    if (n.type === 'image') {
      const attrs = n.attrs as Record<string, unknown> | undefined
      if (attrs?.src && typeof attrs.src === 'string') return attrs.src
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        const result = walk(child)
        if (result) return result
      }
    }
    return null
  }
  return walk(content)
}
