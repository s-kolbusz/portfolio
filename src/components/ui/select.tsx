'use client'

import type { ReactNode } from 'react'

import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react'
import * as SelectPrimitive from '@radix-ui/react-select'

import { cn } from '@/lib/cn'

interface Option {
  label: string
  value: string
  icon?: ReactNode
}

interface SelectProps {
  id?: string
  label: string
  options: Map<string, Option>
  onChange: (val: string | null) => void
  className?: string
  defaultValue?: string
}

/**
 * Select component using Radix UI.
 * - data-cursor="button" handles custom cursor integration.
 * - Clean and minimal implementation without excessive state.
 */
export const Select = ({ id, label, onChange, options, className, defaultValue }: SelectProps) => {
  const optionsList = Array.from(options.values())
  const fallbackDefault = optionsList[0]?.value

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <label htmlFor={id} className="text-muted-foreground text-sm font-medium">
        {label}
      </label>
      <SelectPrimitive.Root defaultValue={defaultValue || fallbackDefault} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            'border-input bg-background text-foreground group box-border flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200',
            'hover:border-primary/50',
            'focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            'data-[state=open]:border-primary data-[state=open]:ring-primary data-[state=open]:ring-offset-background data-[state=open]:ring-2 data-[state=open]:ring-offset-2'
          )}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="flex items-center justify-center">
            <CaretDownIcon
              weight="bold"
              className="text-muted-foreground size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={8}
            className={cn(
              'glass border-border z-50 box-border rounded-2xl border shadow-xl transition-all',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'min-w-(--radix-select-trigger-width)'
            )}
          >
            <SelectPrimitive.Viewport className="p-4">
              {optionsList.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  data-cursor="button"
                  className={cn(
                    'box-border flex w-full cursor-none items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors outline-none select-none',
                    'focus:bg-muted/50 focus:text-foreground',
                    'data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground data-[state=selected]:font-bold'
                  )}
                >
                  <div className="pointer-events-none flex items-center gap-3">
                    {option.icon && (
                      <span className={cn('flex size-5 items-center justify-center')}>
                        {option.icon}
                      </span>
                    )}
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </div>
                  <SelectPrimitive.ItemIndicator>
                    <CheckIcon weight="bold" className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
