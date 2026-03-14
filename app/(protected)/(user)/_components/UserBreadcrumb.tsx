"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labelOverrides: Record<string, string> = {
  lessons: "Lessons",
  concepts: "Concepts",
  profile: "Profile",
  "weekly-quest": "Weekly Quest",
  mine: "My Lessons",
  create: "Create Lesson",
  edit: "Edit",
  "contributor-application": "Contributor Access",
};

function formatSegment(segment: string) {
  if (labelOverrides[segment]) return labelOverrides[segment];

  if (/^[a-zA-Z0-9_-]{8,}$/.test(segment)) return "Detail";

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function UserBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    return {
      path,
      isLast,
      label: formatSegment(segment),
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
