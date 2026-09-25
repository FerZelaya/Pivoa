import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground",
        "transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring/20",
        "hover:border-muted-foreground/50",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
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
