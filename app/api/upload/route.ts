import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary 환경변수가 설정되지 않았습니다.' }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const params = `folder=grooman&timestamp=${timestamp}&transformation=c_limit,w_1920,f_webp,q_auto`

  // HMAC-SHA1 서명 생성
  const encoder = new TextEncoder()
  const keyData = encoder.encode(apiSecret)
  const msgData = encoder.encode(`folder=grooman&timestamp=${timestamp}&transformation=c_limit,w_1920,f_webp,q_auto${apiSecret}`)

  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const uploadForm = new FormData()
  uploadForm.append('file', file)
  uploadForm.append('api_key', apiKey)
  uploadForm.append('timestamp', String(timestamp))
  uploadForm.append('folder', 'grooman')
  uploadForm.append('transformation', 'c_limit,w_1920,f_webp,q_auto')
  uploadForm.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadForm,
  })

  if (!res.ok) {
    return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ url: data.secure_url, public_id: data.public_id })
}
