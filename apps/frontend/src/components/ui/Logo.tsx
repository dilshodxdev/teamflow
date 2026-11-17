import React, { useState } from "react";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/ALJJyrD-uXYbTRfirP8ZyhmkdRK31Z9Vn2xKcjiNFy7WZglPoC2RDEqOd5azxr6QrIeWKdKGwOHP3LHtakTVW5rwPWV1xO-LrXbbd81eU8LOO8UAPJNlgC1Ztw2X0frQCylMH6X7dlZp59c2JV_YvbNkIXQ3VvYB3qlckeCgKvBHLtfl61noj2ulKYc6dzVSfuvZ6u-dnIrfKfisEAEoWqM7FuE8z7YhJjNTQByhiNDyP7ta";

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

  const imgSizeClass =
    size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSizeClass =
    size === "sm"
      ? "font-headline-md text-headline-md"
      : size === "lg"
        ? "font-display-md text-display-md"
        : "font-headline-lg text-headline-lg";

  return (
    <div className={`flex items-center gap-space-sm ${className}`}>
      {!imageError ? (
        <img
          src={LOGO_URL}
          alt="TeamFlow Logo"
          onError={() => setImageError(true)}
          className={`${imgSizeClass} object-contain rounded-xl shadow-sm`}
        />
      ) : (
        <div
          className={`${imgSizeClass} rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-sm font-bold text-xs`}
        >
          TF
        </div>
      )}
      {showText && (
        <span
          className={`${textSizeClass} tracking-tight text-on-surface font-bold select-none`}
        >
          TeamFlow
        </span>
      )}
    </div>
  );
};
