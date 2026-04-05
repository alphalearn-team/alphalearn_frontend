"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  createPrivateLobby,
  getPrivateLobbyState,
  joinPrivateLobby,
  normalizeLobbyCode,
} from "../_lib/api";
import { createRankedMatchmakingRealtimeClient } from "../_lib/matchmakingRealtime";
import { useRankedMatchmakingQueue } from "../_lib/useRankedMatchmakingQueue";
import type { LobbyConceptPoolMode } from "../_lib/types";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";
const actionButtonClassName =
  "min-h-14 rounded-[18px] border border-cyan-400/20 bg-[linear-gradient(180deg,#28c8f7,#1ca8e8)] text-[color:#0a4e9f] font-semibold text-lg shadow-[0_8px_0_0_rgba(15,90,200,0.25)]";
const JOIN_STATE_HYDRATE_RETRY_DELAYS_MS = [200, 400, 700];

export default function OnlineLobbyHubScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;

  const [conceptPoolMode, setConceptPoolMode] =
    useState<LobbyConceptPoolMode>("CURRENT_MONTH_PACK");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isRoutingMatchedLobby, setIsRoutingMatchedLobby] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastRoutedLobbyRef = useRef<string | null>(null);
  const matchmakingRealtimeRef = useRef<ReturnType<
    typeof createRankedMatchmakingRealtimeClient
  > | null>(null);

  const rankedQueue = useRankedMatchmakingQueue(accessToken);
  const {
    state: rankedQueueState,
    isSearching,
    isMatched,
    isBusy,
    matchedLobbyPublicId,
    queuePosition,
    queueSize,
    hydrateStatus,
    enqueue,
    cancel,
    applyMatchmakingEvent,
  } = rankedQueue;

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void hydrateStatus();
    const handleFocus = () => {
      if (document.visibilityState !== "hidden") {
        void hydrateStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [accessToken, hydrateStatus]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const matchmakingClient = createRankedMatchmakingRealtimeClient(accessToken, {
      onConnect: () => {
        void hydrateStatus();
      },
      onDisconnect: () => {
        void hydrateStatus();
      },
      onEvent: (envelope) => {
        applyMatchmakingEvent(envelope.state);
        if (envelope.reason === "MATCHED" || envelope.reason === "STARTING") {
          void hydrateStatus();
        }
      },
      onError: (message) => {
        setErrorMessage(message);
      },
    });

    matchmakingRealtimeRef.current = matchmakingClient;
    matchmakingClient.connect();

    return () => {
      matchmakingClient.disconnect();
      matchmakingRealtimeRef.current = null;
    };
  }, [accessToken, applyMatchmakingEvent, hydrateStatus]);

  useEffect(() => {
    if (!accessToken || !matchedLobbyPublicId) {
      return;
    }
    if (lastRoutedLobbyRef.current === matchedLobbyPublicId) {
      return;
    }

    lastRoutedLobbyRef.current = matchedLobbyPublicId;
    void routeToLobby(
      accessToken,
      matchedLobbyPublicId,
      router,
      setIsRoutingMatchedLobby,
      setErrorMessage,
    );
  }, [accessToken, matchedLobbyPublicId, router]);

  const combinedError = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }
    if (rankedQueueState.error) {
      return toFriendlyRankedQueueError(rankedQueueState.error);
    }
    return null;
  }, [errorMessage, rankedQueueState.error]);

  const handleCreate = async () => {
    if (!accessToken || isCreating) {
      return;
    }

    setErrorMessage(null);
    setIsCreating(true);

    try {
      const lobby = await createPrivateLobby(accessToken, {
        conceptPoolMode,
      });
      router.push(`/games/online/${lobby.publicId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not create lobby right now.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || isJoining) {
      return;
    }

    const normalizedCode = normalizeLobbyCode(lobbyCode);
    if (!normalizedCode) {
      setErrorMessage("Enter a lobby code to join.");
      return;
    }

    setErrorMessage(null);
    setIsJoining(true);

    try {
      const joinedLobby = await joinPrivateLobby(accessToken, {
        lobbyCode: normalizedCode,
      });
      await hydrateJoinedLobbyState(accessToken, joinedLobby.publicId);
      router.push(`/games/online/${joinedLobby.publicId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not join lobby right now.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Container size="md" className="py-6 lg:py-8">
      <Stack gap="lg">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="md">
            <Title order={1} className="text-center text-3xl text-[var(--color-text)]">
              Online Imposter
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Choose how you want to play.
            </Text>

            {!accessToken ? (
              <Alert color="yellow" radius="lg" variant="light" title="Sign in required">
                You need to be signed in before creating or joining a lobby.
              </Alert>
            ) : null}

            {combinedError ? (
              <Alert color="red" radius="lg" variant="light" title="Action failed">
                {combinedError}
              </Alert>
            ) : null}

            <Stack gap="sm" mt="xs">
              <Button
                className={actionButtonClassName}
                onClick={() => void enqueue()}
                loading={isBusy && isSearching}
                disabled={!accessToken || isSearching || isRoutingMatchedLobby}
                leftSection={<span className="text-xl">🌍</span>}
              >
                Find Ranked Match
              </Button>
              <Button
                className={actionButtonClassName}
                onClick={handleCreate}
                loading={isCreating}
                disabled={!accessToken || isCreating}
                leftSection={<span className="text-xl">🙂</span>}
              >
                Create Private Match
              </Button>
            </Stack>
          </Stack>
        </Card>

        {isSearching || isMatched ? (
          <Card radius="24px" padding="lg" className={sectionCardClassName}>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={700} className="text-[var(--color-text)]">
                  Waiting for people to join...
                </Text>
                <Badge color="blue" variant="light">
                  {rankedQueueState.status?.state}
                </Badge>
              </Group>

              <QueueSlotList
                queueSize={queueSize}
                queuePosition={queuePosition}
              />

              <Group>
                <Button
                  radius="xl"
                  variant="default"
                  onClick={() => void cancel()}
                  loading={isBusy && !isSearching}
                  disabled={!isSearching || isRoutingMatchedLobby}
                >
                  Cancel
                </Button>
                {matchedLobbyPublicId ? (
                  <Text size="sm" c="dimmed">
                    Matched lobby: {matchedLobbyPublicId}
                  </Text>
                ) : null}
              </Group>
            </Stack>
          </Card>
        ) : null}

        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="md">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Create private lobby
              </p>
            </div>

            <Radio.Group
              value={conceptPoolMode}
              onChange={(value) => setConceptPoolMode(value as LobbyConceptPoolMode)}
              label="Concept pool"
            >
              <Stack gap="xs">
                <Radio value="CURRENT_MONTH_PACK" label="Current month pack" color="lime" />
                <Radio value="FULL_CONCEPT_POOL" label="Full concept pool" color="lime" />
              </Stack>
            </Radio.Group>

            <Button radius="xl" onClick={handleCreate} loading={isCreating} disabled={!accessToken}>
              Create lobby
            </Button>
          </Stack>
        </Card>

        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <form onSubmit={handleJoin}>
            <Stack gap="md">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Join private lobby
                </p>
              </div>
              <TextInput
                placeholder="ABC123"
                value={lobbyCode}
                onChange={(event) => setLobbyCode(event.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    textTransform: "uppercase",
                  },
                }}
              />
              <Button type="submit" radius="xl" loading={isJoining} disabled={!accessToken}>
                Join lobby
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}

function QueueSlotList({
  queueSize,
  queuePosition,
}: {
  queueSize: number | null;
  queuePosition: number | null;
}): JSX.Element {
  const joinedSlots = Math.max(1, Math.min(4, queueSize ?? 1));
  return (
    <Stack gap="sm" className="rounded-[16px] border border-white/15 bg-white/5 p-4">
      {Array.from({ length: 4 }).map((_, index) => {
        const joined = index < joinedSlots;
        return (
          <Group
            key={index}
            className={`rounded-full px-4 py-3 ${
              joined
                ? index === 0
                  ? "bg-[#ff4c78] text-white"
                  : "bg-[#41c7c2] text-white"
                : "bg-gray-400/50 text-gray-200"
            }`}
          >
            <span className="text-lg">{joined ? (index === 0 ? "🙂" : "▶") : "◌"}</span>
            <Text fw={600}>
              {joined
                ? index === 0
                  ? "You"
                  : `Player ${index + 1}`
                : "Waiting..."}
            </Text>
            {queuePosition !== null && index === 0 ? (
              <Badge color="dark" variant="filled">
                Pos {queuePosition}
              </Badge>
            ) : null}
          </Group>
        );
      })}
    </Stack>
  );
}

async function routeToLobby(
  accessToken: string,
  lobbyPublicId: string,
  router: ReturnType<typeof useRouter>,
  setIsRoutingMatchedLobby: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void,
): Promise<void> {
  setIsRoutingMatchedLobby(true);
  try {
    await hydrateJoinedLobbyState(accessToken, lobbyPublicId);
    router.push(`/games/online/${lobbyPublicId}`);
  } catch (error) {
    setErrorMessage(
      error instanceof Error && error.message
        ? error.message
        : "Matched lobby is not ready yet.",
    );
    setIsRoutingMatchedLobby(false);
  }
}

async function hydrateJoinedLobbyState(
  accessToken: string,
  lobbyPublicId: string,
): Promise<void> {
  for (const retryDelayMs of JOIN_STATE_HYDRATE_RETRY_DELAYS_MS) {
    try {
      await getPrivateLobbyState(accessToken, lobbyPublicId);
      return;
    } catch {
      await waitMs(retryDelayMs);
    }
  }
}

function toFriendlyRankedQueueError(message: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("last day") ||
    normalized.includes("sgt") ||
    normalized.includes("not available")
  ) {
    return "Ranked queue is only open on the last day of the month (SGT).";
  }

  return message;
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
