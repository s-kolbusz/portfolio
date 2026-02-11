import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-glass' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      href,
      children,
      leftIcon,
      rightIcon,
      isLoading,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer disabled:cursor-not-allowed opacity-100'

    const variants = {
      primary:
        'bg-primary text-background hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      'outline-glass':
        'border border-border hover:bg-accent/40 hover:text-accent-foreground rounded-md bg-white/20 backdrop-blur-sm dark:bg-black/20',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    }

    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-sm',
      md: 'h-11 px-6 text-sm rounded-md',
      lg: 'h-14 px-8 text-base rounded-lg',
    }

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className)

    const content = (
      <>
        {isLoading && (
          <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </>
    )

    if (href) {
      return (
        <Link
          href={href}
          className={combinedClassName}
          aria-disabled={disabled || isLoading}
          data-cursor="button"
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        data-cursor="button"
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'
