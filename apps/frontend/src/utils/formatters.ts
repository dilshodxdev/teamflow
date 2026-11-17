/**
 * Helper to get 2 initials from a full name
 * e.g., "Zilola Rahimova" -> "ZR"
 */
export function getInitials(name: string): string {
  if (!name) return "TF";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Task priority in Uzbek
 */
export function getPriorityLabel(priority: "low" | "medium" | "high"): string {
  switch (priority) {
    case "low":
      return "Past";
    case "medium":
      return "O‘rta";
    case "high":
      return "Yuqori";
    default:
      return priority;
  }
}

/**
 * Task status in Uzbek
 */
export function getTaskStatusLabel(
  status: "todo" | "in_progress" | "done",
): string {
  switch (status) {
    case "todo":
      return "Rejalashtirilgan";
    case "in_progress":
      return "Jarayonda";
    case "done":
      return "Bajarilgan";
    default:
      return status;
  }
}

/**
 * Risk status in Uzbek
 */
export function getRiskStatusLabel(
  status: "active" | "monitoring" | "resolved",
): string {
  switch (status) {
    case "active":
      return "Faol";
    case "monitoring":
      return "Nazoratda";
    case "resolved":
      return "Bartaraf etilgan";
    default:
      return status;
  }
}

/**
 * Risk level in Uzbek
 */
export function getRiskLevelLabel(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "low":
      return "Past";
    case "medium":
      return "O‘rta";
    case "high":
      return "Yuqori";
    default:
      return level;
  }
}

/**
 * Calculate risk level from score
 * 1-5: low, 6-12: medium, 13-25: high
 */
export function calculateRiskLevel(score: number): "low" | "medium" | "high" {
  if (score <= 5) return "low";
  if (score <= 12) return "medium";
  return "high";
}
