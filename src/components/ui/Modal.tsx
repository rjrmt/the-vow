"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
}: ModalProps) {
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) {
      triggerHaptic("light");
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <motion.div
            className="absolute inset-0 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <motion.div
            className="relative w-full max-w-md max-h-[90dvh] overflow-auto
              bg-surface border-t sm:border border-border rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)]
              shadow-xl"
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold p-4 pb-0"
              >
                {title}
              </h2>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
