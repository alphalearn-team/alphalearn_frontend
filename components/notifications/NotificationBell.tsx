"use client";

import { useState } from "react";
import { Popover } from "@mantine/core";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import NotificationBellContent from "./NotificationBellContent";
import NotificationBellTrigger from "./NotificationBellTrigger";

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
        <NotificationBellTrigger
          unreadCount={unreadCount}
          onToggle={() => handleOpen(!opened)}
        />
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
