"use client";

import { Button, Card, Stack, Text, Title } from "@mantine/core";
import type { LearnerPublic } from "@/interfaces/interfaces";
import {
  getLearnerFriendshipAction,
  type LearnerFriendshipState,
} from "./learnerFriendshipAction";

interface LearnerCardProps extends LearnerPublic {
  description?: string | null;
  friendshipState: LearnerFriendshipState;
  onSendFriendRequest: (learner: LearnerPublic) => void;
  showActionHelperText?: boolean;
}

export default function LearnerCard({
  description = "Visible in the learner directory.",
  publicId,
  username,
  friendshipState,
  onSendFriendRequest,
  showActionHelperText = true,
}: LearnerCardProps) {
  const action = getLearnerFriendshipAction(friendshipState);

  return (
    <Card
      padding="xl"
      radius="28px"
      className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--color-card-bg)",
        boxShadow: "inset 0 0 0 1px var(--color-card-border), 0 10px 30px -10px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-primary)" }}
      />

      <Stack gap="md" h="100%" justify="space-between" className="relative z-10">
        <Stack gap="xs">
          <div className="flex items-start justify-between gap-3">
            <Text
              size="xs"
              fw={800}
              className="uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-70"
            >
              Learner
            </Text>

            <span className="material-symbols-outlined text-lg text-[var(--color-card-text-muted)] opacity-50">
              person
            </span>
          </div>

          <Title
            order={3}
            className="min-w-0 break-words text-2xl font-bold tracking-tight leading-tight text-[var(--color-card-text)]"
          >
            {username}
          </Title>

          {description ? (
            <Text
              size="sm"
              className="text-[var(--color-card-text-muted)] font-light leading-relaxed"
            >
              {description}
            </Text>
          ) : null}
        </Stack>

        <Stack gap={6}>
          <Button
            fullWidth
            radius="xl"
            size="md"
            onClick={() => onSendFriendRequest({ publicId, username })}
            disabled={action.disabled}
            loading={action.loading}
            styles={{
              root: {
                background:
                  friendshipState === "ready"
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.04)",
                border:
                  friendshipState === "ready"
                    ? "none"
                    : "1px solid var(--color-card-border)",
                color:
                  friendshipState === "ready"
                    ? "#111111"
                    : "var(--color-card-text)",
              },
              label: {
                fontWeight: 700,
                letterSpacing: "0.01em",
              },
            }}
          >
            {action.label}
          </Button>

          {showActionHelperText ? (
            <Text size="xs" className="text-[var(--color-card-text-muted)]">
              {action.helperText}
            </Text>
          ) : null}
        </Stack>

        <div className="flex items-center justify-between border-t border-[var(--color-card-border)] pt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-card-text-muted)] opacity-70">
            Community
          </span>
          <div className="flex gap-1">
            <div className="h-1 w-1 rounded-full bg-[var(--color-primary)] opacity-30" />
            <div className="h-1 w-1 rounded-full bg-[var(--color-primary)] opacity-50" />
            <div className="h-1 w-1 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
      </Stack>
    </Card>
  );
}
