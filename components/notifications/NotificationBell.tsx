"use client";

import { useState } from "react";
import { Popover, Badge, Text, ScrollArea, Divider, ActionIcon } from "@mantine/core";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
    const { user, userRole } = useAuth();
    const [opened, setOpened] = useState(false);
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications(
        !!user && userRole !== "ADMIN"
    );

    if (!user || userRole === "ADMIN") return null;

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
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <Text fw={600} size="sm" c="var(--color-text)">
                        Notifications
                    </Text>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <Divider color="var(--color-border)" />

                {/* List */}
                <ScrollArea h={320} scrollbarSize={4}>
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--color-text-muted)]">
                            <span className="material-symbols-outlined text-3xl opacity-40">notifications_off</span>
                            <Text size="xs">No notifications yet</Text>
                        </div>
                    ) : (
                        notifications.map((n, i) => (
                            <div key={n.publicId}>
                                <div
                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${n.isRead
                                            ? "opacity-60 hover:bg-white/5"
                                            : "hover:bg-violet-500/10"
                                        }`}
                                    onClick={() => { if (!n.isRead) markRead(n.publicId); }}
                                >
                                    {/* Unread dot */}
                                    <div className="mt-1.5 shrink-0">
                                        {!n.isRead ? (
                                            <div className="w-2 h-2 rounded-full bg-violet-500" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-transparent" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Text
                                            size="sm"
                                            c="var(--color-text)"
                                            fw={n.isRead ? 400 : 500}
                                            style={{ lineHeight: 1.4 }}
                                        >
                                            {n.message}
                                        </Text>
                                        <Text size="xs" c="dimmed" mt={2}>
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </Text>
                                    </div>
                                </div>
                                {i < notifications.length - 1 && (
                                    <Divider color="var(--color-border)" opacity={0.4} />
                                )}
                            </div>
                        ))
                    )}
                </ScrollArea>
            </Popover.Dropdown>
        </Popover>
    );
}
