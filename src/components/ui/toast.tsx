import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  message: string
  type?: "success" | "error"
  show: boolean
}

export function Toast({ message, type = "success", show }: ToastProps) {
  if (!show) return null
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 text-sm font-semibold transition-all duration-300",
      type === "success"
        ? "bg-green-500 text-white dark:bg-green-700"
        : "bg-red-500 text-white dark:bg-red-700"
    )}>
      {message}
    </div>
  )
} 