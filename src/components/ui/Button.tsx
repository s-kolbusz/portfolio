import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface ButtonVisualProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-glass' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isLoading?: boolean
  disabled?: boolean
}

type ButtonAsButtonProps = ButtonVisualProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonVisualProps | 'href'> & {
    href?: undefined
    ref?: Ref<HTMLButtonElement>
  }

type ButtonAsLinkProps = ButtonVisualProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonVisualProps | 'href'> & {
    href: string
    ref?: Ref<HTMLAnchorElement>
  }

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

const EXTERNAL_LINK_PROTOCOL = /^[a-z][a-z\d+\-.]*:/i

function isExternalHref(href: string) {
  return href.startsWith('//') || EXTERNAL_LINK_PROTOCOL.test(href)
}

export function Button(props: ButtonProps) {
  const {
    className,
    variant = 'primary',
    size = 'md',
    children,
    leftIcon,
    rightIcon,
    isLoading,
    disabled,
    ...rest
  } = props

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium transition-[colors, box-shadow, scale] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer disabled:cursor-not-allowed opacity-100'

  const variants = {
    primary:
      'bg-primary text-background hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    'outline-glass':
      'border border-border hover:bg-accent/40 hover:text-accent-foreground rounded-md bg-white/20 backdrop-blur-sm dark:bg-black/20',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    glass: 'glass-button',
  }

  const sizes = {
    sm: 'h-9 px-4 text-xs rounded-sm',
    md: 'h-11 px-6 text-sm rounded-md',
    lg: 'h-14 px-8 text-base rounded-lg',
    icon: 'h-10 w-10 p-0 rounded-md',
  }

  const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className)

  const isDisabled = Boolean(disabled || isLoading)
  const content = (
    <>
      {isLoading && (
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </>
  )

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, onClick, target, rel, tabIndex, ref, ...anchorProps } = rest
    const handleClick: MouseEventHandler<HTMLAnchorElement> | undefined =
      isDisabled || onClick
        ? (event) => {
            if (isDisabled) {
              event.preventDefault()
              return
            }

            onClick?.(event)
          }
        : undefined

    const commonLinkProps = {
      ...anchorProps,
      className: combinedClassName,
      'aria-disabled': isDisabled || undefined,
      'data-cursor': 'button',
      tabIndex: isDisabled ? -1 : tabIndex,
      ...(handleClick ? { onClick: handleClick } : {}),
    }

    if (isExternalHref(href)) {
      const resolvedRel = target === '_blank' ? (rel ?? 'noopener noreferrer') : rel

      return (
        <a
          href={href}
          target={target}
          rel={resolvedRel}
          ref={ref as Ref<HTMLAnchorElement>}
          {...commonLinkProps}
        >
          {content}
        </a>
      )
    }

    return (
      <Link href={href} ref={ref as Ref<HTMLAnchorElement>} {...commonLinkProps}>
        {content}
      </Link>
    )
  }

  const { type = 'button', ref, ...buttonProps } = rest

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      className={combinedClassName}
      disabled={isDisabled}
      data-cursor="button"
      {...buttonProps}
    >
      {content}
    </button>
  )
}
