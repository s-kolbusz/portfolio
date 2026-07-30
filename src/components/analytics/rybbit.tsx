import Script from 'next/script'

export const RybbitAnalytics = () => (
  <Script
    src="https://analytics.limneidos.com/api/script.js"
    data-site-id="d0993c88b819"
    strategy="afterInteractive"
  />
)
