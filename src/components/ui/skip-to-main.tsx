import { getTranslations } from 'next-intl/server'

export async function SkipToMain() {
  const t = await getTranslations('actions')
  return (
    <a
      href="#page-content-start"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-full focus:bg-emerald-600 focus:px-6 focus:py-3 focus:text-white focus:outline-none"
    >
      {t('skip_to_main')}
    </a>
  )
}
