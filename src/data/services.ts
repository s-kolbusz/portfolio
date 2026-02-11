export interface Service {
  id: string
  popular?: boolean
}

export const services: Service[] = [
  {
    id: 'landing-page',
  },
  {
    id: 'website',
    popular: true,
  },
  {
    id: 'web-app',
  },
  {
    id: 'hourly',
  },
]
