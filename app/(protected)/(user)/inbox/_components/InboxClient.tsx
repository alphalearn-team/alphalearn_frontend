"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
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
import { joinPrivateLobby } from "@/app/(protected)/(user)/games/online/_lib/api";
import type { Notification } from "@/lib/utils/notifications";
import {
  getIncomingPendingPrivateInvites,
  respondToPrivateInvite,
  toFriendlyPrivateInviteActionError,
  type PrivateLobbyInvite,
  type PrivateLobbyInviteAction,
  type PrivateLobbyInviteStatus,
} from "@/lib/utils/gameLobbyInvites";

type GameLobbyInviteNotificationMetadata = {
  invitePublicId?: string;
  lobbyPublicId?: string;
  lobbyCode?: string;
  senderPublicId?: string;
  senderUsername?: string;
  receiverPublicId?: string;
  receiverUsername?: string;
  status?: string;
};

function toGameLobbyInviteMetadata(
  notification: Notification,
): GameLobbyInviteNotificationMetadata | null {
  if (notification.type !== "GAME_LOBBY_INVITE") {
    return null;
  }

  if (!notification.metadata || typeof notification.metadata !== "object") {
    return null;
  }

  return notification.metadata as GameLobbyInviteNotificationMetadata;
}

function toDisplayInviteStatus(status: string | null | undefined): PrivateLobbyInviteStatus | null {
  if (!status) {
    return null;
  }

  const normalizedStatus = status.toUpperCase();
  if (
    normalizedStatus === "PENDING"
    || normalizedStatus === "ACCEPTED"
    || normalizedStatus === "REJECTED"
    || normalizedStatus === "EXPIRED"
    || normalizedStatus === "CANCELED"
  ) {
    return normalizedStatus;
  }

  return null;
}

function toStatusColor(status: PrivateLobbyInviteStatus | null | undefined): string {
  if (status === "ACCEPTED") {
    return "green";
  }
  if (status === "REJECTED" || status === "CANCELED") {
    return "red";
  }
  if (status === "EXPIRED") {
    return "orange";
  }
  return "blue";
}

