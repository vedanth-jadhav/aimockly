"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";

interface ScanProgressProps {
  isScanning: boolean;
  onComplete?: () => void;
}

const scanningMessages = [
  { text: "Connecting to your project...", icon: "🔌" },
  { text: "Looking for tables...", icon: "🔍" },
  { text: "Checking RLS policies...", icon: "🛡️" },
  { text: "Analyzing access patterns...", icon: "📊" },
  { text: "Looking for sensitive data...", icon: "🔐" },
  { text: "Almost done...", icon: "✨" },
];

export function ScanProgress({ isScanning }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < scanningMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return prev + Math.random() * 5;
        }
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-block mb-8"
        >
          <MockyAvatar expression="support" size="xl" animate={false} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <span className="text-4xl mb-4 block">
              {scanningMessages[currentStep].icon}
            </span>
            <p className="text-xl font-medium text-gray-800">
              {scanningMessages[currentStep].text}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {Math.round(progress)}% complete
        </p>

        <div className="mt-8 flex justify-center gap-2">
          {scanningMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentStep ? "bg-blue-500" : "bg-gray-300"
              }`}
              animate={
                index === currentStep
                  ? { scale: [1, 1.3, 1] }
                  : {}
              }
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
