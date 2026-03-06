"use client";

import "./sidebar-shell.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@mantine/core";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
}

export interface SidebarNavSection {
  label: string;
  items: SidebarNavItem[];
}

export interface AppSidebarProps {
  brandTitle: string;
  brandSubtitle?: string;
  brandHref: string;
  brandIcon: string;
  roleLabel: string;
  sections: SidebarNavSection[];
  quickActionsSection?: SidebarNavSection;
  userFallbackLabel?: string;
  avatarAccentBorder?: string;
}

export default function AppSidebar({
  brandTitle,
  brandSubtitle,
  brandHref,
  brandIcon,
  roleLabel,
  sections,
  quickActionsSection,
  userFallbackLabel = "User",
  avatarAccentBorder = "var(--color-accent)",
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);

  const avatarLetter = user?.email ? user.email[0].toUpperCase() : "?";
  const profilePicture = user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
  const mobileOpen = mobileOpenPath === pathname;

  const closeMobileSidebar = () => {
    setMobileOpenPath(null);
  };

  const toggleMobileSidebar = () => {
    setMobileOpenPath((currentPath) => (currentPath === pathname ? null : pathname));
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMobileSidebar();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (item: SidebarNavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <button
        className="admin-sidebar-toggle"
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link
            href={brandHref}
            className="admin-sidebar-brand"
            onClick={closeMobileSidebar}
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

        <button
          className="admin-sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined">
            {collapsed ? "chevron_left" : "chevron_right"}
          </span>
        </button>

        <nav className="admin-sidebar-nav">
          {sections.map((section) => (
            <div className="admin-sidebar-nav-section" key={section.label}>
              <span className="admin-sidebar-nav-label">{section.label}</span>
              <ul className="admin-sidebar-nav-list">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`admin-sidebar-nav-item ${isActive(item) ? "active" : ""}`}
                      title={collapsed ? item.label : undefined}
                      onClick={closeMobileSidebar}
                    >
                      <span className="admin-sidebar-nav-icon material-symbols-outlined">
                        {item.icon}
                      </span>
                      <span className="admin-sidebar-nav-text">{item.label}</span>
                      {isActive(item) && (
                        <span className="admin-sidebar-nav-indicator" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {quickActionsSection && (
            <div className="admin-sidebar-nav-section">
              <span className="admin-sidebar-nav-label">{quickActionsSection.label}</span>
              <ul className="admin-sidebar-nav-list">
                {quickActionsSection.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="admin-sidebar-nav-item"
                      title={collapsed ? item.label : undefined}
                      onClick={closeMobileSidebar}
                    >
                      <span className="admin-sidebar-nav-icon material-symbols-outlined">
                        {item.icon}
                      </span>
                      <span className="admin-sidebar-nav-text">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <Avatar
              src={profilePicture}
              color="white"
              radius="xl"
              size="md"
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  border: `2px solid ${avatarAccentBorder}`,
                  flexShrink: 0,
                },
              }}
            >
              {avatarLetter}
            </Avatar>
            <div className="admin-sidebar-user-info">
              <span className="admin-sidebar-user-email">
                {user?.email || userFallbackLabel}
              </span>
              <span className="admin-sidebar-user-role">{roleLabel}</span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="admin-sidebar-logout"
            title={collapsed ? "Logout" : undefined}
          >
            <div className="admin-sidebar-logout-content">
              <span className="material-symbols-outlined">logout</span>
              <span className="admin-sidebar-logout-text">Logout</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
