"use client";

import { useState } from "react";
import { ActionIcon, Badge, Popover } from "@mantine/core";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import NotificationBellContent from "./NotificationBellContent";

interface NotificationBellProps {
  compact?: boolean;
}

export default function NotificationBell({ compact = false }: NotificationBellProps) {
  const { user, userRole } = useAuth();
  const [opened, setOpened] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(
    !!user && userRole !== "ADMIN",
  );

  if (!user || userRole === "ADMIN") {
    return null;
  }

  const handleOpen = (isOpen: boolean) => {
    setOpened(isOpen);
  };

  return (
    <Popover
      opened={opened}
      onChange={handleOpen}
      position={compact ? "left-start" : "bottom-end"}
      width={compact ? 320 : 340}
      offset={8}
      shadow="xl"
      radius={12}
      withArrow
      zIndex={220}
    >
      <Popover.Target>
        <div className={`sidebar-notification-bell ${compact ? "compact" : ""} ${opened ? "open" : ""}`}>
          <ActionIcon
            variant="transparent"
            size="lg"
            radius="xl"
            aria-label="Notifications"
            aria-expanded={opened}
            onClick={() => handleOpen(!opened)}
            className="sidebar-notification-trigger"
            style={{ color: "var(--color-text)" }}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </ActionIcon>

          {unreadCount > 0 && (
            <Badge
              size="xs"
              color="blue"
              variant="filled"
              circle
              className="sidebar-notification-badge"
              style={{
                minWidth: 16,
                height: 16,
                fontSize: 9,
                padding: 0,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      </Popover.Target>

      <Popover.Dropdown
        styles={{
          dropdown: {
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "var(--color-border)",
            padding: 0,
            overflow: "hidden",
          },
        }}
      >
        <NotificationBellContent
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
