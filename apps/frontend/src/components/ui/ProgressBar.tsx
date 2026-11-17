import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = "md",
  className = "",
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClass = {
    sm: "h-2",
    md: "h-2.5",
    lg: "h-3",
  }[size];

  return (
    <div className={`w-full flex items-center gap-space-sm ${className}`}>
      <div
        className={`flex-1 ${heightClass} rounded-full bg-surface-container overflow-hidden`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
          {clamped}%
        </span>
      )}
    </div>
  );
};
