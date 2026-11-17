import React from "react";

type BadgeType =
  | "priority-low"
  | "priority-medium"
  | "priority-high"
  | "task-todo"
  | "task-in_progress"
  | "task-done"
  | "risk-low"
  | "risk-medium"
  | "risk-high"
  | "risk-active"
  | "risk-monitoring"
  | "risk-resolved";

interface StatusBadgeProps {
  type: BadgeType;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  label,
  className = "",
}) => {
  let styles = "bg-surface-container text-on-surface";
  let defaultLabel = "";
  let dotColor = "";

  switch (type) {
    case "priority-low":
      styles = "bg-slate-100 text-slate-700";
      defaultLabel = "Past";
      dotColor = "bg-slate-400";
      break;
    case "priority-medium":
      styles = "bg-amber-50 text-amber-700";
      defaultLabel = "O‘rta";
      dotColor = "bg-amber-500";
      break;
    case "priority-high":
      styles = "bg-red-50 text-error";
      defaultLabel = "Yuqori";
      dotColor = "bg-error";
      break;

    case "task-todo":
      styles = "bg-surface-container text-secondary";
      defaultLabel = "Rejalashtirilgan";
      dotColor = "bg-secondary";
      break;
    case "task-in_progress":
      styles = "bg-amber-100 text-amber-800";
      defaultLabel = "Jarayonda";
      dotColor = "bg-amber-500";
      break;
    case "task-done":
      styles = "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant";
      defaultLabel = "Bajarilgan";
      dotColor = "bg-tertiary";
      break;

    case "risk-low":
      styles = "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      defaultLabel = "Past";
      dotColor = "bg-tertiary-fixed-dim";
      break;
    case "risk-medium":
      styles = "bg-secondary-fixed text-on-secondary-fixed-variant";
      defaultLabel = "O‘rta";
      dotColor = "bg-secondary";
      break;
    case "risk-high":
      styles = "bg-error-container text-error";
      defaultLabel = "Yuqori";
      dotColor = "bg-error";
      break;

    case "risk-active":
      styles = "bg-error-container/60 text-on-error-container";
      defaultLabel = "Faol";
      dotColor = "bg-error";
      break;
    case "risk-monitoring":
      styles = "bg-secondary-container/30 text-on-secondary-container";
      defaultLabel = "Nazoratda";
      dotColor = "bg-secondary";
      break;
    case "risk-resolved":
      styles = "bg-tertiary-fixed/30 text-tertiary";
      defaultLabel = "Bartaraf etilgan";
      dotColor = "bg-tertiary";
      break;
  }

  const displayText = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-label-sm text-label-sm font-semibold shadow-sm ${styles} ${className}`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{displayText}</span>
    </span>
  );
};
