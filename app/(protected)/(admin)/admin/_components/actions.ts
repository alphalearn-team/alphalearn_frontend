"use server";

import type { AdminDashboardSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";
import {
  buildAdminDashboardSummaryQuery,
  type AdminDashboardSummaryQuery,
} from "./utils";

type DashboardSummaryResult =
  | { success: true; data: AdminDashboardSummary }
  | { success: false; message: string };

export async function fetchAdminDashboardSummaryAction(): Promise<DashboardSummaryResult> {
  try {
    const data = await apiFetch<AdminDashboardSummary>("/admin/dashboard?view=OVERVIEW");

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard summary:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load admin dashboard summary",
    };
  }
}

export async function fetchAdminDashboardSummaryByQueryAction(
  query: AdminDashboardSummaryQuery,
): Promise<DashboardSummaryResult> {
  try {
    const queryString = buildAdminDashboardSummaryQuery(query);
    const normalizedQueryString = queryString ? `&${queryString.slice(1)}` : "";
    const data = await apiFetch<AdminDashboardSummary>(
      `/admin/dashboard?view=OVERVIEW${normalizedQueryString}`,
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard summary by query:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load admin dashboard summary",
    };
  }
}
