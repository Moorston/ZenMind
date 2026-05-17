import * as React from "react"
import { View, Text } from "@tarojs/components"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#7c6aef] text-white hover:bg-[#7c6aef] hover:bg-opacity-90",
        destructive: "bg-[#ef4444] text-white hover:bg-opacity-90",
        outline: "border border-white border-opacity-10 bg-[#141428] text-[#f0f0f5] hover:bg-[#1a1a3e]",
        secondary: "bg-[#1a1a3e] text-[#f0f0f5] hover:bg-opacity-80",
        ghost: "text-[#9090a0] hover:text-[#f0f0f5] hover:bg-[#1a1a3e]",
        link: "text-[#7c6aef] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 rounded-lg",
        lg: "h-12 px-8 rounded-xl",
        icon: "h-10 w-10 rounded-xl",
        xs: "h-8 px-2 rounded-lg text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof View>, 'onClick'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
  disabled?: boolean
  className?: string
  onClick?: (e: any) => void
}

const Button = React.forwardRef<React.ElementRef<typeof View>, ButtonProps>(
  ({ className, variant = 'default', size = 'default', disabled, onClick, children, ...props }, ref) => {
    return (
      <View
        className={cn(
          buttonVariants({ variant, size, className }),
          disabled && "opacity-50 pointer-events-none"
        )}
        ref={ref as any}
        onClick={disabled ? undefined : onClick}
        hoverClass={disabled ? undefined : "opacity-80"}
        {...props}
      >
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </View>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
