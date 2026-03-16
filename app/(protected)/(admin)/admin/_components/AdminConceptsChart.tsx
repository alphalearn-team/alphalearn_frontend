"use client";

import { Bar, Line, Pie } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import type { AdminDashboardTopConcept } from "@/interfaces/interfaces";
import {
  CHART_COLORS,
  CHART_TYPES,
  cartesianChartOptions,
  pieChartOptions,
  type DashboardChartType,
} from "./chartConfig";

type AdminConceptsChartProps = {
  topConcepts: AdminDashboardTopConcept[];
  chartType: DashboardChartType;
  onChartTypeChange: (type: DashboardChartType) => void;
};

function buildConceptData(
  topConcepts: AdminDashboardTopConcept[],
): ChartData<"bar" | "line" | "pie"> {
  return {
    labels: topConcepts.map((c) => c.title),
    datasets: [
      {
        label: "Linked Lessons",
        data: topConcepts.map((c) => c.lessonCount),
        backgroundColor: CHART_COLORS.slice(0, Math.max(topConcepts.length, 1)),
        borderColor: "#22d3ee",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      },
    ],
  };
}

export default function AdminConceptsChart({
  topConcepts,
  chartType,
  onChartTypeChange,
}: AdminConceptsChartProps) {
  const data = buildConceptData(topConcepts);

  return (
    <section className="admin-card" aria-label="Top concepts chart">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Top Concepts Chart
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Distribution of lessons linked to top concepts.
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

      {topConcepts.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No concept data to visualize yet.
        </p>
      ) : (
        <div className="h-[300px] md:h-[340px]">
          {chartType === "pie" ? (
            <Pie data={data as ChartData<"pie">} options={pieChartOptions} />
          ) : chartType === "line" ? (
            <Line data={data as ChartData<"line">} options={cartesianChartOptions} />
          ) : (
            <Bar data={data as ChartData<"bar">} options={cartesianChartOptions} />
          )}
        </div>
      )}
    </section>
  );
}
