"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type { FriendPublic } from "@/interfaces/interfaces";
import { apiClientFetch } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/apiErrors";
import { useAuth } from "@/lib/auth/client/AuthContext";
import MySquadSkeleton from "./MySquadSkeleton";
import SquadMemberCard from "./SquadMemberCard";

const usernameCollator = new Intl.Collator(undefined, {
  sensitivity: "base",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFriends(payload: unknown): FriendPublic[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const friends: FriendPublic[] = [];

  for (const item of payload) {
    if (!isRecord(item)) {
      continue;
    }

    const publicId = typeof item.publicId === "string" ? item.publicId.trim() : "";
    const username = typeof item.username === "string" ? item.username.trim() : "";

    if (!publicId || !username) {
      continue;
    }

    friends.push({ publicId, username });
  }

  return friends.sort((left, right) => usernameCollator.compare(left.username, right.username));
}

async function fetchSquadMembers(accessToken: string, signal?: AbortSignal) {
  const payload = await apiClientFetch<unknown>("/friends", accessToken, { signal });
  return normalizeFriends(payload);
}

function toFriendlySquadLoadError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return error.message || "You are not allowed to view your squad right now.";
    }

    if (error.status >= 500) {
      return "We couldn't load your squad right now. Please try again.";
    }

    return error.message || "Could not load your squad right now.";
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes("not authenticated")
      || normalizedMessage.includes("unauthorized")
      || normalizedMessage.includes("session")
    ) {
      return "Your session expired. Refresh the page and sign in again.";
    }

    return message || "Could not load your squad right now.";
  }

  return "Could not load your squad right now.";
}

export default function MySquadClient() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const accessToken = session?.access_token ?? null;
  const authUserId = session?.user.id ?? null;

  const [friends, setFriends] = useState<FriendPublic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setSearchQuery("");
  }, [authUserId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!accessToken) {
      setFriends([]);
      setLoadError("Your session expired. Refresh the page and sign in again.");
      setIsLoadingFriends(false);
      return;
    }

    const abortController = new AbortController();

    setIsLoadingFriends(true);
    setLoadError(null);

    void fetchSquadMembers(accessToken, abortController.signal)
      .then((nextFriends) => {
        if (abortController.signal.aborted) {
          return;
        }

        setFriends(nextFriends);
        setLoadError(null);
      })
      .catch((error) => {
        if (abortController.signal.aborted) {
          return;
        }

        setFriends([]);
        setLoadError(toFriendlySquadLoadError(error));
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingFriends(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [accessToken, authUserId, isAuthLoading]);

  const handleRetry = async () => {
    if (!accessToken) {
      setFriends([]);
      setLoadError("Your session expired. Refresh the page and sign in again.");
      setIsLoadingFriends(false);
      return;
    }

    setIsLoadingFriends(true);
    setLoadError(null);

    try {
      const nextFriends = await fetchSquadMembers(accessToken);
      setFriends(nextFriends);
      setLoadError(null);
    } catch (error) {
      setFriends([]);
      setLoadError(toFriendlySquadLoadError(error));
    } finally {
      setIsLoadingFriends(false);
    }
  };

  if (isLoadingFriends) {
    return <MySquadSkeleton />;
  }

  if (loadError) {
    return <MySquadErrorState message={loadError} onRetry={handleRetry} />;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFriends = normalizedQuery
    ? friends.filter((friend) => friend.username.toLowerCase().includes(normalizedQuery))
    : friends;

  return (
    <Stack gap="xl">
      <MySquadToolbar
        filteredCount={filteredFriends.length}
        searchQuery={searchQuery}
        totalCount={friends.length}
        onSearchChange={setSearchQuery}
      />

      {friends.length === 0 ? (
        <MySquadEmptyState />
      ) : filteredFriends.length === 0 ? (
        <MySquadNoResultsState
          query={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {filteredFriends.map((friend) => (
            <SquadMemberCard key={friend.publicId} {...friend} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

function MySquadToolbar({
  filteredCount,
  searchQuery,
  totalCount,
  onSearchChange,
}: {
  filteredCount: number;
  searchQuery: string;
  totalCount: number;
  onSearchChange: (value: string) => void;
}) {
  const hasQuery = searchQuery.trim().length > 0;
  const countLabel = hasQuery
    ? `${filteredCount} of ${totalCount} ${totalCount === 1 ? "squad member" : "squad members"}`
    : `${totalCount} ${totalCount === 1 ? "squad member" : "squad members"}`;

  return (
    <Group justify="space-between" align="center" className="gap-4">
      <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {countLabel}
      </span>

      {totalCount > 0 ? (
        <div className="w-full max-w-sm">
          <TextInput
            aria-label="Search squad members by username"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder="Search squad..."
            leftSection={
              <span className="material-symbols-outlined text-[18px] text-[var(--color-text-muted)]">
                search
              </span>
            }
            styles={{
              input: {
                minHeight: "46px",
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              },
            }}
          />
        </div>
      ) : null}
    </Group>
  );
}

function MySquadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Alert color="red" radius="lg" variant="light" title="Could not load your squad">
      <Stack gap="sm">
        <Text size="sm">{message}</Text>
        <div>
          <Button radius="xl" variant="light" color="red" onClick={() => void onRetry()}>
            Retry
          </Button>
        </div>
      </Stack>
    </Alert>
  );
}

function MySquadEmptyState() {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          diversity_3
        </span>
      </div>

      <Title order={3} className="text-center text-[var(--color-text-muted)]">
        No squad members yet
      </Title>

      <Text className="max-w-md text-center text-sm text-[var(--color-text-muted)]">
        When you connect with friends from the learner directory, they&apos;ll show up here.
      </Text>

      <Button
        component={Link}
        href="/learners"
        variant="outline"
        radius="xl"
        styles={{
          root: {
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          },
        }}
      >
        Browse Learners
      </Button>
    </Stack>
  );
}

function MySquadNoResultsState({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          person_search
        </span>
      </div>

      <Title order={3} className="text-center text-[var(--color-text-muted)]">
        No squad members match your search
      </Title>

      <Text className="max-w-md text-center text-sm text-[var(--color-text-muted)]">
        No usernames matched &quot;{query.trim()}&quot;. Try a different search or clear the filter.
      </Text>

      <Button
        variant="outline"
        radius="xl"
        onClick={onClearSearch}
        styles={{
          root: {
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          },
        }}
      >
        Clear Search
      </Button>
    </Stack>
  );
}
