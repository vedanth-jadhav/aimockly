"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MockySpeechBubbleProps {
  children: React.ReactNode;
  position?: "left" | "right" | "center";
  className?: string;
  animate?: boolean;
}

export function MockySpeechBubble({
  children,
  position = "left",
  className,
  animate = true,
}: MockySpeechBubbleProps) {
  const positionClasses = {
    left: "before:left-8",
    right: "before:right-8",
    center: "before:left-1/2 before:-translate-x-1/2",
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative bg-white border-2 border-gray-800 rounded-2xl p-4 shadow-lg",
        "before:content-[''] before:absolute before:-bottom-3 before:w-4 before:h-4",
        "before:bg-white before:border-b-2 before:border-r-2 before:border-gray-800",
        "before:rotate-45 before:transform",
        positionClasses[position],
        className
      )}
    >
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </motion.div>
  );
}
