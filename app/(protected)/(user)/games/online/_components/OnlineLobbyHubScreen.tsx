"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Button,
  Card,
  Container,
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
const JOIN_STATE_HYDRATE_RETRY_DELAYS_MS = [200, 400, 700];

export default function OnlineLobbyHubScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const [conceptPoolMode, setConceptPoolMode] =
    useState<LobbyConceptPoolMode>("CURRENT_MONTH_PACK");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const accessToken = session?.access_token ?? null;
  const isRankedVisible = resolveRankedVisibility();
  const shouldAutoRankedSearch =
    isRankedVisible && searchParams.get("ranked") === "1";
  const rankedQueue = useRankedMatchmakingQueue(
    shouldAutoRankedSearch ? accessToken : null,
  );
  const {
    state: rankedQueueState,
    isSearching,
    isBusy,
    matchedLobbyPublicId,
    hydrateStatus,
    enqueue,
    applyMatchmakingEvent,
  } = rankedQueue;
  const matchmakingRealtimeRef = useRef<ReturnType<
    typeof createRankedMatchmakingRealtimeClient
  > | null>(null);
  const autoRankedQueuedRef = useRef(false);
  const routedMatchedLobbyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldAutoRankedSearch || !accessToken) {
      return;
    }
    void hydrateStatus();
  }, [accessToken, hydrateStatus, shouldAutoRankedSearch]);

  useEffect(() => {
    if (!shouldAutoRankedSearch || !accessToken) {
      autoRankedQueuedRef.current = false;
      return;
    }
    if (autoRankedQueuedRef.current || isBusy) {
      return;
    }

    const currentState = rankedQueueState.status?.state ?? "IDLE";
    if (currentState === "QUEUED" || currentState === "MATCHED") {
      autoRankedQueuedRef.current = true;
      return;
    }

    autoRankedQueuedRef.current = true;
    void enqueue();
  }, [accessToken, enqueue, isBusy, rankedQueueState.status?.state, shouldAutoRankedSearch]);

  useEffect(() => {
    if (!shouldAutoRankedSearch || !accessToken) {
      return;
    }

    const realtimeClient = createRankedMatchmakingRealtimeClient(accessToken, {
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
      onError: () => {
        void hydrateStatus();
      },
    });

    matchmakingRealtimeRef.current = realtimeClient;
    realtimeClient.connect();

    return () => {
      realtimeClient.disconnect();
      matchmakingRealtimeRef.current = null;
    };
  }, [accessToken, applyMatchmakingEvent, hydrateStatus, shouldAutoRankedSearch]);

  useEffect(() => {
    if (!accessToken || !matchedLobbyPublicId) {
      return;
    }
    if (routedMatchedLobbyRef.current === matchedLobbyPublicId) {
      return;
    }

    routedMatchedLobbyRef.current = matchedLobbyPublicId;
    void hydrateJoinedLobbyState(accessToken, matchedLobbyPublicId)
      .then(() => {
        router.push(`/games/online/${matchedLobbyPublicId}`);
      })
      .catch((error: unknown) => {
        routedMatchedLobbyRef.current = null;
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "Matched ranked lobby is not ready yet.",
        );
      });
  }, [accessToken, matchedLobbyPublicId, router]);

  const rankedInfoMessage = useMemo(() => {
    if (!shouldAutoRankedSearch) {
      return null;
    }

    if (matchedLobbyPublicId) {
      return "Match found. Entering lobby...";
    }

    if (isSearching || isBusy) {
      return "Searching for ranked match...";
    }

    return null;
  }, [isBusy, isSearching, matchedLobbyPublicId, shouldAutoRankedSearch]);

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
            <Title
              order={1}
              className="text-center text-3xl font-semibold tracking-tight text-[var(--color-text)]"
            >
              Online Imposter
            </Title>
            <Text size="sm" className="text-center text-[var(--color-text-secondary)]">
              Choose how you want to play.
            </Text>

            {!accessToken ? (
              <Alert color="yellow" radius="lg" variant="light" title="Sign in required">
                You need to be signed in before creating or joining a lobby.
              </Alert>
            ) : null}

            {errorMessage ? (
              <Alert color="red" radius="lg" variant="light" title="Action failed">
                {errorMessage}
              </Alert>
            ) : null}

            {shouldAutoRankedSearch ? (
              <Alert color="blue" radius="lg" variant="light" title="Ranked mode">
                {rankedInfoMessage ?? "Preparing ranked matchmaking..."}
              </Alert>
            ) : null}
          </Stack>
        </Card>

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
              styles={{
                label: {
                  color: "var(--color-text)",
                  marginBottom: "10px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                },
              }}
            >
              <Stack gap="xs">
                <Radio value="CURRENT_MONTH_PACK" label="Current month pack" color="lime" />
                <Radio value="FULL_CONCEPT_POOL" label="Full concept pool" color="lime" />
              </Stack>
            </Radio.Group>

            <Button
              radius="xl"
              size="lg"
              className="min-h-12"
              onClick={handleCreate}
              loading={isCreating}
              disabled={!accessToken}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
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

              <Button
                type="submit"
                radius="xl"
                size="lg"
                className="min-h-12"
                loading={isJoining}
                disabled={!accessToken}
                styles={{
                  root: {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  },
                }}
              >
                Join lobby
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
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

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function resolveRankedVisibility(): boolean {
  const enabled = process.env.NEXT_PUBLIC_RANKED_ENABLED === "true";
  const forceDev = process.env.NEXT_PUBLIC_RANKED_FORCE_DEV === "true";
  const isProduction = process.env.NODE_ENV === "production";
  return enabled || (!isProduction && forceDev);
}
