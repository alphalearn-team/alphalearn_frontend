"use client";

import type {
  AdminDashboardTopConcept,
  AdminDashboardTrendPoint,
} from "@/interfaces/interfaces";
import type { DashboardMetric } from "./dashboardViewModel";
import type { DashboardChartType } from "./chartConfig";
import AdminMetricsChart from "./AdminMetricsChart";
import AdminConceptsChart from "./AdminConceptsChart";

export type { DashboardChartType };

type AdminDashboardChartsProps = {
  metrics: DashboardMetric[];
  topConcepts: AdminDashboardTopConcept[];
  trends?: AdminDashboardTrendPoint[];
  metricChartType: DashboardChartType;
  conceptsChartType: DashboardChartType;
  onMetricChartTypeChange: (type: DashboardChartType) => void;
  onConceptsChartTypeChange: (type: DashboardChartType) => void;
};

export default function AdminDashboardCharts({
  metrics,
  topConcepts,
  trends,
  metricChartType,
  conceptsChartType,
  onMetricChartTypeChange,
  onConceptsChartTypeChange,
}: AdminDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AdminMetricsChart
        metrics={metrics}
        trends={trends}
        chartType={metricChartType}
        onChartTypeChange={onMetricChartTypeChange}
      />
      <AdminConceptsChart
        topConcepts={topConcepts}
        chartType={conceptsChartType}
        onChartTypeChange={onConceptsChartTypeChange}
      />
    </div>
  );
}
