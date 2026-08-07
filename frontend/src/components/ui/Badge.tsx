import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
        warning: "border-transparent bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20",
        danger: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
        info: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
        premium: "border-transparent bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  label?: string | React.ReactNode;
  glow?: boolean;
  pulse?: boolean;
}

function Badge({ className, variant, size, label, glow, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), glow && "shadow-[0_0_10px_currentColor] opacity-90", className)} {...props}>
      {pulse && <span className="h-1.5 w-1.5 mr-1.5 rounded-full bg-current animate-ping shrink-0" />}
      {label || children}
    </div>
  )
}

export { Badge, badgeVariants }
