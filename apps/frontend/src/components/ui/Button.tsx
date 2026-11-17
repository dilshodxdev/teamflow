import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "primary-container" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-label-lg rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-label-md gap-1.5",
    md: "px-space-md py-2.5 text-label-lg gap-2",
    lg: "px-space-xl py-3 text-headline-md gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-container text-on-primary shadow-[0_8px_18px_-4px_rgba(105,69,255,0.4)]",
    "primary-container":
      "bg-primary-container hover:bg-primary text-on-primary shadow-[0_8px_18px_-4px_rgba(105,69,255,0.38)]",
    secondary:
      "bg-surface-container-low hover:bg-surface-container text-on-surface shadow-sm",
    ghost:
      "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
    danger:
      "bg-error-container text-error hover:bg-error hover:text-white transition-colors",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          refresh
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
