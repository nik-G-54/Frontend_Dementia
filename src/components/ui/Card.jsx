import { cn } from "../../lib/utils"

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-[var(--color-background-primary)] border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl p-3.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardLabel({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-[0.5px] mb-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBigValue({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "text-[26px] font-medium text-[var(--color-text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "text-[13px] font-medium text-[var(--color-text-primary)] mb-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function MiniLabel({ className, children, ...props }) {
  return (
    <span
      className={cn("text-[11px] text-[var(--color-text-tertiary)]", className)}
      {...props}
    >
      {children}
    </span>
  )
}
