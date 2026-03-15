import type { AdminDashboardSummary } from "@/interfaces/interfaces";

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

export function formatMetric(value: number) {
  return value.toLocaleString();
}

export function getDashboardMetrics(summary: AdminDashboardSummary): DashboardMetric[] {
  return [
    {
      key: "lessonsCreated",
      title: "Lessons Created",
      value: summary.lessonsCreated,
      icon: "menu_book",
      helpText: "Total lessons created",
      href: "/admin/lessons",
    },
    {
      key: "usersSignedUp",
      title: "Users Signed Up",
      value: summary.usersSignedUp,
      icon: "group_add",
      helpText: "New and existing user sign-ups",
      href: "/admin/contributors",
    },
    {
      key: "lessonsEnrolled",
      title: "Lessons Enrolled",
      value: summary.lessonsEnrolled,
      icon: "school",
      helpText: "Total lesson enrollments",
      href: "/admin/lessons",
    },
    {
      key: "newContributors",
      title: "New Contributors",
      value: summary.newContributors,
      icon: "military_tech",
      helpText: "Promoted active contributors in the last 30 days",
      href: "/admin/contributors",
    },
  ];
}
