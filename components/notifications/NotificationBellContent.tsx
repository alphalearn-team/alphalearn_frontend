import { Divider, ScrollArea, Text } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/lib/notifications";

interface NotificationBellContentProps {
  notifications: Notification[];
  onMarkAllRead: () => Promise<void>;
  onMarkRead: (publicId: string) => Promise<void>;
  unreadCount: number;
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (publicId: string) => Promise<void>;
}) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
        notification.isRead ? "opacity-60 hover:bg-white/5" : "hover:bg-violet-500/10"
      }`}
      onClick={() => {
        if (!notification.isRead) {
          onMarkRead(notification.publicId);
        }
      }}
    >
      <div className="mt-1.5 shrink-0">
        {!notification.isRead ? (
          <div className="w-2 h-2 rounded-full bg-violet-500" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-transparent" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Text
          size="sm"
          c="var(--color-text)"
          fw={notification.isRead ? 400 : 500}
          style={{ lineHeight: 1.4 }}
        >
          {notification.message}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </Text>
      </div>
    </div>
  );
}

function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--color-text-muted)]">
      <span className="material-symbols-outlined text-3xl opacity-40">notifications_off</span>
      <Text size="xs">No notifications yet</Text>
    </div>
  );
}

export default function NotificationBellContent({
  notifications,
  onMarkAllRead,
  onMarkRead,
  unreadCount,
}: NotificationBellContentProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <Text fw={600} size="sm" c="var(--color-text)">
          Notifications
        </Text>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>
      <Divider color="var(--color-border)" />

      <ScrollArea h={320} scrollbarSize={4}>
        {notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          notifications.map((notification, index) => (
            <div key={notification.publicId}>
              <NotificationItem
                notification={notification}
                onMarkRead={onMarkRead}
              />
              {index < notifications.length - 1 && (
                <Divider color="var(--color-border)" opacity={0.4} />
              )}
            </div>
          ))
        )}
      </ScrollArea>
    </>
  );
}
