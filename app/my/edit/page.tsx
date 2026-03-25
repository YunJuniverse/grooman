import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ProfileEditClient from './ProfileEditClient'

export const metadata: Metadata = { title: '프로필 편집' }

export default async function ProfileEditPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  return <ProfileEditClient profile={profile} />
}
