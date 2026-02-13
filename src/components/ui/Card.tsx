"use client";

import React, { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "elevated";
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, className = "", ...rest }, ref) => {
    const bgClass =
      variant === "elevated" ? "bg-surface-elevated" : "bg-surface";

    return (
      <motion.div
        ref={ref}
        className={`
          rounded-[var(--radius)] border border-border
          shadow-sm
          ${bgClass} ${className}
        `}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
