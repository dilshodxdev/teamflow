import React, { forwardRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, id, className = "", ...props }, ref) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="font-label-md text-label-md text-on-surface font-semibold"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-xl appearance-none outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-sm cursor-pointer pr-10 transition-all ${
              error ? "ring-2 ring-error" : ""
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="material-symbols-outlined text-outline absolute right-3 pointer-events-none text-[18px]">
            unfold_more
          </span>
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

Select.displayName = "Select";
