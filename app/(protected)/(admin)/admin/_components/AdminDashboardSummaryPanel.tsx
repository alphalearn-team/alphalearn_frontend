"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type {
  AdminDashboardSummary,
} from "@/interfaces/interfaces";
import AdminEmptyState from "@/components/admin/EmptyState";
import { fetchAdminDashboardSummaryByQueryAction } from "./actions";
import {
  getDashboardMetrics,
} from "./dashboardViewModel";
import type { DashboardChartType } from "./AdminDashboardCharts";
import type { DateRangeSelection } from "./dashboardPanelTypes";
import { exportDashboardCsv, toDerivedAlerts } from "./dashboardPanelUtils";
import AdminDashboardControls from "./AdminDashboardControls";
import AdminDashboardKpiCards from "./AdminDashboardKpiCards";
import AdminDashboardInsights from "./AdminDashboardInsights";

const LazyAdminDashboardCharts = dynamic(() => import("./AdminDashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section className="admin-card h-[340px] animate-pulse" />
      <section className="admin-card h-[340px] animate-pulse" />
    </div>
  ),
});

type AdminDashboardSummaryPanelProps = {
  summary: AdminDashboardSummary | null;
  error: string | null;
};

export default function AdminDashboardSummaryPanel({
  summary,
  error,
}: AdminDashboardSummaryPanelProps) {
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary | null>(summary);
  const [activeRange, setActiveRange] = useState<DateRangeSelection>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [metricChartType, setMetricChartType] = useState<DashboardChartType>("bar");
  const [conceptsChartType, setConceptsChartType] = useState<DashboardChartType>("pie");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const metrics = useMemo(
    () => (dashboardSummary ? getDashboardMetrics(dashboardSummary, { activeRange }) : []),
    [activeRange, dashboardSummary],
  );
  const derivedAlerts = useMemo(
    () => (dashboardSummary ? toDerivedAlerts(dashboardSummary) : []),
    [dashboardSummary],
  );

  if (error) {
    return (
      <div className="admin-card">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          Unable to load dashboard summary
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
      </div>
    );
  }

  if (!dashboardSummary) {
    return (
      <div className="admin-card">
        <AdminEmptyState
          icon="generic"
          title="No dashboard data available"
          description="Dashboard summary data is currently unavailable."
        />
      </div>
    );
  }

  const loadSummary = async (range: Exclude<DateRangeSelection, "custom">) => {
    try {
      setIsRefreshing(true);
      setRefreshError(null);

      const nextResult = await fetchAdminDashboardSummaryByQueryAction({ range });
      if (!nextResult.success) {
        setRefreshError(nextResult.message);
        return;
      }

      const nextSummary = nextResult.data;
      setDashboardSummary(nextSummary);
      setActiveRange(range);
    } catch (fetchError) {
      setRefreshError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to refresh dashboard summary",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadCustomSummary = async () => {
    try {
      if (!customStartDate || !customEndDate) {
        setRefreshError("Please select both custom start and end dates.");
        return;
      }

      setIsRefreshing(true);
      setRefreshError(null);

      const nextResult = await fetchAdminDashboardSummaryByQueryAction({
        startDate: customStartDate,
        endDate: customEndDate,
      });

      if (!nextResult.success) {
        setRefreshError(nextResult.message);
        return;
      }

      setDashboardSummary(nextResult.data);
      setActiveRange("custom");
    } catch (fetchError) {
      setRefreshError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to refresh dashboard summary",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const topConcepts = dashboardSummary.topConcepts;
  const lowPerformingConcepts = dashboardSummary.lowPerformingConcepts ?? [];
  const appliedRangeLabel = dashboardSummary.appliedRange ?? (activeRange === "custom" ? "custom" : activeRange);
  const currentWindowLabel =
    dashboardSummary.startDate && dashboardSummary.endDate
      ? `${dashboardSummary.startDate} to ${dashboardSummary.endDate}`
      : activeRange === "custom" && customStartDate && customEndDate
        ? `${customStartDate} to ${customEndDate}`
        : activeRange === "7d"
          ? "Last 7 days"
          : "Last 30 days";
  const comparisonWindowLabel =
    dashboardSummary.comparisonStartDate && dashboardSummary.comparisonEndDate
      ? `${dashboardSummary.comparisonStartDate} to ${dashboardSummary.comparisonEndDate}`
      : "Previous equivalent window";

  return (
    <div className="space-y-8">
      <AdminDashboardControls
        activeRange={activeRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        isRefreshing={isRefreshing}
        refreshError={refreshError}
        onSelectPresetRange={loadSummary}
        onEnableCustomRange={() => setActiveRange("custom")}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
        onApplyCustomRange={loadCustomSummary}
        onExportCsv={() => exportDashboardCsv(dashboardSummary, metrics, {
          range: activeRange,
          startDate: customStartDate,
          endDate: customEndDate,
          appliedRange: appliedRangeLabel,
          windowStart: dashboardSummary.startDate,
          windowEnd: dashboardSummary.endDate,
          comparisonStart: dashboardSummary.comparisonStartDate,
          comparisonEnd: dashboardSummary.comparisonEndDate,
        })}
      />

      {/* Range metadata header */}
      <div className="admin-card mb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--color-text-secondary)]">Current window:</span>
            <span className="mt-1 block text-sm text-[var(--color-text)] break-words">
              {currentWindowLabel} ({appliedRangeLabel.toUpperCase()})
            </span>
          </div>
          <div className="min-w-0">
            <span className="block text-xs text-[var(--color-text-muted)]">Comparison window:</span>
            <span className="mt-1 block text-xs text-[var(--color-text-secondary)] break-words">
              {comparisonWindowLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="relative space-y-8">
        {isRefreshing && (
          <div className="absolute inset-0 z-10 bg-[var(--color-bg)]/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            <div className="flex items-center gap-3 bg-[var(--color-surface)] px-5 py-3 rounded-xl border border-[var(--color-border)] shadow-lg">
              <div className="h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--color-text-secondary)]">Refreshing dashboard...</span>
            </div>
          </div>
        )}

        <AdminDashboardKpiCards metrics={metrics} deltas={dashboardSummary.deltas} rangeMeta={{
          appliedRange: appliedRangeLabel,
          windowStart: dashboardSummary.startDate ?? customStartDate,
          windowEnd: dashboardSummary.endDate ?? customEndDate,
          comparisonStart: dashboardSummary.comparisonStartDate,
          comparisonEnd: dashboardSummary.comparisonEndDate,
        }} />

        <LazyAdminDashboardCharts
          metrics={metrics}
          topConcepts={topConcepts}
          trends={dashboardSummary.trends}
          metricChartType={metricChartType}
          conceptsChartType={conceptsChartType}
          onMetricChartTypeChange={setMetricChartType}
          onConceptsChartTypeChange={setConceptsChartType}
        />

        <AdminDashboardInsights
          topConcepts={topConcepts}
          lowPerformingConcepts={lowPerformingConcepts}
          alerts={derivedAlerts}
        />
      </div>
    </div>
  );
}
