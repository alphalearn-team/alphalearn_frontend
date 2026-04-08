"use client";

import { useEffect, useMemo, useState } from "react";
import AppSidebar, {
  type SidebarNavSection,
} from "@/components/sidebar/AppSidebar";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { fetchFriendRequests } from "@/lib/utils/friends";

function getSections(unreadNotificationsCount: number, incomingRequestCount: number): SidebarNavSection[] {
  return [
    {
      label: "Navigation",
      items: [
        { label: "Home", href: "/", icon: "home", exact: true },
        { label: "Inbox", href: "/inbox", icon: "inbox", badgeCount: unreadNotificationsCount || undefined },
        { label: "Squad", href: "/profile/squad", icon: "groups", badgeCount: incomingRequestCount || undefined },
        { label: "Game", href: "/games", icon: "sports_esports" },
        { label: "Weekly Quest", href: "/weekly-quest", icon: "bolt" },
        { label: "Friends Feed", href: "/friends-feed", icon: "dynamic_feed" },
        { label: "Concepts", href: "/concepts", icon: "library_books" },
        { label: "Lessons", href: "/lessons", icon: "menu_book" },
        { label: "My Enrolled Lessons", href: "/my-enrollments", icon: "bookmark" },
      ],
    },
  ];
}

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
  const { userRole, user, session } = useAuth();
  const accessToken = session?.access_token ?? null;
  const { unreadCount } = useNotifications(Boolean(user));
  const [incomingRequestCount, setIncomingRequestCount] = useState(0);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isCancelled = false;

    const loadIncomingRequestCount = async () => {
      try {
        const incoming = await fetchFriendRequests(accessToken, "INCOMING");
        if (isCancelled) {
          return;
        }
        setIncomingRequestCount(incoming.filter((request) => request.status === "PENDING").length);
      } catch {
        if (!isCancelled) {
          setIncomingRequestCount(0);
        }
      }
    };

    void loadIncomingRequestCount();
    const intervalId = window.setInterval(() => {
      void loadIncomingRequestCount();
    }, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [accessToken]);

  const sections = useMemo(
    () => getSections(unreadCount, accessToken ? incomingRequestCount : 0),
    [accessToken, incomingRequestCount, unreadCount],
  );
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
