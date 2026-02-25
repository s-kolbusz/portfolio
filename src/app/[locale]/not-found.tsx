import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function LocalizedNotFound() {
  const t = useTranslations('notFound')
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 font-sans bg-background text-foreground">
      <h1 className="text-6xl font-serif mb-4">{t('title')}</h1>
      <h2 className="text-2xl font-mono mb-8">{t('subtitle')}</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        {t('description')}
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
      >
        {t('returnHome')}
      </Link>
    </div>
  )
}
