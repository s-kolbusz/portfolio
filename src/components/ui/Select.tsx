'use client'

import { ReactNode } from 'react'

import { Select as SelectPrimitive } from '@base-ui/react/select'
import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react'

import { useScrollStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

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
}

export const Select = ({ id, label, onChange, options, className }: SelectProps) => {
  const lenis = useScrollStore((state) => state.lenis)

  const handleOpenChange = (open: boolean) => {
    if (lenis) {
      if (open) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <label htmlFor={id} className="text-muted-foreground text-sm font-medium">
        {label}
      </label>
      <SelectPrimitive.Root
        id={id}
        name={id}
        defaultValue={options.keys().next().value}
        onOpenChange={handleOpenChange}
        onValueChange={onChange}
      >
        <SelectPrimitive.Trigger
          className={cn(
            'border-input bg-background text-foreground group box-border flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200',
            'hover:border-primary/50',
            'focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            'data-popup-open:border-primary data-popup-open:ring-primary data-popup-open:ring-offset-background data-popup-open:ring-2 data-popup-open:ring-offset-2'
          )}
        >
          <SelectPrimitive.Value className="flex items-center gap-2 truncate">
            {(v) => {
              const opt = options.get(v)
              return (
                <>
                  {opt?.icon && <span className="text-primary">{opt.icon}</span>}
                  <span className="truncate">{opt?.label}</span>
                </>
              )
            }}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className="flex items-center justify-center">
            <CaretDownIcon
              weight="bold"
              className="text-muted-foreground size-4 transition-transform duration-200 group-data-popup-open:rotate-180"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            align="center"
            alignItemWithTrigger={false}
            sideOffset={8}
            className="z-50 w-(--anchor-width)"
          >
            <SelectPrimitive.Popup
              data-lenis-prevent
              className={cn(
                'glass border-border box-border overflow-y-auto rounded-2xl border p-4 shadow-xl transition-all duration-300 ease-out',
                'focus-visible:ring-accent focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                'data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0',
                'max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin)'
              )}
            >
              {Array.from(options.values()).map((option) => (
                <SelectPrimitive.Item
                  data-cursor="button"
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'box-border flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors outline-none',
                    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none',
                    'data-selected:bg-primary data-selected:text-primary-foreground data-selected:font-bold',
                    'data-highlighted:not-data-selected:bg-muted/50 data-highlighted:not-data-selected:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
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
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
