'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function ColorPicker({
  value = '#000000',
  onChange,
  placeholder = '#000000',
  className,
  disabled = false,
}: ColorPickerProps) {
  const [internalValue, setInternalValue] = React.useState(value)
  const [isOpen, setIsOpen] = React.useState(false)

  // Sync internal value with prop
  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInternalValue(newColor)
    onChange?.(newColor)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newColor = e.target.value.trim()

    // Auto-add # if missing
    if (newColor && !newColor.startsWith('#')) {
      newColor = '#' + newColor
    }

    // Validate hex color format
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(newColor) || /^#[0-9A-Fa-f]{3}$/.test(newColor)

    if (isValidHex) {
      setInternalValue(newColor)
      onChange?.(newColor)
    } else if (newColor === '#') {
      setInternalValue(newColor)
      onChange?.(newColor)
    }
  }

  const handleTextBlur = () => {
    // Reset to valid value on blur if invalid
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(internalValue) || /^#[0-9A-Fa-f]{3}$/.test(internalValue)
    if (!isValidHex && internalValue !== '#') {
      // Keep current invalid value for correction but don't update parent
    }
  }

return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Native color input - provides full color spectrum picker */}
      <div className="relative">
        <input
          type="color"
          value={internalValue || '#000000'}
          onChange={handleColorChange}
          disabled={disabled}
          className="w-10 h-10 rounded cursor-pointer border border-input bg-background"
          style={{ padding: 0, width: '2.5rem', height: '2.5rem' }}
        />
      </div>

      {/* Hex input field */}
      <input
        type="text"
        value={internalValue}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}

export { ColorPicker }
