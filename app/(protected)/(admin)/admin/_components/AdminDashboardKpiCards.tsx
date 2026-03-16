"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AdminDashboardMetricDeltas } from "@/interfaces/interfaces";
import type { DashboardMetric } from "./dashboardViewModel";
import { formatMetric } from "./dashboardViewModel";
import { getDeltaBadge } from "./dashboardPanelUtils";

type RangeMeta = {
  appliedRange?: string;
  windowStart?: string;
  windowEnd?: string;
  comparisonStart?: string;
  comparisonEnd?: string;
};

type AdminDashboardKpiCardsProps = {
  metrics: DashboardMetric[];
  deltas?: AdminDashboardMetricDeltas;
  rangeMeta?: RangeMeta;
};

export default function AdminDashboardKpiCards({
  metrics,
  deltas,
  rangeMeta,
}: AdminDashboardKpiCardsProps) {
  const [openMetricKey, setOpenMetricKey] = useState<string | null>(null);
  const popoverRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!popoverRootRef.current) {
        return;
      }

      if (event.target instanceof Node && !popoverRootRef.current.contains(event.target)) {
        setOpenMetricKey(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMetricKey(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const appliedRangeText = (rangeMeta?.appliedRange ?? "selected range").toUpperCase();
  const currentWindowText =
    rangeMeta?.windowStart && rangeMeta?.windowEnd
      ? `${rangeMeta.windowStart} to ${rangeMeta.windowEnd}`
      : "current selected window";
  const comparisonWindowText =
    rangeMeta?.comparisonStart && rangeMeta?.comparisonEnd
      ? `${rangeMeta.comparisonStart} to ${rangeMeta.comparisonEnd}`
      : "previous equivalent window";
  const tooltipText = `Current total for ${appliedRangeText}: ${currentWindowText}. Delta compares against ${comparisonWindowText}. Formula: (current - previous) / previous × 100.`;

  return (
    <section ref={popoverRootRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((card) => (
        <article key={card.title} className="admin-card">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase leading-snug max-w-[70%]">
              {card.title}
            </h2>
            <div className="flex items-center gap-2 relative">
              <span className="material-symbols-outlined text-[var(--color-primary)]">
                {card.icon}
              </span>
              <button
                type="button"
                onClick={() =>
                  setOpenMetricKey((prev) => (prev === card.key ? null : card.key))
                }
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/60"
                aria-expanded={openMetricKey === card.key}
                aria-haspopup="dialog"
                aria-label={`Show calculation details for ${card.title}`}
              >
                <span className="material-symbols-outlined text-base">info</span>
              </button>

              {openMetricKey === card.key && (
                <div
                  role="dialog"
                  aria-label={`${card.title} calculation details`}
                  className="absolute right-0 top-8 z-30 w-[min(20rem,calc(100vw-2.5rem))] md:w-80 rounded-xl border border-[var(--color-primary)]/35 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))_0%,var(--color-surface)_100%)] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                >
                  <p className="text-xs font-semibold text-[var(--color-text)] mb-2">
                    How this card is calculated
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Current total for <span className="text-[var(--color-text)]">{appliedRangeText}</span>: {currentWindowText}.
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1">
                    Delta compares against {comparisonWindowText}.
                  </p>
                  <p className="text-xs text-[var(--color-accent)] font-medium mt-2">
                    Formula: (current - previous) / previous x 100
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenMetricKey(null)}
                    className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
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
