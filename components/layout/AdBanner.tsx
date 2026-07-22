import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Ad } from '@/types/supabase'

interface AdBannerProps {
  placement: 'sidebar' | 'feed' | 'banner'
  limit?: number
}

export default async function AdBanner({ placement, limit = 1 }: AdBannerProps) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const supabase = createClient()
  const { data } = await supabase
    .from('ads')
    .select('*')
    .eq('placement', placement)
    .eq('is_active', true)
    .order('order_num')
    .limit(limit)

  if (!data?.length) return null

  if (placement === 'sidebar') {
    return (
      <div className="space-y-3">
        {(data as Ad[]).map(ad => (
          <SidebarAd key={ad.id} ad={ad} />
        ))}
      </div>
    )
  }

  if (placement === 'feed') {
    return (
      <div className="space-y-3">
        {(data as Ad[]).map(ad => (
          <FeedAd key={ad.id} ad={ad} />
        ))}
      </div>
    )
  }

  if (placement === 'banner') {
    const ad = data[0] as Ad
    return <BannerAd ad={ad} />
  }

  return null
}

function SidebarAd({ ad }: { ad: Ad }) {
  return (
    <Link
      href={ad.link_url}
      className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
    >
      {ad.image_url && (
        <div className="w-full h-28 overflow-hidden">
          <img
            src={ad.image_url}
            alt={ad.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      )}
      <div className="p-3">
        {ad.badge && (
          <span className="inline-block text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mb-1.5">
            {ad.badge}
          </span>
        )}
        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{ad.title}</p>
        {ad.description && (
          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 whitespace-pre-line leading-relaxed">
            {ad.description}
          </p>
        )}
        <p className="text-[10px] text-gray-300 mt-2">광고</p>
      </div>
    </Link>
  )
}

function FeedAd({ ad }: { ad: Ad }) {
  return (
    <Link
      href={ad.link_url}
      className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-gray-100 transition group"
    >
      {ad.image_url && (
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={ad.image_url}
            alt={ad.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {ad.badge && (
          <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mb-1">
            {ad.badge}
          </span>
        )}
        <p className="text-sm font-medium text-gray-800 line-clamp-1">{ad.title}</p>
        {ad.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {ad.description.split('\n')[0]}
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">광고</p>
      </div>
    </Link>
  )
}

function BannerAd({ ad }: { ad: Ad }) {
  return (
    <Link
      href={ad.link_url}
      className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 hover:opacity-95 transition group"
    >
      {ad.image_url && (
        <div className="absolute inset-0 opacity-30">
          <img
            src={ad.image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
      )}
      <div className="relative px-6 py-5 flex items-center justify-between">
        <div>
          {ad.badge && (
            <span className="inline-block text-[10px] font-bold text-yellow-300 bg-yellow-900/50 px-2 py-0.5 rounded mb-2">
              {ad.badge}
            </span>
          )}
          <p className="text-base font-bold text-white">{ad.title}</p>
          {ad.description && (
            <p className="text-xs text-gray-300 mt-1">{ad.description.split('\n')[0]}</p>
          )}
        </div>
        <span className="flex-shrink-0 text-xs font-semibold text-white bg-white/20 px-3 py-1.5 rounded-lg ml-4">
          자세히 보기 →
        </span>
      </div>
      <p className="absolute bottom-1.5 right-3 text-[10px] text-gray-400">광고</p>
    </Link>
  )
}
