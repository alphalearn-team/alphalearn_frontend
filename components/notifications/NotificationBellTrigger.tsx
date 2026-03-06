import { forwardRef } from "react";
import { ActionIcon, Badge } from "@mantine/core";

interface NotificationBellTriggerProps {
  onToggle: () => void;
  unreadCount: number;
}

const NotificationBellTrigger = forwardRef<HTMLDivElement, NotificationBellTriggerProps>(
  function NotificationBellTrigger({ onToggle, unreadCount }, ref) {
    return (
      <div ref={ref} className="relative cursor-pointer" onClick={onToggle}>
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
    );
  },
);

export default NotificationBellTrigger;
