import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          
          // Variants
          {
            "bg-primary text-white hover:bg-primary-dark": variant === "default" || variant === "primary",
            "bg-primary-lighter text-primary hover:bg-primary-lightest": variant === "secondary",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "hover:bg-primary-lightest hover:text-primary": variant === "ghost",
          },
          
          // Sizes
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
