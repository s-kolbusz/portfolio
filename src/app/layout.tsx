import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const satoshi = localFont({
  src: [
    {
      path: '../fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '300 900',
    },
    {
      path: '../fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '300 900',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sebastian Kolbusz | Portfolio',
  description: 'Full-stack developer and 3D printing enthusiast',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${satoshi.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
