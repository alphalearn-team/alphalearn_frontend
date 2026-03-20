import Link from "next/link";
import type { SidebarNavItem, SidebarNavSection } from "./AppSidebar";

interface SidebarNavProps {
  collapsed: boolean;
  isActive: (item: SidebarNavItem) => boolean;
  onItemClick: () => void;
  quickActionsSection?: SidebarNavSection;
  sections: SidebarNavSection[];
}

function SidebarNavSectionBlock({
  collapsed,
  isActive,
  onItemClick,
  section,
}: {
  collapsed: boolean;
  isActive?: (item: SidebarNavItem) => boolean;
  onItemClick: () => void;
  section: SidebarNavSection;
}) {
  return (
    <div className="sidebar-nav-section" key={section.label}>
      <span className="sidebar-nav-label">{section.label}</span>
      <ul className="sidebar-nav-list">
        {section.items.map((item) => {
          const itemActive = isActive ? isActive(item) : false;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-nav-item ${itemActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
                onClick={onItemClick}
              >
                <span className="sidebar-nav-icon material-symbols-outlined">
                  {item.icon}
                </span>
                <span className="sidebar-nav-text">{item.label}</span>
                {itemActive && <span className="sidebar-nav-indicator" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SidebarNav({
  collapsed,
  isActive,
  onItemClick,
  quickActionsSection,
  sections,
}: SidebarNavProps) {
  return (
    <nav className="sidebar-nav">
      {sections.map((section) => (
        <SidebarNavSectionBlock
          key={section.label}
          collapsed={collapsed}
          isActive={isActive}
          onItemClick={onItemClick}
          section={section}
        />
      ))}

      {quickActionsSection && (
        <SidebarNavSectionBlock
          collapsed={collapsed}
          onItemClick={onItemClick}
          section={quickActionsSection}
        />
      )}
    </nav>
  );
}
