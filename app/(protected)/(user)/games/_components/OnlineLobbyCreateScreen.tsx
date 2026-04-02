"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { ApiError } from "@/lib/api/apiErrors";
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  createPrivateImposterLobby,
  getPrivateImposterLobbyState,
  joinPrivateImposterLobby,
  leavePrivateImposterLobby,
  startPrivateImposterLobby,
  toFriendlyCreateLobbyError,
  toFriendlyJoinLobbyError,
  toFriendlyLeaveLobbyError,
  toFriendlyLobbyStateError,
  toFriendlyStartLobbyError,
  type PrivateImposterLobbyState,
} from "../_lib/conceptProvider";
import {
  getConceptPoolModeLabel,
  IMPOSTER_CONCEPT_POOL_OPTIONS,
} from "../_lib/conceptPoolOptions";
import type { ImposterConceptPoolMode } from "../_lib/gameSetup";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

const LOBBY_STATE_POLL_INTERVAL_MS = 2500;

type OnlineLobbyEntryMode = "create" | "join";

function toPinnedMonthLabel(pinnedYearMonth: string | null): string {
  const fallback = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

  if (!pinnedYearMonth) {
    return `Current month (${fallback})`;
  }

  const [yearRaw, monthRaw] = pinnedYearMonth.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return `Current month (${fallback})`;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));
  return `Current month (${date.toLocaleDateString(undefined, { month: "long", year: "numeric" })})`;
}

function toLobbyStateCardTitle(lobbyState: PrivateImposterLobbyState): string {
  if (lobbyState.startedAt) {
    return "Game started";
  }

  return "Lobby ready";
}

