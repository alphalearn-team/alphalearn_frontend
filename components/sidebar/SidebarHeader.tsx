import Link from "next/link";
import NotificationBell from "@/components/notifications/NotificationBell";

interface SidebarHeaderProps {
  brandHref: string;
  brandIcon: string;
  brandTitle: string;
  brandSubtitle?: string;
  onBrandClick: () => void;
}

export default function SidebarHeader({
  brandHref,
  brandIcon,
  brandTitle,
  brandSubtitle,
  onBrandClick,
}: SidebarHeaderProps) {
  return (
    <div className="admin-sidebar-header">
      <Link
        href={brandHref}
        className="admin-sidebar-brand"
        onClick={onBrandClick}
      >
        <div className="admin-sidebar-logo">
          <span className="material-symbols-outlined">{brandIcon}</span>
        </div>
        <div className="admin-sidebar-brand-text">
          <span className="admin-sidebar-title">{brandTitle}</span>
          {brandSubtitle && (
            <span className="admin-sidebar-subtitle">{brandSubtitle}</span>
          )}
        </div>
      </Link>
      <NotificationBell />
    </div>
  );
}