export default function InboxClient() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { notifications, unreadCount, markAllRead, markSelectedRead, refresh } = useNotifications(
    Boolean(user),
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isMarkingSelected, setIsMarkingSelected] = useState(false);
  const [incomingInvites, setIncomingInvites] = useState<PrivateLobbyInvite[]>([]);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [inviteActionById, setInviteActionById] = useState<Record<string, PrivateLobbyInviteAction | null>>({});

  const refreshIncomingInvites = useCallback(async () => {
    const accessToken = session?.access_token;

    if (!user || !accessToken) {
      setIncomingInvites([]);
      setInvitesError(null);
      return;
    }

    setInvitesError(null);

    try {
      const invites = await getIncomingPendingPrivateInvites(accessToken);
      setIncomingInvites(invites);
    } catch (error) {
      setInvitesError(toFriendlyPrivateInviteActionError(error));
    }
  }, [session?.access_token, user]);

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

  useEffect(() => {
    void refreshIncomingInvites();
  }, [refreshIncomingInvites]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications],
  );
  const visibleNotifications = unreadNotifications;

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

  const handleRefreshInbox = async () => {
    await Promise.all([refresh(), refreshIncomingInvites()]);
  };

  const handleInviteAction = async (
    invitePublicId: string,
    action: PrivateLobbyInviteAction,
    lobbyCode?: string | null,
  ) => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      setInvitesError("You need to be signed in to respond to invites.");
      return;
    }

    setInviteActionById((previous) => ({
      ...previous,
      [invitePublicId]: action,
    }));
    setInvitesError(null);
    const relatedNotificationIds = notifications
      .filter((notification) => {
        const metadata = toGameLobbyInviteMetadata(notification);
        return metadata?.invitePublicId === invitePublicId && !notification.isRead;
      })
      .map((notification) => notification.publicId);

    try {
      const invite = await respondToPrivateInvite(accessToken, invitePublicId, action);
      if (relatedNotificationIds.length > 0) {
        await markSelectedRead(relatedNotificationIds);
      }

      if (action === "ACCEPT") {
        const resolvedLobbyCode = (lobbyCode ?? invite.lobbyCode ?? "").trim();
        if (!resolvedLobbyCode) {
          throw new Error("Invite accepted, but lobby code is missing.");
        }

        const joinedLobby = await joinPrivateLobby(accessToken, {
          lobbyCode: resolvedLobbyCode,
        });
        router.push(`/games/online/${joinedLobby.publicId}`);
        return;
      }

      await Promise.all([refresh(), refreshIncomingInvites()]);
    } catch (error) {
      setInvitesError(toFriendlyPrivateInviteActionError(error));
      await Promise.all([refresh(), refreshIncomingInvites()]);
    } finally {
      setInviteActionById((previous) => ({
        ...previous,
        [invitePublicId]: null,
      }));
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
                  onClick={handleRefreshInbox}
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
                  Clear selected
                </Button>
                <Button
                  variant="filled"
                  onClick={handleMarkAllRead}
                  loading={isMarkingAll}
                  disabled={unreadCount === 0 || isMarkingSelected}
                >
                  Clear all
                </Button>
              </Group>

              <Stack gap="sm">
                {invitesError ? (
                  <Alert color="red" radius="md" variant="light" title="Invite update failed">
                    {invitesError}
                  </Alert>
                ) : null}

                {visibleNotifications.length === 0 ? (
                  <Card withBorder radius="md" p="lg">
                    <Text c="dimmed" size="sm">
                      No notifications yet.
                    </Text>
                  </Card>
                ) : (
                  visibleNotifications.map((notification) => (
                    <Card
                      key={notification.publicId}
                      withBorder
                      radius="md"
                      p="md"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-primary) 45%, var(--color-border))",
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
                            <Text fw={700}>{notification.message}</Text>
                            <Text size="xs" c="dimmed">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </Text>
                            {(() => {
                              const metadata = toGameLobbyInviteMetadata(notification);
                              if (!metadata?.invitePublicId) {
                                return null;
                              }

                              const pendingInvite = incomingInvites.find(
                                (invite) => invite.invitePublicId === metadata.invitePublicId,
                              );
                              const fallbackStatus = toDisplayInviteStatus(metadata.status);
                              const status = pendingInvite?.status ?? fallbackStatus;
                              const activeAction = inviteActionById[metadata.invitePublicId];
                              const canRespond = status === "PENDING" && Boolean(metadata.invitePublicId);
                              const invitePublicId = metadata.invitePublicId ?? "";

                              return (
                                <Stack gap={6} mt={4}>
                                  <Group gap="xs">
                                    <Badge color={toStatusColor(status)} variant="light">
                                      {status ?? "Invite"}
                                    </Badge>
                                    {metadata.lobbyCode ? (
                                      <Badge color="gray" variant="light">
                                        Code {metadata.lobbyCode}
                                      </Badge>
                                    ) : null}
                                  </Group>
                                  {canRespond ? (
                                    <Group gap="xs">
                                      <Button
                                        size="xs"
                                        color="lime"
                                        loading={activeAction === "ACCEPT"}
                                        disabled={Boolean(activeAction)}
                                        onClick={() =>
                                          void handleInviteAction(
                                            invitePublicId,
                                            "ACCEPT",
                                            metadata.lobbyCode ?? pendingInvite?.lobbyCode,
                                          )
                                        }
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        size="xs"
                                        color="red"
                                        variant="light"
                                        loading={activeAction === "REJECT"}
                                        disabled={Boolean(activeAction)}
                                        onClick={() => void handleInviteAction(invitePublicId, "REJECT")}
                                      >
                                        Reject
                                      </Button>
                                    </Group>
                                  ) : null}
                                </Stack>
                              );
                            })()}
                          </Stack>
                        </Group>
                        <Badge color="blue" variant="light">
                          Unread
                        </Badge>
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
