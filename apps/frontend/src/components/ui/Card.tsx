import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "lg",
  hoverEffect = false,
  className = "",
  ...props
}) => {
  const paddingClasses = {
    none: "p-0",
    sm: "p-space-sm",
    md: "p-space-md",
    lg: "p-space-lg",
    xl: "p-space-xl",
  }[padding];

  const hoverClasses = hoverEffect
    ? "hover:shadow-[0_20px_40px_-10px_rgba(105,69,255,0.1)] transition-all duration-300"
    : "";

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] ${paddingClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
