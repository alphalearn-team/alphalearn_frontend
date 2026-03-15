import type { DateRangeSelection } from "./dashboardPanelTypes";

type AdminDashboardControlsProps = {
  activeRange: DateRangeSelection;
  customStartDate: string;
  customEndDate: string;
  isRefreshing: boolean;
  refreshError: string | null;
  onSelectPresetRange: (range: "7d" | "30d" | "90d") => void;
  onEnableCustomRange: () => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onApplyCustomRange: () => void;
  onExportCsv: () => void;
};

export default function AdminDashboardControls({
  activeRange,
  customStartDate,
  customEndDate,
  isRefreshing,
  refreshError,
  onSelectPresetRange,
  onEnableCustomRange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onApplyCustomRange,
  onExportCsv,
}: AdminDashboardControlsProps) {
  return (
    <section className="admin-card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Dashboard Controls</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Switch chart types, filter by date range, and export current dashboard data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onSelectPresetRange(range)}
              disabled={isRefreshing}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                activeRange === range
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}

          <button
            type="button"
            onClick={onEnableCustomRange}
            className={`px-3 py-2 rounded-lg border text-sm transition ${
              activeRange === "custom"
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            Custom
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            Export CSV
          </button>
        </div>
      </div>

      {activeRange === "custom" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            type="date"
            value={customStartDate}
            onChange={(event) => onCustomStartDateChange(event.target.value)}
            className="bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)]"
          />
          <input
            type="date"
            value={customEndDate}
            onChange={(event) => onCustomEndDateChange(event.target.value)}
            className="bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)]"
          />
          <button
            type="button"
            onClick={onApplyCustomRange}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-70"
          >
            Apply
          </button>
        </div>
      )}

      {(isRefreshing || refreshError) && (
        <div className="mt-4 text-sm">
          {isRefreshing && (
            <span className="text-[var(--color-text-secondary)]">Refreshing dashboard data...</span>
          )}
          {refreshError && <p className="text-rose-300">{refreshError}</p>}
        </div>
      )}
    </section>
  );
}
