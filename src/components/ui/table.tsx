import * as React from "react"
import { cn } from "@/lib/utils"

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string
  children?: React.ReactNode
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("min-w-full text-left border", className)} {...props}>
        {children}
      </table>
    </div>
  )
} 