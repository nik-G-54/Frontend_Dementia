import { cn } from "../../lib/utils"

export function Badge({ variant = "default", className, children, ...props }) {
  const variantStyles = {
    default: "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]",
    low: "bg-[var(--color-background-success)] text-[var(--color-text-success)]",
    med: "bg-[var(--color-background-warning)] text-[var(--color-text-warning)]",
    hi: "bg-[var(--color-background-danger)] text-[var(--color-text-danger)]",
    info: "bg-[var(--color-background-info)] text-[var(--color-text-info)]",
  }

  return (
    <span
      className={cn(
        "inline-block text-[11px] px-2 py-0.5 rounded",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
