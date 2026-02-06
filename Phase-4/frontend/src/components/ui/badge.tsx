import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        error: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
        secondary: "bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
