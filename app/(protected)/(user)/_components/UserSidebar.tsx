"use client";

import { useEffect, useMemo, useState } from "react";
import AppSidebar, {
  type SidebarNavSection,
} from "@/components/sidebar/AppSidebar";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { fetchFriendRequests } from "@/lib/utils/friends";
import { getIncomingPendingPrivateInvites } from "@/lib/utils/gameLobbyInvites";

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
        { label: "Feed", href: "/friends-feed", icon: "dynamic_feed" },
        { label: "Concepts", href: "/concepts", icon: "library_books" },
        { label: "Lessons", href: "/lessons", icon: "menu_book" },
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
        { label: "Create Quiz", href: "/quiz", icon: "add_circle" },
      ],
    };
  }

  return {
    label: "Quick Actions",
    items: [
      { label: "Submit Quest", href: "/weekly-quest", icon: "gallery_thumbnail" },
      { label: "Become a Contributor", href: "/contributor-application", icon: "workspace_premium" },
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
  const { notifications, unreadCount } = useNotifications(Boolean(user));
  const [incomingRequestCount, setIncomingRequestCount] = useState(0);
  const [incomingPendingInviteCount, setIncomingPendingInviteCount] = useState(0);

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

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isCancelled = false;

    const loadIncomingInviteCount = async () => {
      try {
        const incomingInvites = await getIncomingPendingPrivateInvites(accessToken);
        if (isCancelled) {
          return;
        }
        setIncomingPendingInviteCount(incomingInvites.length);
      } catch {
        if (!isCancelled) {
          setIncomingPendingInviteCount(0);
        }
      }
    };

    void loadIncomingInviteCount();
    const intervalId = window.setInterval(() => {
      void loadIncomingInviteCount();
    }, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [accessToken]);

  const unreadInviteNotificationIds = useMemo(() => {
    const ids = new Set<string>();

    notifications.forEach((notification) => {
      if (notification.isRead || notification.type !== "GAME_LOBBY_INVITE") {
        return;
      }

      const metadata = notification.metadata;
      if (!metadata || typeof metadata !== "object") {
        return;
      }

      const invitePublicId = (metadata as { invitePublicId?: unknown }).invitePublicId;
      if (typeof invitePublicId === "string" && invitePublicId.trim()) {
        ids.add(invitePublicId);
      }
    });

    return ids;
  }, [notifications]);

  const unreadInboxBadgeCount = useMemo(() => {
    const fallbackInviteCount = Math.max(0, incomingPendingInviteCount - unreadInviteNotificationIds.size);
    return unreadCount + fallbackInviteCount;
  }, [incomingPendingInviteCount, unreadCount, unreadInviteNotificationIds.size]);

  const sections = useMemo(
    () => getSections(unreadInboxBadgeCount, accessToken ? incomingRequestCount : 0),
    [accessToken, incomingRequestCount, unreadInboxBadgeCount],
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
