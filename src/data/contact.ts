import type { Icon } from '@phosphor-icons/react'
import {
  EnvelopeIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from '@phosphor-icons/react/dist/ssr'

interface ContactLink {
  id: string
  labelKey: string
  url: string
  icon: Icon
}

export const contactLinks: ContactLink[] = [
  {
    id: 'email',
    labelKey: 'email',
    url: 'mailto:office@kolbusz.xyz',
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
]