export default function OnlineLobbyCreateScreen() {
  const { session } = useAuth();
  const [mode, setMode] = useState<OnlineLobbyEntryMode>("create");
  const [conceptPoolMode, setConceptPoolMode] = useState<ImposterConceptPoolMode>("FULL_CONCEPT_POOL");
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");

  const [currentLobbyPublicId, setCurrentLobbyPublicId] = useState<string | null>(null);
  const [lobbyState, setLobbyState] = useState<PrivateImposterLobbyState | null>(null);

  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [isRefreshingLobbyState, setIsRefreshingLobbyState] = useState(false);
  const [isStartingLobby, setIsStartingLobby] = useState(false);
  const [isLeavingLobby, setIsLeavingLobby] = useState(false);

  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const [lobbyStateErrorMessage, setLobbyStateErrorMessage] = useState<string | null>(null);
  const [startErrorMessage, setStartErrorMessage] = useState<string | null>(null);
  const [leaveErrorMessage, setLeaveErrorMessage] = useState<string | null>(null);

  const hasActiveLobby = Boolean(currentLobbyPublicId && lobbyState);

  const isAnyLobbyActionLoading = useMemo(
    () => isRefreshingLobbyState || isStartingLobby || isLeavingLobby,
    [isRefreshingLobbyState, isStartingLobby, isLeavingLobby],
  );

  const clearLobbyActionMessages = () => {
    setLobbyStateErrorMessage(null);
    setStartErrorMessage(null);
    setLeaveErrorMessage(null);
  };

  const exitLobbyScreen = useCallback(() => {
    setLobbyState(null);
    setCurrentLobbyPublicId(null);
    setCopyStatus(null);
    setLobbyCodeInput("");
    setIsLeaveConfirmOpen(false);
    clearLobbyActionMessages();
  }, []);

  const fetchLobbyState = useCallback(
    async (lobbyPublicId: string, silent = false): Promise<PrivateImposterLobbyState | null> => {
      const accessToken = session?.access_token;

      if (!accessToken) {
        setLobbyStateErrorMessage("You need to be signed in before viewing this lobby.");
        return null;
      }

      if (!silent) {
        setIsRefreshingLobbyState(true);
      }

      try {
        const nextLobbyState = await getPrivateImposterLobbyState(accessToken, lobbyPublicId);
        setLobbyState(nextLobbyState);
        setCurrentLobbyPublicId(nextLobbyState.publicId);
        setLobbyStateErrorMessage(null);
        return nextLobbyState;
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            notifications.show({
              color: "orange",
              title: "Lobby closed",
              message: "This lobby no longer exists.",
            });
            exitLobbyScreen();
            return null;
          }

          if (error.status === 403) {
            notifications.show({
              color: "orange",
              title: "Access removed",
              message: "You are no longer allowed in this lobby.",
            });
            exitLobbyScreen();
            return null;
          }
        }

        setLobbyStateErrorMessage(
          toFriendlyLobbyStateError(error) ?? "We could not load this lobby right now. Please try again.",
        );
        return null;
      } finally {
        if (!silent) {
          setIsRefreshingLobbyState(false);
        }
      }
    },
    [exitLobbyScreen, session?.access_token],
  );

  useEffect(() => {
    if (!currentLobbyPublicId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchLobbyState(currentLobbyPublicId, true);
    }, LOBBY_STATE_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentLobbyPublicId, fetchLobbyState]);

  const handleCreateLobby = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const accessToken = session?.access_token;

    if (!accessToken) {
      setCreateErrorMessage("You need to be signed in before creating an online lobby.");
      return;
    }

    setIsSubmittingCreate(true);
    setCreateErrorMessage(null);
    setJoinErrorMessage(null);
    clearLobbyActionMessages();
    setCopyStatus(null);

    try {
      const lobby = await createPrivateImposterLobby(accessToken, conceptPoolMode);
      setCurrentLobbyPublicId(lobby.publicId);
      await fetchLobbyState(lobby.publicId);
    } catch (error) {
      setLobbyState(null);
      setCurrentLobbyPublicId(null);
      setCreateErrorMessage(
        toFriendlyCreateLobbyError(error) ?? "We could not create the private lobby right now. Please try again.",
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleJoinLobby = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const accessToken = session?.access_token;

    if (!accessToken) {
      setJoinErrorMessage("You need to be signed in before joining an online lobby.");
      return;
    }

    const normalizedLobbyCode = lobbyCodeInput.trim().toUpperCase();

    if (!normalizedLobbyCode) {
      setJoinErrorMessage("Enter a lobby code to join.");
      return;
    }

    setIsSubmittingJoin(true);
    setCreateErrorMessage(null);
    setJoinErrorMessage(null);
    clearLobbyActionMessages();
    setCopyStatus(null);

    try {
      const lobby = await joinPrivateImposterLobby(accessToken, normalizedLobbyCode);
      setLobbyCodeInput(lobby.lobbyCode);
      setCurrentLobbyPublicId(lobby.publicId);
      await fetchLobbyState(lobby.publicId);
    } catch (error) {
      setLobbyState(null);
      setCurrentLobbyPublicId(null);
      setJoinErrorMessage(toFriendlyJoinLobbyError(error) ?? "We could not join that lobby right now. Please try again.");
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const handleStartLobby = async () => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      setStartErrorMessage("You need to be signed in before starting this lobby.");
      return;
    }

    if (!currentLobbyPublicId) {
      return;
    }

    setIsStartingLobby(true);
    setStartErrorMessage(null);
    setLeaveErrorMessage(null);
    setLobbyStateErrorMessage(null);

    try {
      await startPrivateImposterLobby(accessToken, currentLobbyPublicId);
      await fetchLobbyState(currentLobbyPublicId);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          notifications.show({
            color: "orange",
            title: "Access removed",
            message: "You are no longer allowed to manage this lobby.",
          });
          exitLobbyScreen();
          return;
        }

        if (error.status === 404) {
          notifications.show({
            color: "orange",
            title: "Lobby closed",
            message: "This lobby no longer exists.",
          });
          exitLobbyScreen();
          return;
        }

        if (error.status === 409) {
          setStartErrorMessage(toFriendlyStartLobbyError(error) ?? "This lobby cannot be started right now.");
          await fetchLobbyState(currentLobbyPublicId);
          return;
        }
      }

      setStartErrorMessage(toFriendlyStartLobbyError(error) ?? "We could not start this lobby right now. Please try again.");
    } finally {
      setIsStartingLobby(false);
    }
  };

  const handleLeaveLobby = async () => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      setLeaveErrorMessage("You need to be signed in before leaving this lobby.");
      return;
    }

    if (!currentLobbyPublicId) {
      return;
    }

    setIsLeavingLobby(true);
    setStartErrorMessage(null);
    setLeaveErrorMessage(null);
    setLobbyStateErrorMessage(null);

    try {
      const response = await leavePrivateImposterLobby(accessToken, currentLobbyPublicId);

      if (response.result === "LEFT") {
        if (response.lobbyState) {
          setLobbyState(response.lobbyState);
          setCurrentLobbyPublicId(response.lobbyState.publicId);
          notifications.show({
            color: "blue",
            title: "Left lobby",
            message: "You left the lobby.",
          });
        } else {
          await fetchLobbyState(currentLobbyPublicId);
        }
      } else if (response.result === "LEFT_AND_PROMOTED_HOST") {
        if (response.lobbyState) {
          setLobbyState(response.lobbyState);
          setCurrentLobbyPublicId(response.lobbyState.publicId);
        } else {
          await fetchLobbyState(currentLobbyPublicId);
        }
        notifications.show({
          color: "blue",
          title: "New host assigned",
          message: "You left. Host role moved to another player.",
        });
      } else if (response.result === "LEFT_AND_LOBBY_DELETED") {
        notifications.show({
          color: "orange",
          title: "Lobby closed",
          message: "You left. Lobby was closed because no players remained.",
        });
        exitLobbyScreen();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          notifications.show({
            color: "orange",
            title: "Access removed",
            message: "You are no longer allowed in this lobby.",
          });
          exitLobbyScreen();
          return;
        }

        if (error.status === 404) {
          notifications.show({
            color: "orange",
            title: "Lobby closed",
            message: "This lobby no longer exists.",
          });
          exitLobbyScreen();
          return;
        }

        if (error.status === 409) {
          setLeaveErrorMessage(toFriendlyLeaveLobbyError(error) ?? "You cannot leave this lobby right now.");
          await fetchLobbyState(currentLobbyPublicId);
          return;
        }
      }

      setLeaveErrorMessage(toFriendlyLeaveLobbyError(error) ?? "We could not leave this lobby right now. Please try again.");
      await fetchLobbyState(currentLobbyPublicId);
    } finally {
      setIsLeavingLobby(false);
      setIsLeaveConfirmOpen(false);
    }
  };

  const handleCopyLobbyCode = async () => {
    if (!lobbyState?.lobbyCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(lobbyState.lobbyCode);
      setCopyStatus("Lobby code copied.");
    } catch {
      setCopyStatus("Could not copy automatically. Please copy the code manually.");
    }
  };

  const handleModeChange = (value: string) => {
    const nextMode = value as OnlineLobbyEntryMode;
    setMode(nextMode);
    setCreateErrorMessage(null);
    setJoinErrorMessage(null);
    clearLobbyActionMessages();
    setCopyStatus(null);
    setLobbyCodeInput("");
  };

  return (
    <Stack gap="lg">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Online lobby
        </p>
        <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Create or join a private online lobby
        </Title>
        <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
          Create a private lobby as host, or join an existing one with a lobby code.
        </Text>
      </Card>

      <Modal
        opened={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
        title="Leave lobby?"
        centered
      >
        <Stack>
          <Text size="sm" className="text-[var(--color-text-secondary)]">
            Are you sure you want to leave?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsLeaveConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" loading={isLeavingLobby} onClick={handleLeaveLobby}>
              Leave lobby
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="sm">
          <Text size="sm" fw={600} className="text-[var(--color-text)]">
            Action
          </Text>
          <SegmentedControl
            fullWidth
            radius="xl"
            value={mode}
            onChange={handleModeChange}
            data={[
              { label: "Create", value: "create" },
              { label: "Join", value: "join" },
            ]}
          />
        </Stack>
      </Card>

      {mode === "create" ? (
        <form onSubmit={handleCreateLobby}>
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <div>
                <Text size="sm" fw={600} className="mb-2 text-[var(--color-text)]">
                  Concept source
                </Text>
                <SegmentedControl
                  fullWidth
                  radius="xl"
                  value={conceptPoolMode}
                  onChange={(value) => setConceptPoolMode(value as ImposterConceptPoolMode)}
                  data={IMPOSTER_CONCEPT_POOL_OPTIONS}
                />
              </div>

              {createErrorMessage ? (
                <Alert color="red" radius="lg" variant="light" title="Lobby could not be created">
                  {createErrorMessage}
                </Alert>
              ) : null}

              <Button
                type="submit"
                radius="xl"
                size="lg"
                className="min-h-12"
                loading={isSubmittingCreate}
                disabled={!session?.access_token || isAnyLobbyActionLoading}
                styles={{
                  root: {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  },
                }}
              >
                Create private lobby
              </Button>
            </Stack>
          </Card>
        </form>
      ) : (
        <form onSubmit={handleJoinLobby}>
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <TextInput
                label="Lobby code"
                placeholder="Enter code"
                value={lobbyCodeInput}
                onChange={(event) => setLobbyCodeInput(event.currentTarget.value.toUpperCase())}
                size="md"
                autoCapitalize="characters"
                spellCheck={false}
                styles={{
                  label: {
                    color: "var(--color-text)",
                    marginBottom: "10px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  },
                  input: {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    textTransform: "uppercase",
                  },
                }}
              />

              {joinErrorMessage ? (
                <Alert color="red" radius="lg" variant="light" title="Lobby could not be joined">
                  {joinErrorMessage}
                </Alert>
              ) : null}

              <Button
                type="submit"
                radius="xl"
                size="lg"
                className="min-h-12"
                loading={isSubmittingJoin}
                disabled={!session?.access_token || isAnyLobbyActionLoading}
                styles={{
                  root: {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  },
                }}
              >
                Join private lobby
              </Button>
            </Stack>
          </Card>
        </form>
      )}

      {hasActiveLobby && lobbyState ? (
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              {toLobbyStateCardTitle(lobbyState)}
            </p>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <Group justify="space-between" align="center">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Lobby code</p>
                  <Code className="mt-2 text-base">{lobbyState.lobbyCode}</Code>
                </div>
                <Badge radius="sm" variant="light" color={lobbyState.startedAt ? "teal" : "blue"}>
                  {lobbyState.startedAt ? "Started" : "Pre-game"}
                </Badge>
              </Group>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-[var(--color-text-secondary)]">
              Source: {getConceptPoolModeLabel(lobbyState.conceptPoolMode)}
              <br />
              Pinned month: {toPinnedMonthLabel(lobbyState.pinnedYearMonth)}
              <br />
              Created: {new Date(lobbyState.createdAt).toLocaleString()}
              <br />
              Active players: {lobbyState.activeMemberCount}
              <br />
              Status: {lobbyState.startedAt ? `Started at ${new Date(lobbyState.startedAt).toLocaleString()}` : "Waiting to start"}
            </div>

            {lobbyState.viewerIsHost && !lobbyState.canStart && !lobbyState.startedAt ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                Need at least 3 active players before starting.
              </Text>
            ) : null}

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-[var(--color-text-secondary)]">
              <Text fw={600} size="sm" className="mb-2 text-[var(--color-text)]">
                Active members
              </Text>
              {lobbyState.activeMembers.length === 0 ? (
                <Text size="sm" className="text-[var(--color-text-secondary)]">
                  No active members yet.
                </Text>
              ) : (
                <Stack gap={6}>
                  {lobbyState.activeMembers.map((member) => (
                    <Group key={member.learnerPublicId} justify="space-between" wrap="nowrap" gap="xs">
                      <Text size="sm" className="truncate text-[var(--color-text-secondary)]">
                        {member.username}
                        {" • Joined "}
                        {new Date(member.joinedAt).toLocaleString()}
                      </Text>
                      {member.host ? (
                        <Badge size="xs" radius="sm" color="yellow" variant="light">
                          Host
                        </Badge>
                      ) : null}
                    </Group>
                  ))}
                </Stack>
              )}
            </div>

            {lobbyStateErrorMessage ? (
              <Alert color="red" radius="lg" variant="light" title="Lobby could not be refreshed">
                {lobbyStateErrorMessage}
              </Alert>
            ) : null}

            {startErrorMessage ? (
              <Alert color="red" radius="lg" variant="light" title="Lobby could not be started">
                {startErrorMessage}
              </Alert>
            ) : null}

            {leaveErrorMessage ? (
              <Alert color="red" radius="lg" variant="light" title="Lobby could not be left">
                {leaveErrorMessage}
              </Alert>
            ) : null}

            <Group>
              {lobbyState.canStart ? (
                <Button
                  type="button"
                  radius="xl"
                  onClick={handleStartLobby}
                  loading={isStartingLobby}
                  disabled={isRefreshingLobbyState || isLeavingLobby}
                  styles={{
                    root: {
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-background)",
                    },
                  }}
                >
                  Start game
                </Button>
              ) : null}

              {lobbyState.canLeave ? (
                <Button
                  type="button"
                  radius="xl"
                  variant="default"
                  onClick={() => setIsLeaveConfirmOpen(true)}
                  disabled={isRefreshingLobbyState || isStartingLobby || isLeavingLobby}
                >
                  Leave
                </Button>
              ) : null}

              <Button
                type="button"
                radius="xl"
                variant="default"
                onClick={handleCopyLobbyCode}
                disabled={isAnyLobbyActionLoading}
              >
                Copy lobby code
              </Button>
            </Group>

            {copyStatus ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                {copyStatus}
              </Text>
            ) : null}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
