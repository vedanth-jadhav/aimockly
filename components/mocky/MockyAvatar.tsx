"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MockyExpression = "support" | "builder" | "celebration" | "concerned" | "default";

interface MockyAvatarProps {
  expression?: MockyExpression;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export function MockyAvatar({
  expression = "default",
  size = "md",
  animate = true,
  className,
}: MockyAvatarProps) {
  const getAccessory = () => {
    switch (expression) {
      case "support":
        return (
          // Headset
          <g>
            <path
              d="M25 15 Q15 15 15 30 L15 35"
              fill="none"
              stroke="#4A90D9"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M75 15 Q85 15 85 30 L85 35"
              fill="none"
              stroke="#4A90D9"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="10" y="32" width="12" height="16" rx="4" fill="#4A90D9" />
            <rect x="78" y="32" width="12" height="16" rx="4" fill="#4A90D9" />
            <path
              d="M25 12 Q50 5 75 12"
              fill="none"
              stroke="#333"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        );
      case "builder":
        return (
          // Hard hat
          <g>
            <ellipse cx="50" cy="20" rx="35" ry="15" fill="#F5C842" />
            <rect x="20" y="15" width="60" height="12" rx="2" fill="#F5C842" />
            <rect x="25" y="25" width="50" height="4" fill="#E5B832" />
          </g>
        );
      case "celebration":
        return (
          // Party hat
          <g>
            <polygon points="50,5 30,35 70,35" fill="#E53935" />
            <circle cx="50" cy="5" r="4" fill="#F5C842" />
            <line x1="35" y1="15" x2="40" y2="25" stroke="#4A90D9" strokeWidth="2" />
            <line x1="50" y1="12" x2="50" y2="25" stroke="#4CAF50" strokeWidth="2" />
            <line x1="65" y1="15" x2="60" y2="25" stroke="#F5C842" strokeWidth="2" />
          </g>
        );
      default:
        return null;
    }
  };

  const getEyebrows = () => {
    if (expression === "concerned") {
      return (
        <>
          <path d="M32 42 L42 38" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 42 L58 38" stroke="#333" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <path d="M32 40 L42 40" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M58 40 L68 40" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  };

  const getMouth = () => {
    if (expression === "concerned") {
      return (
        <path
          d="M40 68 Q50 62 60 68"
          fill="none"
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    }
    if (expression === "celebration") {
      return (
        <path
          d="M38 65 Q50 78 62 65"
          fill="none"
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    }
    return (
      <path
        d="M42 66 L52 62 L58 66"
        fill="none"
        stroke="#333"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const containerVariants = animate
    ? {
        animate: {
          y: [0, -5, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      }
    : undefined;

  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      variants={containerVariants}
      animate="animate"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#f0f0f0"
          stroke="#d0d0d0"
          strokeWidth="3"
        />

        {/* Inner face */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="white"
          stroke="#333"
          strokeWidth="2.5"
        />

        {/* Accessory (hat, headset, etc.) */}
        {getAccessory()}

        {/* Eyebrows */}
        {getEyebrows()}

        {/* Eyes */}
        <circle cx="37" cy="50" r="4" fill="#333" />
        <circle cx="63" cy="50" r="4" fill="#333" />

        {/* Eye shine */}
        <circle cx="38" cy="49" r="1.5" fill="white" />
        <circle cx="64" cy="49" r="1.5" fill="white" />

        {/* Mouth/Nose */}
        {getMouth()}
      </svg>
    </motion.div>
  );
}
