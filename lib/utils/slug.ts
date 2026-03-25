export function generateSlug(title: string): string {
  const clean = title
    .replace(/[^\w\s가-힣]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)

  const uid = Math.random().toString(36).slice(2, 10)
  return `${clean}-${uid}`
}
