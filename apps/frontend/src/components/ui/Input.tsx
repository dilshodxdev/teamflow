import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, id, className = "", ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-label-md text-label-md text-on-surface font-semibold"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none transition-colors">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md rounded-xl ${
              icon ? "pl-11" : "px-space-md"
            } ${rightElement ? "pr-11" : "pr-space-md"} py-2.5 outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-sm transition-all ${
              error ? "ring-2 ring-error" : ""
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="font-label-sm text-label-sm text-error mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
