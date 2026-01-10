"use client";

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;            // 0 to 100
  size?: number;            // px
  strokeWidth?: number;     // px
  className?: string;
}

export function CircularProgress({
  value,
  size = 72,
  strokeWidth = 6,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className={cn("-rotate-90", className)}
    >
      {/* Background Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#2B2D31"
        strokeWidth={strokeWidth}
        fill="transparent"
      />

      {/* Progress Ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#5865F2"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-in-out"
      />
    </svg>
  );
}
