"use client";

import AppSidebar, { type SidebarNavSection } from "@/components/sidebar/appSidebar";
import { useAuth } from "@/context/AuthContext";

const sections: SidebarNavSection[] = [
  {
    label: "Navigation",
    items: [
      { label: "Concepts", href: "/concepts", icon: "library_books" },
      { label: "Lessons", href: "/lessons", icon: "menu_book" },
      { label: "Profile", href: "/profile", icon: "person" },
    ],
  },
];

const nonAdminQuickActionsSection: SidebarNavSection = {
  label: "Quick Actions",
  items: [
    { label: "Contributor Access", href: "/contributor-application", icon: "group_add" },
    { label: "Create Lesson", href: "/lessons/create", icon: "add_circle" },
  ],
};

function toRoleLabel(role: string | null) {
  if (role === "CONTRIBUTOR") return "Contributor";
  if (role === "LEARNER") return "Learner";
  if (role === "ADMIN") return "Administrator";
  return "Member";
}

export default function UserSidebar() {
  const { userRole } = useAuth();
  const quickActionsSection =
    userRole === "ADMIN" || userRole === null ? undefined : nonAdminQuickActionsSection;

  return (
    <AppSidebar
      brandTitle="AlphaLearn"
      brandSubtitle="Learning Hub"
      brandHref="/lessons"
      brandIcon="bolt"
      roleLabel={toRoleLabel(userRole)}
      sections={sections}
      quickActionsSection={quickActionsSection}
      userFallbackLabel="Member"
    />
  );
}
