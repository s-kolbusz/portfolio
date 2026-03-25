import { getTranslations } from 'next-intl/server'

export async function SkipToMain() {
  const t = await getTranslations('actions')
  return (
    <a
      href="#page-content-start"
      className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-full focus:px-6 focus:py-3 focus:outline-none"
    >
      {t('skip_to_main')}
    </a>
  )
}
