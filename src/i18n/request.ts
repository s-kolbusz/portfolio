import { getRequestConfig } from 'next-intl/server'

import { getLocaleOrDefault } from './locale'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = getLocaleOrDefault(await requestLocale)

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
