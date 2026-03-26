"use client";

import {
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { FriendRequest } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/utils/formatDate";

type FriendRequestDecision = "APPROVED" | "REJECTED";

interface IncomingFriendRequestsPanelProps {
  requests: FriendRequest[];
  isLoading: boolean;
  isRefreshing: boolean;
  loadError: string | null;
  requestMutations: Record<number, FriendRequestDecision>;
  onAccept: (request: FriendRequest) => void;
  onReject: (request: FriendRequest) => void;
  onRetry: () => void;
}

export default function IncomingFriendRequestsPanel({
  requests,
  isLoading,
  isRefreshing,
  loadError,
  requestMutations,
  onAccept,
  onReject,
  onRetry,
}: IncomingFriendRequestsPanelProps) {
  return (
    <Card
      padding="xl"
      radius="28px"
      style={{
        background: "var(--color-card-bg)",
        boxShadow:
          "inset 0 0 0 1px var(--color-card-border), 0 10px 30px -10px rgba(0,0,0,0.5)",
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" className="gap-4">
          <div>
            <Text
              size="xs"
              fw={800}
              className="uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-70"
            >
              Friend Requests
            </Text>

            <Title
              order={2}
              className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-card-text)]"
            >
              Incoming requests
            </Title>

            <Text size="sm" className="mt-2 text-[var(--color-card-text-muted)]">
              Review pending requests without leaving the learner directory.
            </Text>
          </div>

          <div className="flex items-center gap-3">
            {isRefreshing && !isLoading ? (
              <Text size="xs" className="uppercase tracking-[0.18em] text-[var(--color-card-text-muted)]">
                Refreshing
              </Text>
            ) : null}

            <span className="rounded-full border border-[var(--color-card-border)] bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-card-text-muted)]">
              {requests.length} pending
            </span>
          </div>
        </Group>

        {loadError ? (
          <Alert color="red" radius="lg" variant="light" title="Could not load friend requests">
            <Stack gap="sm">
              <Text size="sm">{loadError}</Text>
              <div>
                <Button radius="xl" variant="light" color="red" onClick={onRetry}>
                  Retry
                </Button>
              </div>
            </Stack>
          </Alert>
        ) : null}

        {isLoading ? (
          <Group gap="sm" className="rounded-2xl border border-[var(--color-card-border)] bg-black/10 px-4 py-5">
            <Loader size="sm" color="var(--color-primary)" />
            <Text size="sm" className="text-[var(--color-card-text-muted)]">
              Loading incoming friend requests...
            </Text>
          </Group>
        ) : requests.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--color-card-border)] bg-black/10 px-5 py-8">
            <Text className="text-sm text-[var(--color-card-text-muted)]">
              No incoming friend requests right now.
            </Text>
          </div>
        ) : (
          <Stack gap="sm">
            {requests.map((request) => {
              const activeDecision = requestMutations[request.requestId];
              const isMutating = Boolean(activeDecision);

              return (
                <div
                  key={request.requestId}
                  className="rounded-[24px] border border-[var(--color-card-border)] bg-black/10 p-4"
                >
                  <Group justify="space-between" align="flex-start" className="gap-4">
                    <div>
                      <Text fw={700} className="text-[var(--color-card-text)]">
                        {request.otherUsername}
                      </Text>
                      <Text size="sm" className="mt-1 text-[var(--color-card-text-muted)]">
                        Requested on {formatDateTime(request.createdAt)}
                      </Text>
                    </div>

                    <Group gap="sm">
                      <Button
                        radius="xl"
                        onClick={() => onAccept(request)}
                        loading={activeDecision === "APPROVED"}
                        disabled={isMutating}
                      >
                        Accept
                      </Button>

                      <Button
                        radius="xl"
                        variant="light"
                        color="red"
                        onClick={() => onReject(request)}
                        loading={activeDecision === "REJECTED"}
                        disabled={isMutating}
                      >
                        Reject
                      </Button>
                    </Group>
                  </Group>
                </div>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
