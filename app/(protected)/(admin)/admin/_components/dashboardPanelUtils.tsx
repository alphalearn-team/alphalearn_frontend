import type {
  AdminDashboardAlert,
  AdminDashboardSummary,
} from "@/interfaces/interfaces";
import type { DashboardMetric } from "./dashboardViewModel";
import type { DateRangeSelection } from "./dashboardPanelTypes";

export function getDeltaBadge(delta: number | undefined) {
  if (delta === undefined) {
    return null;
  }

  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  const icon = isNeutral ? "remove" : isPositive ? "trending_up" : "trending_down";
  const label = `${isPositive ? "+" : ""}${delta.toFixed(1)}%`;
  const classes = isNeutral
    ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]"
    : isPositive
      ? "bg-emerald-500/20 text-emerald-300"
      : "bg-rose-500/20 text-rose-300";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </span>
  );
}

export type ExportOptions = {
  range: DateRangeSelection;
  startDate?: string;
  endDate?: string;
  appliedRange?: string;
  windowStart?: string;
  windowEnd?: string;
  comparisonStart?: string;
  comparisonEnd?: string;
};

function getRangeLabel(
  range: DateRangeSelection,
  startDate?: string,
  endDate?: string,
): string {
  if (range === "7d") return "Last 7 days";
  if (range === "30d") return "Last 30 days";
  return startDate && endDate ? `${startDate} to ${endDate}` : "Custom range";
}

export function exportDashboardCsv(
  summary: AdminDashboardSummary,
  metrics: DashboardMetric[],
  options?: ExportOptions,
) {
  const today = new Date().toISOString().slice(0, 10);
  const rangeLabel = options
    ? getRangeLabel(options.range, options.startDate, options.endDate)
    : "All time";

  const lines: string[] = [];

  // File header
  lines.push("AlphaLearn Admin Dashboard");
  lines.push(`Exported,${today}`);
  lines.push(`Date Range,${rangeLabel}`);
  if (options?.appliedRange) {
    lines.push(`Applied Range,${options.appliedRange}`);
  }
  if (options?.windowStart && options?.windowEnd) {
    lines.push(`Current Window,${options.windowStart} to ${options.windowEnd}`);
  }
  if (options?.comparisonStart && options?.comparisonEnd) {
    lines.push(`Comparison Window,${options.comparisonStart} to ${options.comparisonEnd}`);
  }
  lines.push("");

  // Key metrics
  lines.push("=== KEY METRICS ===");
  lines.push("Metric,Count");
  metrics.forEach((m) => lines.push(`"${m.title}",${m.value}`));
  lines.push("");

  // Top concepts
  lines.push("=== TOP CONCEPTS (by lesson count) ===");
  lines.push("Concept Title,Lessons Linked");
  if (summary.topConcepts.length > 0) {
    summary.topConcepts.forEach((c) =>
      lines.push(`"${c.title}",${c.lessonCount}`),
    );
  } else {
    lines.push("No data,");
  }
  lines.push("");

  // Low-performing concepts
  const lowPerforming = summary.lowPerformingConcepts ?? [];
  lines.push("=== LOW-PERFORMING CONCEPTS (fewest lessons) ===");
  lines.push("Concept Title,Lessons Linked");
  if (lowPerforming.length > 0) {
    lowPerforming.forEach((c) => lines.push(`"${c.title}",${c.lessonCount}`));
  } else {
    lines.push("No data,");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `admin-dashboard-${today}.csv`;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function toDerivedAlerts(summary: AdminDashboardSummary): AdminDashboardAlert[] {
  const alerts = [...(summary.alerts ?? [])];

  if ((summary.pendingModerationCount ?? 0) > 0) {
    alerts.push({
      code: "PENDING_MODERATION",
      level: "WARNING",
      message: `${summary.pendingModerationCount} lesson submissions are pending moderation review.`,
    });
  }

  if (summary.topConcepts.length === 0) {
    alerts.push({
      code: "EMPTY_TOP_CONCEPTS",
      level: "INFO",
      message: "No top concepts available yet. Concept insights will appear once lessons are linked.",
    });
  }

  return alerts;
}
