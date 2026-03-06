"use client";

import { useState } from "react";
import { ActionIcon, Badge, Popover } from "@mantine/core";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import NotificationBellContent from "./NotificationBellContent";

export default function NotificationBell() {
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
      position="bottom-end"
      width={340}
      shadow="xl"
      radius={12}
      withArrow
    >
      <Popover.Target>
        <div className="relative cursor-pointer" onClick={() => handleOpen(!opened)}>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            aria-label="Notifications"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </ActionIcon>

          {unreadCount > 0 && (
            <Badge
              size="xs"
              color="violet"
              variant="filled"
              circle
              style={{
                position: "absolute",
                top: 2,
                right: 2,
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
