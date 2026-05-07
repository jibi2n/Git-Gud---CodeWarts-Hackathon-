"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
};

// Primary action button per DESIGN.md §8.6. ≥56px height.
export const BigButton = forwardRef<HTMLButtonElement, BigButtonProps>(
  function BigButton({ variant = "primary", className, ...props }, ref) {
    const base =
      "inline-flex items-center justify-center w-full min-h-[56px] px-6 rounded-md text-[17px] font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-accent-emphasis text-fg-onEmphasis border-accent-emphasis hover:bg-accent-muted hover:border-accent-muted",
      secondary:
        "bg-bg-default text-fg border-border hover:bg-bg-subtle",
      destructive:
        "bg-danger-emphasis text-fg-onEmphasis border-danger-emphasis",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
