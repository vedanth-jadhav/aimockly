"use client";

import React from "react";
import { MockyAvatar, MockyExpression } from "./MockyAvatar";
import { MockySpeechBubble } from "./MockySpeechBubble";

interface MockyWithMessageProps {
  message: string | React.ReactNode;
  expression?: MockyExpression;
  avatarSize?: "sm" | "md" | "lg" | "xl";
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function MockyWithMessage({
  message,
  expression = "default",
  avatarSize = "md",
  layout = "horizontal",
  className,
}: MockyWithMessageProps) {
  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <MockySpeechBubble position="center">{message}</MockySpeechBubble>
        <MockyAvatar expression={expression} size={avatarSize} />
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-4 ${className}`}>
      <MockyAvatar expression={expression} size={avatarSize} />
      <MockySpeechBubble position="left" className="flex-1">
        {message}
      </MockySpeechBubble>
    </div>
  );
}
