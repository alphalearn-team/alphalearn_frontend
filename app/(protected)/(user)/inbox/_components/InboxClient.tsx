"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/lib/auth/client/AuthContext";

export default function InboxClient() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markSelectedRead, refresh } = useNotifications(
    Boolean(user),
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isMarkingSelected, setIsMarkingSelected] = useState(false);

  useEffect(() => {
    setSelectedIds((previous) => {
      const available = new Set(notifications.map((notification) => notification.publicId));
      const next = new Set<string>();

      previous.forEach((id) => {
        if (available.has(id)) {
          next.add(id);
        }
      });

      return next;
    });
  }, [notifications]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications],
  );

  const selectedUnreadIds = useMemo(
    () =>
      notifications
        .filter((notification) => selectedIds.has(notification.publicId) && !notification.isRead)
        .map((notification) => notification.publicId),
    [notifications, selectedIds],
  );

  const allUnreadSelected = unreadNotifications.length > 0
    && unreadNotifications.every((notification) => selectedIds.has(notification.publicId));

  const toggleSelect = (publicId: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(publicId);
      } else {
        next.delete(publicId);
      }
      return next;
    });
  };

  const handleToggleSelectAllUnread = (checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      unreadNotifications.forEach((notification) => {
        if (checked) {
          next.add(notification.publicId);
        } else {
          next.delete(notification.publicId);
        }
      });
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setIsMarkingAll(true);
    try {
      await markAllRead();
      setSelectedIds(new Set());
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkSelectedRead = async () => {
    if (selectedUnreadIds.length === 0) {
      return;
    }

    setIsMarkingSelected(true);
    try {
      await markSelectedRead(selectedUnreadIds);
      setSelectedIds((previous) => {
        const next = new Set(previous);
        selectedUnreadIds.forEach((id) => {
          next.delete(id);
        });
        return next;
      });
    } finally {
      setIsMarkingSelected(false);
    }
  };

  return (
    <section>
      <Container size="lg" className="py-16 lg:py-24">
        <Stack gap="xl">
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Title order={1}>Inbox</Title>
              <Text c="dimmed" size="sm">
                Review and manage your activity notifications.
              </Text>
            </Stack>
            <Badge variant="light" color={unreadCount > 0 ? "blue" : "gray"}>
              {unreadCount} unread notifications
            </Badge>
          </Group>

          <Card withBorder radius="md" p="lg">
            <Stack gap="md">
              <Group justify="space-between" align="flex-end">
                <Title order={3}>Activity Notifications</Title>
                <Button
                  variant="subtle"
                  onClick={refresh}
                  disabled={isMarkingAll || isMarkingSelected}
                >
                  Refresh
                </Button>
              </Group>

              <Group>
                <Checkbox
                  checked={allUnreadSelected}
                  disabled={unreadNotifications.length === 0}
                  label="Select all unread"
                  onChange={(event) => handleToggleSelectAllUnread(event.currentTarget.checked)}
                />
                <Button
                  variant="light"
                  onClick={handleMarkSelectedRead}
                  loading={isMarkingSelected}
                  disabled={selectedUnreadIds.length === 0 || isMarkingAll}
                >
                  Mark selected as read
                </Button>
                <Button
                  variant="filled"
                  onClick={handleMarkAllRead}
                  loading={isMarkingAll}
                  disabled={unreadCount === 0 || isMarkingSelected}
                >
                  Mark all as read
                </Button>
              </Group>

              <Stack gap="sm">
                {notifications.length === 0 ? (
                  <Card withBorder radius="md" p="lg">
                    <Text c="dimmed" size="sm">
                      No notifications yet.
                    </Text>
                  </Card>
                ) : (
                  notifications.map((notification) => (
                    <Card
                      key={notification.publicId}
                      withBorder
                      radius="md"
                      p="md"
                      style={{
                        opacity: notification.isRead ? 0.65 : 1,
                        borderColor: notification.isRead
                          ? "var(--color-border)"
                          : "color-mix(in srgb, var(--color-primary) 45%, var(--color-border))",
                      }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Group align="flex-start" wrap="nowrap" gap="sm">
                          <Checkbox
                            checked={selectedIds.has(notification.publicId)}
                            onChange={(event) =>
                              toggleSelect(notification.publicId, event.currentTarget.checked)
                            }
                            mt={2}
                          />
                          <Stack gap={4}>
                            <Text fw={notification.isRead ? 500 : 700}>{notification.message}</Text>
                            <Text size="xs" c="dimmed">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </Text>
                          </Stack>
                        </Group>
                        {!notification.isRead && (
                          <Badge color="blue" variant="light">
                            Unread
                          </Badge>
                        )}
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </section>
  );
}
