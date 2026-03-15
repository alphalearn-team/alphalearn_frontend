import type { AdminDashboardSummary } from "@/interfaces/interfaces";
import AdminEmptyState from "@/components/admin/EmptyState";

type AdminDashboardSummaryPanelProps = {
  summary: AdminDashboardSummary | null;
  error: string | null;
};

function formatMetric(value: number) {
  return value.toLocaleString();
}

export default function AdminDashboardSummaryPanel({
  summary,
  error,
}: AdminDashboardSummaryPanelProps) {
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

  if (!summary) {
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

  const kpiCards = [
    {
      title: "Lessons Created",
      value: summary.lessonsCreated,
      icon: "menu_book",
      helpText: "Total lessons created",
    },
    {
      title: "Users Signed Up",
      value: summary.usersSignedUp,
      icon: "group_add",
      helpText: "New and existing user sign-ups",
    },
    {
      title: "Lessons Enrolled",
      value: summary.lessonsEnrolled,
      icon: "school",
      helpText: "Total lesson enrollments",
    },
    {
      title: "New Contributors",
      value: summary.newContributors,
      icon: "military_tech",
      helpText: "Promoted active contributors in the last 30 days",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <article key={card.title} className="admin-card">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase">
                {card.title}
              </h2>
              <span className="material-symbols-outlined text-[var(--color-primary)]">
                {card.icon}
              </span>
            </div>

            <p className="text-4xl font-bold text-[var(--color-text)] mb-2">
              {formatMetric(card.value)}
            </p>

            <p className="text-xs text-[var(--color-text-muted)]">{card.helpText}</p>
          </article>
        ))}
      </section>

      <section className="admin-card">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Top Concepts</h2>
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
            Sorted by linked lessons
          </span>
        </div>

        {summary.topConcepts.length === 0 ? (
          <AdminEmptyState
            icon="concepts"
            title="No top concepts yet"
            description="Top concepts will appear once lessons are linked to concepts."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Concept ID</th>
                  <th>Linked Lessons</th>
                </tr>
              </thead>
              <tbody>
                {summary.topConcepts.map((concept) => (
                  <tr key={concept.conceptPublicId}>
                    <td className="font-medium">{concept.title}</td>
                    <td className="text-xs text-[var(--color-text-muted)]">
                      {concept.conceptPublicId}
                    </td>
                    <td>{formatMetric(concept.lessonCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
