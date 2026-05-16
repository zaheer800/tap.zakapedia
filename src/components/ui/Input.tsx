import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const baseClass =
  'w-full rounded-xl border border-brand-border bg-brand-dark px-3 py-2.5 text-sm text-brand-text ' +
  'placeholder:text-brand-faint focus:border-brand-muted focus:outline-none ' +
  'transition-colors disabled:opacity-50'

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-brand-faint">{label}</label>
      )}
      <input {...props} className={`${baseClass} ${error ? 'border-red-500/60' : ''} ${className}`} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-faint">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-brand-faint">{label}</label>
      )}
      <textarea
        {...props}
        className={`${baseClass} resize-none ${error ? 'border-red-500/60' : ''} ${className}`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-faint">{hint}</p>}
    </div>
  )
}
