"use client";

import React, { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  haptic?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80",
  secondary: "bg-surface-elevated border border-border hover:bg-border/50",
  ghost: "hover:bg-surface-elevated active:bg-border/50",
  danger: "bg-danger text-white hover:opacity-90 active:opacity-80",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-[var(--radius-sm)]",
  md: "px-4 py-2.5 text-base rounded-[var(--radius)]",
  lg: "px-6 py-3 text-lg rounded-[var(--radius-lg)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      haptic = true,
      onClick,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled) triggerHaptic("light");
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center font-medium
          transition-opacity touch-manipulation
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        aria-disabled={disabled}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
