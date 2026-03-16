export type AdminDashboardRangePreset = "7d" | "30d";

export type AdminDashboardSummaryQuery = {
  range?: AdminDashboardRangePreset;
  startDate?: string;
  endDate?: string;
};

export function buildAdminDashboardSummaryQuery(
  query: AdminDashboardSummaryQuery = {},
): string {
  const params = new URLSearchParams();

  if (query.range) {
    params.set("range", query.range);
  }

  if (query.startDate) {
    params.set("startDate", query.startDate);
  }

  if (query.endDate) {
    params.set("endDate", query.endDate);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
