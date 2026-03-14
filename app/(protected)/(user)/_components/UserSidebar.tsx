"use client";

import AppSidebar, { type SidebarNavSection } from "@/components/sidebar/AppSidebar";
import { useAuth } from "@/context/AuthContext";

const sections: SidebarNavSection[] = [
  {
    label: "Navigation",
    items: [
      { label: "Home", href: "/", icon: "home", exact: true },
      { label: "Concepts", href: "/concepts", icon: "library_books" },
      { label: "Lessons", href: "/lessons", icon: "menu_book" },
      { label: "Profile", href: "/profile", icon: "person" },
    ],
  },
];

function getQuickActionsSection(userRole: string | null): SidebarNavSection | undefined {
  if (userRole === "ADMIN" || userRole === null) {
    return undefined;
  }

  if (userRole === "CONTRIBUTOR") {
    return {
      label: "Quick Actions",
      items: [
        { label: "Create Lesson", href: "/lessons/create", icon: "add_circle" },
      ],
    };
  }

  return {
    label: "Quick Actions",
    items: [
      { label: "Contributor Access", href: "/contributor-application", icon: "group_add" },
      { label: "Create Lesson", href: "/lessons/create", icon: "add_circle" },
    ],
  };
}

function toRoleLabel(role: string | null) {
  if (role === "CONTRIBUTOR") return "Contributor";
  if (role === "LEARNER") return "Learner";
  if (role === "ADMIN") return "Administrator";
  return "Member";
}

export default function UserSidebar() {
  const { userRole } = useAuth();
  const quickActionsSection = getQuickActionsSection(userRole);

  return (
    <AppSidebar
      brandTitle="AlphaLearn"
      brandSubtitle="Learning Hub"
      brandHref="/"
      brandIcon="bolt"
      roleLabel={toRoleLabel(userRole)}
      sections={sections}
      quickActionsSection={quickActionsSection}
      userFallbackLabel="Member"
    />
  );
}
