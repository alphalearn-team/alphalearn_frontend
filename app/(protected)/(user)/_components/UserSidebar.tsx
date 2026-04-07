"use client";

import AppSidebar, {
  type SidebarNavSection,
} from "@/components/sidebar/AppSidebar";
import { useAuth } from "@/lib/auth/client/AuthContext";

const sections: SidebarNavSection[] = [
  {
    label: "Navigation",
    items: [
      { label: "Home", href: "/", icon: "home", exact: true },
      { label: "Game", href: "/games", icon: "sports_esports" },
      { label: "Weekly Quest", href: "/weekly-quest", icon: "bolt" },
      { label: "Concepts", href: "/concepts", icon: "library_books" },
      { label: "Lessons", href: "/lessons", icon: "menu_book" },
      { label: "My Enrolled Lessons", href: "/my-enrollments", icon: "bookmark" },
    ],
  },
];

function getQuickActionsSection(
  userRole: string | null,
): SidebarNavSection | undefined {
  if (userRole === null) {
    return undefined;
  }

  if (userRole === "CONTRIBUTOR") {
    return {
      label: "Quick Actions",
      items: [
        { label: "Submit Quest", href: "/weekly-quest", icon: "gallery_thumbnail" },
        { label: "Create Lesson", href: "/lessons/create", icon: "add_circle" },
        { label: "Create Quiz", href: "/quiz/edit", icon: "add_circle" },
      ],
    };
  }

  return {
    label: "Quick Actions",
    items: [
      { label: "Submit Quest", href: "/weekly-quest", icon: "gallery_thumbnail" },
      { label: "Contributor Access", href: "/contributor-application", icon: "group_add" },
      { label: "Create Lesson", href: "/lessons/create", icon: "add_circle" },
    ],
  };
}

function toRoleLabel(role: string | null) {
  if (role === "CONTRIBUTOR") return "Contributor";
  if (role === "LEARNER") return "Learner";
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
