import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WriteForm from './WriteForm'

export const metadata: Metadata = {
  title: '글쓰기',
  robots: { index: false },
}

export default async function WritePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">새 글 작성</h1>
      <WriteForm />
    </div>
  )
}
