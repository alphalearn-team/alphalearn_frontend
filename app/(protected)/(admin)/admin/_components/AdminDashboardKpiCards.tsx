import Link from "next/link";
import type { AdminDashboardMetricDeltas } from "@/interfaces/interfaces";
import type { DashboardMetric } from "./dashboardViewModel";
import { formatMetric } from "./dashboardViewModel";
import { getDeltaBadge } from "./dashboardPanelUtils";

type AdminDashboardKpiCardsProps = {
  metrics: DashboardMetric[];
  deltas?: AdminDashboardMetricDeltas;
};

export default function AdminDashboardKpiCards({
  metrics,
  deltas,
}: AdminDashboardKpiCardsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((card) => (
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

          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs text-[var(--color-text-muted)]">{card.helpText}</p>
            {getDeltaBadge(deltas?.[card.key])}
          </div>

          <Link
            href={card.href}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)]"
          >
            Open related page
          </Link>
        </article>
      ))}
    </section>
  );
}
