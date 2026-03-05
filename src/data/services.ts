export interface Service {
  id: ServiceId
  popular?: boolean
}

export type ServiceId = 'landingPage' | 'website' | 'webApp' | 'hourly'

export const services = [
  {
    id: 'landingPage',
  },
  {
    id: 'website',
    popular: true,
  },
  {
    id: 'webApp',
  },
  {
    id: 'hourly',
  },
] as const satisfies readonly Service[]
