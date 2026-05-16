import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary:   'bg-brand-gold text-brand-dark hover:bg-brand-gold-light disabled:opacity-50',
  secondary: 'bg-brand-surface text-brand-text border border-brand-border hover:border-brand-muted disabled:opacity-50',
  ghost:     'text-brand-faint hover:text-brand-text disabled:opacity-50',
  danger:    'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-colors duration-150 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
