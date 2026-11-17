import React, { useState } from "react";
import { getInitials } from "../../utils/formatters";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
  colorScheme?:
    "primary" | "secondary" | "tertiary" | "amber" | "sky" | "neutral";
}

const COLOR_CLASSES = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  amber: "bg-amber-100 text-amber-900",
  sky: "bg-sky-100 text-sky-800",
  neutral: "bg-surface-container-high text-on-surface",
};

const SIZE_CLASSES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-8 h-8 text-[12px]",
  lg: "w-10 h-10 text-[14px]",
  xl: "w-14 h-14 text-[18px]",
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  className = "",
  ring = false,
  colorScheme = "primary",
}) => {
  const [imageError, setImageError] = useState(!src);
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorClass = COLOR_CLASSES[colorScheme] || COLOR_CLASSES.primary;
  const ringClass = ring ? "ring-2 ring-surface-container-lowest" : "";

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className={`inline-block ${sizeClass} rounded-full object-cover shrink-0 ${ringClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 select-none ${sizeClass} ${colorClass} ${ringClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
