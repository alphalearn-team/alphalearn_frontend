import type { AdminDashboardSummary } from "@/interfaces/interfaces";
import type { DateRangeSelection } from "./dashboardPanelTypes";

export type DashboardMetricKey =
  | "lessonsCreated"
  | "usersSignedUp"
  | "lessonsEnrolled"
  | "newContributors";

export type DashboardMetric = {
  key: DashboardMetricKey;
  title: string;
  value: number;
  icon: string;
  helpText: string;
  href: string;
};

type DashboardMetricOptions = {
  activeRange?: DateRangeSelection;
};

function getMetricValueFromSummary(
  summary: AdminDashboardSummary,
  key: DashboardMetricKey,
): number {
  const trends = summary.trends ?? [];
  if (trends.length > 0) {
    return trends.reduce((total, point) => total + point[key], 0);
  }

  return summary[key];
}

function getRangeLabel(activeRange: DateRangeSelection | undefined): string {
  if (activeRange === "7d") return "last 7 days";
  if (activeRange === "30d") return "last 30 days";
  return "selected range";
}

export function formatMetric(value: number) {
  return value.toLocaleString();
}

export function getDashboardMetrics(
  summary: AdminDashboardSummary,
  options?: DashboardMetricOptions,
): DashboardMetric[] {
  const rangeLabel = getRangeLabel(options?.activeRange);

  return [
    {
      key: "lessonsCreated",
      title: "Lessons Created",
      value: getMetricValueFromSummary(summary, "lessonsCreated"),
      icon: "menu_book",
      helpText: "Total lessons created",
      href: "/admin/lessons",
    },
    {
      key: "usersSignedUp",
      title: "Users Signed Up",
      value: getMetricValueFromSummary(summary, "usersSignedUp"),
      icon: "group_add",
      helpText: "New and existing user sign-ups",
      href: "/admin/contributors",
    },
    {
      key: "lessonsEnrolled",
      title: "Lessons Enrolled",
      value: getMetricValueFromSummary(summary, "lessonsEnrolled"),
      icon: "school",
      helpText: "Total lesson enrollments",
      href: "/admin/lessons",
    },
    {
      key: "newContributors",
      title: "New Contributors",
      value: getMetricValueFromSummary(summary, "newContributors"),
      icon: "military_tech",
      helpText: `Promoted active contributors in the ${rangeLabel}`,
      href: "/admin/contributors",
    },
  ];
}
