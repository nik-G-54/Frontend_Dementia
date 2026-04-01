import { cn } from "../../lib/utils"

export function TaskItem({ done, dotColor, label, className }) {
  return (
    <div className={cn("flex items-center gap-2.5 py-2 border-b-[0.5px] border-[var(--color-border-tertiary)] text-[13px] text-[var(--color-text-primary)] last:border-0", className)}>
      <div
        className={cn(
          "w-[18px] h-[18px] rounded-full border-[1.5px] border-[var(--color-border-secondary)] shrink-0 flex items-center justify-center text-[10px] cursor-pointer transition-colors",
          done && "bg-[var(--color-background-success)] border-[var(--color-border-success)] text-[var(--color-text-success)]"
        )}
      >
        {done && "✓"}
      </div>
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span>{label}</span>
    </div>
  )
}
