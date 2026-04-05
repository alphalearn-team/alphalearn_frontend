interface Stat {
  icon: string;
  value: number;
  label: string;
}

interface ContributorStatsRowProps {
  totalLessons: number;
  totalEnrolled: number;
  totalCompleted: number;
}

export default function ContributorStatsRow({
  totalLessons,
  totalEnrolled,
  totalCompleted,
}: ContributorStatsRowProps) {
  const stats: Stat[] = [
    { icon: "auto_stories", value: totalLessons, label: "Lessons Created" },
    { icon: "group",        value: totalEnrolled, label: "Total Enrollments" },
    { icon: "check_circle", value: totalCompleted, label: "Total Completions" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl p-5 flex items-center gap-4"
          style={{
            background: "var(--color-surface)",
            borderLeft: "3px solid var(--color-primary)",
            boxShadow: "0 0 0 1px var(--color-border)",
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--color-primary)", fontSize: "20px" }}
            >
              {stat.icon}
            </span>
          </div>

          <div>
            <p
              className="text-3xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              {stat.value}
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.15em] mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
