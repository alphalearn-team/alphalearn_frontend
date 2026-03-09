"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * ADMIN COMPONENT - Breadcrumb Navigation
 * 
 * Auto-generates breadcrumbs from the current URL path.
 * Provides consistent navigation context across admin pages.
 */

interface BreadcrumbOverride {
  [segment: string]: string;
}

const labelOverrides: BreadcrumbOverride = {
  admin: "Dashboard",
  lessons: "Lessons",
  contributors: "Users",
  "contributor-applications": "Contributor Applications",
  concepts: "Concepts",
  add: "Add New",
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  
  // Extract segments after /admin
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  const relevantSegments = segments.slice(adminIndex);

  // Build breadcrumb items
  const crumbs = relevantSegments.map((segment, index) => {
    const path = "/" + segments.slice(0, adminIndex + index + 1).join("/");
    const label = labelOverrides[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === relevantSegments.length - 1;

    return { label, path, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
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
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
