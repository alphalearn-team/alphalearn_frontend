import Link from "next/link";

interface SidebarHeaderProps {
  brandHref: string;
  brandIcon: string;
  brandTitle: string;
  brandSubtitle?: string;
  collapsed: boolean;
  onBrandClick: () => void;
}

export default function SidebarHeader({
  brandHref,
  brandIcon,
  brandTitle,
  brandSubtitle,
  collapsed,
  onBrandClick,
}: SidebarHeaderProps) {
  return (
    <div className={`sidebar-header ${collapsed ? "collapsed" : ""}`}>
      <Link
        href={brandHref}
        className="sidebar-brand"
        onClick={onBrandClick}
      >
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">{brandIcon}</span>
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-title">{brandTitle}</span>
          {brandSubtitle && (
            <span className="sidebar-subtitle">{brandSubtitle}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
