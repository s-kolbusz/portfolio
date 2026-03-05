import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { gsap, useGSAP } from './gsap-core'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger, useGSAP }
