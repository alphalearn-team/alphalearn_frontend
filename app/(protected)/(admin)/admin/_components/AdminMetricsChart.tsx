"use client";

import { Bar, Line, Pie } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import type { AdminDashboardTrendPoint } from "@/interfaces/interfaces";
import type { DashboardMetric } from "./dashboardViewModel";
import {
  CHART_COLORS,
  CHART_TYPES,
  cartesianChartOptions,
  pieChartOptions,
  type DashboardChartType,
} from "./chartConfig";

type AdminMetricsChartProps = {
  metrics: DashboardMetric[];
  trends?: AdminDashboardTrendPoint[];
  chartType: DashboardChartType;
  onChartTypeChange: (type: DashboardChartType) => void;
};

function buildMetricCategoryData(
  metrics: DashboardMetric[],
): ChartData<"bar" | "line" | "pie"> {
  return {
    labels: metrics.map((m) => m.title),
    datasets: [
      {
        label: "Count",
        data: metrics.map((m) => m.value),
        backgroundColor: CHART_COLORS.slice(0, metrics.length),
        borderColor: "#3b82f6",
        borderWidth: 2,
        fill: false,
        tension: 0.25,
      },
    ],
  };
}

function buildMetricTrendData(
  trends: AdminDashboardTrendPoint[],
): ChartData<"line"> {
  return {
    labels: trends.map((t) => t.label),
    datasets: [
      {
        label: "Lessons Created",
        data: trends.map((t) => t.lessonsCreated),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.22)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Users Signed Up",
        data: trends.map((t) => t.usersSignedUp),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.14)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Lessons Enrolled",
        data: trends.map((t) => t.lessonsEnrolled),
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.14)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "New Contributors",
        data: trends.map((t) => t.newContributors),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.14)",
        fill: false,
        tension: 0.3,
      },
    ],
  };
}

export default function AdminMetricsChart({
  metrics,
  trends,
  chartType,
  onChartTypeChange,
}: AdminMetricsChartProps) {
  const data =
    chartType === "line" && trends && trends.length > 0
      ? buildMetricTrendData(trends)
      : buildMetricCategoryData(metrics);

  return (
    <section className="admin-card" aria-label="Metrics chart">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Metrics Chart
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {chartType === "line" && (!trends || trends.length === 0)
              ? "Line chart uses summary values — trend points available once backend sends them."
              : "Comparative view of key admin metrics."}
          </p>
        </div>

        <label className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-[var(--color-text-secondary)]">Chart type</span>
          <select
            value={chartType}
            onChange={(e) => onChartTypeChange(e.target.value as DashboardChartType)}
            className="bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[var(--color-text)] text-xs"
          >
            {CHART_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="h-[300px] md:h-[340px]">
        {chartType === "pie" ? (
          <Pie data={data as ChartData<"pie">} options={pieChartOptions} />
        ) : chartType === "line" ? (
          <Line data={data as ChartData<"line">} options={cartesianChartOptions} />
        ) : (
          <Bar data={data as ChartData<"bar">} options={cartesianChartOptions} />
        )}
      </div>
    </section>
  );
}
