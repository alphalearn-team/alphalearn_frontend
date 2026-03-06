"use client";

import "./sidebar-shell.css";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "@mantine/hooks";
import { useAuth } from "@/context/AuthContext";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";

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

  useHotkeys([["Escape", closeMobileSidebar]]);

  const isActive = (item: SidebarNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }

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

      <aside
        className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <SidebarHeader
          brandHref={brandHref}
          brandIcon={brandIcon}
          brandTitle={brandTitle}
          brandSubtitle={brandSubtitle}
          collapsed={collapsed}
          onBrandClick={closeMobileSidebar}
        />

        <button
          className="admin-sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined">
            {collapsed ? "chevron_left" : "chevron_right"}
          </span>
        </button>

        <SidebarNav
          collapsed={collapsed}
          isActive={isActive}
          onItemClick={closeMobileSidebar}
          sections={sections}
          quickActionsSection={quickActionsSection}
        />

        <SidebarFooter
          avatarAccentBorder={avatarAccentBorder}
          avatarLetter={avatarLetter}
          collapsed={collapsed}
          onSignOut={signOut}
          profilePicture={profilePicture}
          roleLabel={roleLabel}
          userLabel={user?.email || userFallbackLabel}
        />
      </aside>
    </>
  );
}
