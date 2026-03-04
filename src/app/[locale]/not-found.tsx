import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function LocalizedNotFound() {
  const t = useTranslations('notFound')

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans">
      <h1 className="mb-4 font-serif text-6xl">{t('title')}</h1>
      <h2 className="mb-8 font-mono text-2xl">{t('subtitle')}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">{t('description')}</p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors"
      >
        {t('returnHome')}
      </Link>
    </div>
  )
}
