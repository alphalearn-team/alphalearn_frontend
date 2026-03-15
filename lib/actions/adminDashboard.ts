"use server";

import type { AdminDashboardSummary } from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

type DashboardSummaryResult =
  | { success: true; data: AdminDashboardSummary }
  | { success: false; message: string };

export async function fetchAdminDashboardSummaryAction(): Promise<DashboardSummaryResult> {
  try {
    const data = await apiFetch<AdminDashboardSummary>("/admin/dashboard/summary");

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
