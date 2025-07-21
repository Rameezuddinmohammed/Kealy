import * as React from "react"
import { cn } from "@/lib/utils"

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  className?: string
  children?: React.ReactNode
}

export function Dialog({ open, onClose, className, children, ...props }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={cn(
          "bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-xs relative",
          className
        )}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  )
} 