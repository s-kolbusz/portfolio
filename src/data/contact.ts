import type { Icon } from '@phosphor-icons/react'
import { EnvelopeIcon, GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from '@phosphor-icons/react'

export interface ContactLink {
  id: string
  labelKey: ContactLabelKey
  url: string
  icon: Icon
}

export type ContactLabelKey = 'email' | 'linkedin' | 'github' | 'twitter'

export const contactLinks = [
  {
    id: 'email',
    labelKey: 'email',
    url: 'mailto:s.kolbusz@outlook.com',
    icon: EnvelopeIcon,
  },
  {
    id: 'linkedin',
    labelKey: 'linkedin',
    url: 'https://linkedin.com/in/skolbusz',
    icon: LinkedinLogoIcon,
  },
  {
    id: 'github',
    labelKey: 'github',
    url: 'https://github.com/s-kolbusz',
    icon: GithubLogoIcon,
  },
  {
    id: 'twitter',
    labelKey: 'twitter',
    url: 'https://x.com/s_kolbusz',
    icon: XLogoIcon,
  },
] as const satisfies readonly ContactLink[]
