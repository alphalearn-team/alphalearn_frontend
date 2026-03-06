import { Card } from "@mantine/core";
import type { FilterType } from "../useUserManagement";

interface StatsCardsProps {
  stats: {
    total: number;
    contributors: number;
    learners: number;
    activeContributors: number;
  };
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function StatsCards({ stats, filter, onFilterChange }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card 
        className={`admin-card admin-stat-card cursor-pointer transition-all duration-200 ${
          filter === "all" ? "ring-2 ring-[var(--color-primary)]" : "hover:scale-[1.02]"
        }`}
        onClick={() => onFilterChange("all")}
        style={{ "--stat-color": "var(--color-primary)" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-muted)] text-sm font-medium">
              Total Users
            </p>
            <p className="text-3xl font-bold text-[var(--color-text)] mt-2">
              {stats.total}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)]/10">
            <span className="material-symbols-outlined text-2xl text-[var(--color-primary)]">
              groups
            </span>
          </div>
        </div>
      </Card>

      <Card 
        className={`admin-card admin-stat-card cursor-pointer transition-all duration-200 ${
          filter === "contributors" ? "ring-2 ring-teal-500" : "hover:scale-[1.02]"
        }`}
        onClick={() => onFilterChange("contributors")}
        style={{ "--stat-color": "#14b8a6" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-muted)] text-sm font-medium">
              Contributors
            </p>
            <p className="text-3xl font-bold text-[var(--color-text)] mt-2">
              {stats.contributors}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {stats.activeContributors} active
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10">
            <span className="material-symbols-outlined text-2xl text-teal-500">
              person_check
            </span>
          </div>
        </div>
      </Card>

      <Card 
        className={`admin-card admin-stat-card cursor-pointer transition-all duration-200 ${
          filter === "learners" ? "ring-2 ring-cyan-500" : "hover:scale-[1.02]"
        }`}
        onClick={() => onFilterChange("learners")}
        style={{ "--stat-color": "#06b6d4" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-muted)] text-sm font-medium">
              Learners
            </p>
            <p className="text-3xl font-bold text-[var(--color-text)] mt-2">
              {stats.learners}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10">
            <span className="material-symbols-outlined text-2xl text-cyan-500">
              school
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
