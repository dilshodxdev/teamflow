import React, { useState } from "react";

const LOGO_URL = "/teamflow.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const heightClass = size === "sm" ? "h-8" : size === "lg" ? "h-14" : "h-10";
  const iconBoxSize =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10";
  const textSizeClass =
    size === "sm"
      ? "font-headline-md text-headline-md"
      : size === "lg"
        ? "font-display-md text-display-md"
        : "font-headline-lg text-headline-lg";

  return (
    <div className={`flex items-center gap-space-sm ${className}`}>
      {!imageError ? (
        showText ? (
          <img
            src={LOGO_URL}
            alt="TeamFlow Logo"
            onError={() => setImageError(true)}
            className={`${heightClass} w-auto object-contain select-none`}
          />
        ) : (
          <div
            className={`${iconBoxSize} overflow-hidden rounded-xl select-none flex-shrink-0 flex items-center justify-start`}
          >
            <img
              src={LOGO_URL}
              alt="TeamFlow"
              onError={() => setImageError(true)}
              className="h-full w-auto max-w-none object-cover object-left"
            />
          </div>
        )
      ) : (
        <>
          <div
            className={`${iconBoxSize} rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-sm font-bold text-xs flex-shrink-0`}
          >
            TF
          </div>
          {showText && (
            <span
              className={`${textSizeClass} tracking-tight text-on-surface font-bold select-none`}
            >
              TeamFlow
            </span>
          )}
        </>
      )}
    </div>
  );
};
