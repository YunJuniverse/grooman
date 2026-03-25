export interface RssItem {
  title: string
  link: string
  description: string
  pubDate: string
}

export async function fetchRssFeed(rssUrl: string): Promise<RssItem[]> {
  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Grooman/1.0 RSS Reader' },
      next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const xml = await res.text()
    return parseRssXml(xml)
  } catch (err) {
    console.error(`RSS fetch 실패 [${rssUrl}]:`, err)
    return []
  }
}

function parseRssXml(xml: string): RssItem[] {
  const items: RssItem[] = []

  // <item> 태그 추출
  const re = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null) {
    const block = match[1]

    const title = extractTag(block, 'title') ?? ''
    const link = extractTag(block, 'link') ?? extractTag(block, 'guid') ?? ''
    const description = stripHtml(extractTag(block, 'description') ?? extractTag(block, 'content:encoded') ?? '')
    const pubDate = extractTag(block, 'pubDate') ?? extractTag(block, 'dc:date') ?? new Date().toISOString()

    if (title && link) {
      items.push({ title, link, description, pubDate })
    }
  }

  return items
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
    ?? xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
  return match?.[1]?.trim() ?? null
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}
