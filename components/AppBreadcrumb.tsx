"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppBreadcrumbProps {
  /** Overrides for URL segments → display labels */
  labelOverrides?: Record<string, string>;
  /** Path prefix to strip before building crumbs (e.g. "admin") */
  rootSegment?: string;
}

const defaultLabelOverrides: Record<string, string> = {
  // User routes
  lessons: "Lessons",
  concepts: "Concepts",
  profile: "Profile",
  "weekly-quest": "Weekly Quest",
  mine: "My Lessons",
  create: "Create Lesson",
  edit: "Edit",
  "contributor-application": "Contributor Access",
  // Admin routes
  admin: "Dashboard",
  contributors: "Users",
  "contributor-applications": "Contributor Applications",
  "weekly-quests": "Weekly Quests",
  add: "Add New",
};

function formatSegment(segment: string, overrides: Record<string, string>) {
  if (overrides[segment]) return overrides[segment];

  // Treat long alphanumeric IDs as "Detail"
  if (/^[a-zA-Z0-9_-]{8,}$/.test(segment)) return "Detail";

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AppBreadcrumb({
  labelOverrides = {},
  rootSegment,
}: AppBreadcrumbProps = {}) {
  const pathname = usePathname();
  const allSegments = pathname.split("/").filter(Boolean);

  // If a rootSegment is provided, start crumbs from that segment
  const startIndex = rootSegment
    ? allSegments.indexOf(rootSegment)
    : 0;

  if (startIndex < 0) return null;

  const relevantSegments = allSegments.slice(startIndex);
  if (relevantSegments.length <= 1) return null;

  const mergedOverrides = { ...defaultLabelOverrides, ...labelOverrides };

  const crumbs = relevantSegments.map((segment, index) => {
    const path = "/" + allSegments.slice(0, startIndex + index + 1).join("/");
    const isLast = index === relevantSegments.length - 1;

    return {
      path,
      isLast,
      label: formatSegment(segment, mergedOverrides),
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="px-4 py-4 lg:px-8 border-b">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {crumbs.map((crumb, i) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {i > 0 && (
                <span className="material-symbols-outlined text-[var(--color-text-muted)] text-base">
                  chevron_right
                </span>
              )}

              {crumb.isLast ? (
                <span className="text-[var(--color-text)] font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
