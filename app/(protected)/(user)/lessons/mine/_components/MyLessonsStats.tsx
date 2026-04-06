"use client";

import { Pie, Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import type { LessonSummary } from "@/interfaces/interfaces";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

interface MyLessonsStatsProps {
  totalLessons: number;
  totalEnrolled: number;
  totalCompleted: number;
  lessons: LessonSummary[];
}

const cardStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  padding: "1.25rem",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  marginBottom: "1rem",
};

export default function MyLessonsStats({
  totalLessons,
  totalEnrolled,
  totalCompleted,
  lessons,
}: MyLessonsStatsProps) {
  const completionRate =
    totalEnrolled === 0 ? 0 : Math.round((totalCompleted / totalEnrolled) * 100);
  const incomplete = Math.max(0, totalEnrolled - totalCompleted);

  // ── Donut ────────────────────────────────────────────────
  const donutBg =
    totalEnrolled === 0
      ? ["rgba(255,255,255,0.05)"]
      : ["#10b981", "rgba(46,255,180,0.12)"];

  const donutData = {
    labels: ["Completed", "Incomplete"],
    datasets: [
      {
        data: totalEnrolled === 0 ? [0, 1] : [totalCompleted, incomplete],
        backgroundColor: donutBg,
        hoverBackgroundColor: donutBg,
        borderColor:
          totalEnrolled === 0
            ? ["rgba(255,255,255,0.08)"]
            : ["#10b981", "rgba(46,255,180,0.2)"],
        borderWidth: 1,
        hoverOffset: 0,
      },
    ],
  };

  const donutOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#ffffff",
          font: { size: 11 },
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        enabled: totalEnrolled > 0,
        backgroundColor: "#333333",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  // ── Horizontal Bar ───────────────────────────────────────
  const sorted = [...lessons]
    .sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
    .slice(0, 6);

  const truncate = (s: string, n: number) =>
    s.length > n ? s.slice(0, n) + "…" : s;

  const barData = {
    labels: sorted.map((l) => truncate(l.title, 24)),
    datasets: [
      {
        label: "Enrolled",
        data: sorted.map((l) => l.enrollmentCount ?? 0),
        backgroundColor: "rgba(46,255,180,0.2)",
        borderColor: "#2effb4",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#333333",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#ffffff", precision: 0 },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        ticks: { color: "#ffffff", font: { size: 11 } },
        grid: { display: false },
        border: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  const CHART_HEIGHT = 220;

  return (
    <div className="flex flex-col gap-4">

      {/* Compact summary row */}
      <div className="flex flex-wrap gap-6">
        {[
          { icon: "auto_stories", value: totalLessons,   label: "Lessons" },
          { icon: "group",        value: totalEnrolled,  label: "Enrolled" },
          { icon: "check_circle", value: totalCompleted, label: "Completed" },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            {i > 0 && (
              <div className="h-7 w-px mx-2" style={{ background: "var(--color-border)" }} />
            )}
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--color-primary)", fontSize: "16px" }}
            >
              {s.icon}
            </span>
            <span
              className="text-xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              {s.value}
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-4">

        {/* Pie */}
        <div style={cardStyle} className="flex flex-col gap-3">
          <p style={sectionLabel}>Completion Rate</p>
          <div style={{ height: CHART_HEIGHT }}>
            <Pie data={donutData} options={donutOptions} />
          </div>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--color-text-muted)" }}>
            {totalEnrolled === 0 ? "No data" : `${completionRate}% · ${totalCompleted} / ${totalEnrolled} learners`}
          </p>
        </div>

        {/* Horizontal bar */}
        <div style={cardStyle}>
          <p style={sectionLabel}> Top Enrollments</p>
          {sorted.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No enrollment data yet.
            </p>
          ) : (
            <div style={{ height: CHART_HEIGHT }}>
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
