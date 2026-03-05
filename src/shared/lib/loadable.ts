import type { ComponentType, LazyExoticComponent } from 'react'
import { lazy } from 'react'

import dynamic from 'next/dynamic'

type ComponentLoader<TProps extends object> = () => Promise<{
  default: ComponentType<TProps>
}>

function toDefaultComponentLoader<TModule, TProps extends object>(
  loader: () => Promise<TModule>,
  select: (loadedModule: TModule) => ComponentType<TProps>
): ComponentLoader<TProps> {
  return async () => {
    const loadedModule = await loader()

    return {
      default: select(loadedModule),
    }
  }
}

export function lazyClientOnly<TProps extends object>(
  loader: ComponentLoader<TProps>
): LazyExoticComponent<ComponentType<TProps>> {
  return lazy(loader)
}

export function dynamicClientOnly<TProps extends object>(loader: ComponentLoader<TProps>) {
  return dynamic<TProps>(loader, { ssr: false })
}

export function dynamicClientOnlyNamed<TModule, TProps extends object>(
  loader: () => Promise<TModule>,
  select: (loadedModule: TModule) => ComponentType<TProps>
) {
  return dynamicClientOnly(toDefaultComponentLoader(loader, select))
}
