"use client";

import "./sidebar-shell.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "@mantine/hooks";
import { useAuth } from "@/lib/auth/client/AuthContext";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
  badgeCount?: number;
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
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);

  const userLabel = profile?.username || user?.email || userFallbackLabel;
  const avatarLetter = userLabel[0]?.toUpperCase() || "?";
  const profilePicture =
    profile?.profilePictureUrl
    || user?.user_metadata?.picture
    || user?.user_metadata?.avatar_url;
  const mobileOpen = mobileOpenPath === pathname;

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("touch-action");
      return;
    }

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("touch-action");
    };
  }, [mobileOpen]);

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
        className="sidebar-toggle"
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
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
          className="sidebar-collapse-btn"
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
          avatarLetter={avatarLetter}
          collapsed={collapsed}
          onSignOut={signOut}
          profilePicture={profilePicture}
          profileHref="/profile"
          roleLabel={roleLabel}
          userLabel={userLabel}
        />
      </aside>
    </>
  );
}
