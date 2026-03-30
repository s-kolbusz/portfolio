'use client'

import { useEffect } from 'react'

import { Link } from '@/i18n/navigation'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: Props) {
  useEffect(() => {
    // Surface to error monitoring (e.g. Sentry) when integrated
    console.error(error)
  }, [error])

  return (
    <main
      id="main-content"
      className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans"
    >
      <h1 className="mb-4 font-serif text-6xl">500</h1>
      <h2 className="mb-8 font-mono text-2xl">Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred. You can try again or return to the homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border-primary text-primary hover:bg-primary/10 border px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}
