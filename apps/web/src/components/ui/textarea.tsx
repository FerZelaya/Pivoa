import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-border bg-background px-4 py-3 text-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/20",
        "hover:border-muted-foreground/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
