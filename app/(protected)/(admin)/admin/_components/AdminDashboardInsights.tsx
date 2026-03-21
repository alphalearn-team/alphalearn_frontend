import Link from "next/link";
import type {
  AdminDashboardAlert,
  AdminDashboardTopConcept,
} from "@/interfaces/interfaces";
import AdminEmptyState from "@/app/(protected)/(admin)/admin/_components/EmptyState";
import { formatMetric } from "./dashboardViewModel";

type AdminDashboardInsightsProps = {
  topConcepts: AdminDashboardTopConcept[];
  lowPerformingConcepts: AdminDashboardTopConcept[];
  alerts: AdminDashboardAlert[];
};

export default function AdminDashboardInsights({
  topConcepts,
  lowPerformingConcepts,
  alerts,
}: AdminDashboardInsightsProps) {
  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Top Concepts</h2>
            <Link
              href="/admin/concepts"
              className="text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)]"
            >
              Manage concepts
            </Link>
          </div>

          {topConcepts.length === 0 ? (
            <AdminEmptyState
              icon="concepts"
              title="No top concepts yet"
              description="Top concepts will appear once lessons are linked to concepts."
            />
          ) : (
            <ul className="space-y-3">
              {topConcepts.map((concept) => (
                <li
                  key={concept.conceptPublicId}
                  className="flex items-center justify-between gap-3 border border-[var(--color-border)] rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-medium text-[var(--color-text)] truncate">
                    {concept.title}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {formatMetric(concept.lessonCount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Low-Performing Concepts</h2>
            {lowPerformingConcepts.length > 0 && (
              <Link
                href="/admin/concepts"
                className="text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)]"
              >
                Manage concepts
              </Link>
            )}
          </div>

          {lowPerformingConcepts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No low-performing concepts data from the current summary. Ask the backend to return a
              <code className="mx-1 text-xs bg-[var(--color-surface-elevated)] px-1 py-0.5 rounded">lowPerformingConcepts</code>
              array to unlock this panel.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowPerformingConcepts.map((concept) => (
                <li key={concept.conceptPublicId}>
                  <Link
                    href={`/admin/concepts/${concept.conceptPublicId}`}
                    className="flex items-center justify-between gap-3 border border-[var(--color-border)] rounded-lg px-3 py-2 hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-elevated)] transition"
                  >
                    <span className="text-sm font-medium text-[var(--color-text)] truncate">
                      {concept.title}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)] shrink-0">
                      {formatMetric(concept.lessonCount)} lessons
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="admin-card">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Alerts</h2>
          <Link
            href="/admin/lessons"
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)]"
          >
            Open moderation queue
          </Link>
        </div>

        {alerts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No active alerts at the moment.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li
                key={`${alert.code}-${alert.message}`}
                className="border border-[var(--color-border)] rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      alert.level === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300"
                        : alert.level === "WARNING"
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-blue-500/20 text-blue-200"
                    }`}
                  >
                    {alert.level}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{alert.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
