import Script from 'next/script'

export const UmamiAnalytics = () => {
  const websiteURL = process.env.NEXT_PUBLIC_UMAMI_URL
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!websiteId || !websiteURL) return null

  return (
    <Script
      async
      src={websiteURL}
      data-website-id={websiteId}
      strategy="afterInteractive"
      data-performance="true"
    />
  )
}
