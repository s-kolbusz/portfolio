import type messages from './messages/en.json'
import type { routing } from './routing'

type AppLocale = (typeof routing.locales)[number]
type AppMessages = typeof messages

declare module 'next-intl' {
  interface AppConfig {
    Locale: AppLocale
    Messages: AppMessages
  }
}
