'use client'
import { useEffect } from 'react'

interface AdSenseUnitProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdSenseUnit({ adSlot, adFormat = 'auto', className }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {}
  }, [])

  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  if (!adClient) return null

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
