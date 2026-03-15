import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Legend,
  Tooltip,
  Filler,
);

export type DashboardChartType = "bar" | "line" | "pie";

export const CHART_TYPES: DashboardChartType[] = ["bar", "line", "pie"];

export const CHART_COLORS = [
  "#3b82f6",
  "#22d3ee",
  "#14b8a6",
  "#a78bfa",
  "#f59e0b",
  "#ef4444",
];

export const cartesianChartOptions: ChartOptions<"bar" | "line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#cbd5e1" } },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148, 163, 184, 0.15)" },
    },
    y: {
      beginAtZero: true,
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148, 163, 184, 0.15)" },
    },
  },
};

export const pieChartOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#cbd5e1" } },
  },
};
