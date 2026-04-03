"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import SharedCanvas from "../../_components/SharedCanvas";
import type { CanvasStroke } from "../../_lib/gameSetup";
import {
  getPrivateLobbyState,
  leavePrivateLobby,
  startPrivateLobby,
  updatePrivateLobbySettings,
} from "../_lib/api";
import {
  createOnlineLobbyInitialState,
  onlineLobbyRuntimeReducer,
} from "../_lib/reconcile";
import { createImposterLobbyRealtimeClient } from "../_lib/realtime";
import {
  parseDrawingSnapshot,
  stringifyDrawingSnapshot,
} from "../_lib/snapshot";
import {
  STRUCTURAL_REFRESH_REASONS,
  type MemberState,
  type UpdatePrivateImposterLobbySettingsRequest,
} from "../_lib/types";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface OnlineLobbyRoomScreenProps {
  lobbyPublicId: string;
}

interface SettingsDraft {
  conceptCount: number | "";
  roundsPerConcept: number | "";
  discussionTimerSeconds: number | "";
  imposterGuessTimerSeconds: number | "";
  turnDurationSeconds: number | "";
}

const DEFAULT_SETTINGS_DRAFT: SettingsDraft = {
  conceptCount: 3,
  roundsPerConcept: 3,
  discussionTimerSeconds: 60,
  imposterGuessTimerSeconds: 30,
  turnDurationSeconds: 60,
};

export default function OnlineLobbyRoomScreen({
  lobbyPublicId,
}: OnlineLobbyRoomScreenProps) {
  const { session } = useAuth();
  const router = useRouter();
  const accessToken = session?.access_token ?? null;

  const [state, dispatch] = useReducer(
    onlineLobbyRuntimeReducer,
    lobbyPublicId,
    createOnlineLobbyInitialState,
  );
  const [settingsDraft, setSettingsDraft] = useState<SettingsDraft>(
    DEFAULT_SETTINGS_DRAFT,
  );
  const [selectedVoteTargetPublicId, setSelectedVoteTargetPublicId] =
    useState<string | null>(null);
  const [guessInput, setGuessInput] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticStrokes, setOptimisticStrokes] = useState<CanvasStroke[] | null>(
    null,
  );
  const now = useNow(1000);

  const realtimeRef =
    useRef<ReturnType<typeof createImposterLobbyRealtimeClient> | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  const sharedState = state.sharedState;
  const viewerState = state.viewerState;
  const viewerCapabilities = state.viewerCapabilities;
  const authoritativeStrokes = useMemo(
    () => parseDrawingSnapshot(sharedState?.currentDrawingSnapshot ?? null),
    [sharedState?.currentDrawingSnapshot],
  );
  const renderedStrokes = optimisticStrokes ?? authoritativeStrokes;

  const refreshLobbyState = useCallback(
    async (silent = false) => {
      if (!accessToken) {
        return;
      }

      if (!silent) {
        dispatch({ type: "BOOTSTRAP_LOADING" });
      }

      try {
        const bootstrapState = await getPrivateLobbyState(accessToken, lobbyPublicId);
        dispatch({ type: "BOOTSTRAP_SUCCESS", payload: bootstrapState });
        setErrorMessage(null);
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Could not load lobby state.";
        dispatch({ type: "BOOTSTRAP_ERROR", payload: message });
        setErrorMessage(message);
      }
    },
    [accessToken, lobbyPublicId],
  );

  const scheduleBootstrapRefresh = useCallback(
    (delayMs = 300) => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = window.setTimeout(() => {
        void refreshLobbyState(true);
      }, delayMs);
    },
    [refreshLobbyState],
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void refreshLobbyState();
  }, [accessToken, refreshLobbyState]);

  useEffect(() => {
    if (!sharedState || sharedState.currentPhase !== null) {
      return;
    }

    setSettingsDraft({
      conceptCount: sharedState.conceptCount ?? DEFAULT_SETTINGS_DRAFT.conceptCount,
      roundsPerConcept:
        sharedState.roundsPerConcept ?? DEFAULT_SETTINGS_DRAFT.roundsPerConcept,
      discussionTimerSeconds:
        sharedState.discussionTimerSeconds ??
        DEFAULT_SETTINGS_DRAFT.discussionTimerSeconds,
      imposterGuessTimerSeconds:
        sharedState.imposterGuessTimerSeconds ??
        DEFAULT_SETTINGS_DRAFT.imposterGuessTimerSeconds,
      turnDurationSeconds:
        sharedState.turnDurationSeconds ?? DEFAULT_SETTINGS_DRAFT.turnDurationSeconds,
    });
  }, [
    sharedState,
    sharedState?.conceptCount,
    sharedState?.currentPhase,
    sharedState?.discussionTimerSeconds,
    sharedState?.imposterGuessTimerSeconds,
    sharedState?.roundsPerConcept,
    sharedState?.turnDurationSeconds,
  ]);

  useEffect(() => {
    setOptimisticStrokes(null);
  }, [sharedState?.drawingVersion, sharedState?.currentDrawingSnapshot]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const realtimeClient = createImposterLobbyRealtimeClient(
      lobbyPublicId,
      accessToken,
      {
        onConnect: () => {
          dispatch({ type: "SOCKET_CONNECTED" });
          void refreshLobbyState(true);
        },
        onDisconnect: () => {
          dispatch({ type: "SOCKET_DISCONNECTED" });
          scheduleBootstrapRefresh(500);
        },
        onSharedEnvelope: (envelope) => {
          dispatch({ type: "APPLY_SHARED_ENVELOPE", payload: envelope });
          if (STRUCTURAL_REFRESH_REASONS.has(envelope.reason)) {
            scheduleBootstrapRefresh();
          }
        },
        onViewerEnvelope: (envelope) => {
          dispatch({ type: "APPLY_VIEWER_ENVELOPE", payload: envelope });
          if (STRUCTURAL_REFRESH_REASONS.has(envelope.reason)) {
            scheduleBootstrapRefresh();
          }
        },
        onError: (message) => {
          setErrorMessage(message);
          scheduleBootstrapRefresh();
        },
      },
    );

    realtimeRef.current = realtimeClient;
    realtimeClient.connect();

    return () => {
      realtimeClient.disconnect();
      realtimeRef.current = null;
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [
    accessToken,
    lobbyPublicId,
    refreshLobbyState,
    scheduleBootstrapRefresh,
  ]);

  useEffect(() => {
    if (viewerState?.viewerVoteTargetPublicId) {
      setSelectedVoteTargetPublicId(viewerState.viewerVoteTargetPublicId);
    }
  }, [viewerState?.viewerVoteTargetPublicId]);

  const activeDrawer = useMemo(
    () =>
      findMemberByPublicId(
        sharedState?.activeMembers ?? [],
        sharedState?.currentDrawerPublicId ?? null,
      ),
    [sharedState?.activeMembers, sharedState?.currentDrawerPublicId],
  );

  const votedOutMember = useMemo(
    () =>
      findMemberByPublicId(
        sharedState?.activeMembers ?? [],
        sharedState?.votedOutPublicId ?? null,
      ),
    [sharedState?.activeMembers, sharedState?.votedOutPublicId],
  );
  const viewerMemberPublicId = useMemo(() => {
    if (!sharedState?.activeMembers?.length) {
      return null;
    }

    const identityCandidates = getViewerIdentityCandidates(session);
    if (!identityCandidates.length) {
      return null;
    }

    const normalizedCandidateSet = new Set(
      identityCandidates.map((value) => normalizeIdentityToken(value)),
    );
    const matchedMembers = sharedState.activeMembers.filter((member) => {
      const username = member.username;
      if (!username || !member.learnerPublicId) {
        return false;
      }

      return normalizedCandidateSet.has(normalizeIdentityToken(username));
    });

    if (matchedMembers.length !== 1) {
      return null;
    }

    return matchedMembers[0].learnerPublicId;
  }, [session, sharedState?.activeMembers]);

  useEffect(() => {
    if (!viewerMemberPublicId) {
      return;
    }

    if (selectedVoteTargetPublicId && selectedVoteTargetPublicId === viewerMemberPublicId) {
      setSelectedVoteTargetPublicId(null);
    }
  }, [selectedVoteTargetPublicId, viewerMemberPublicId]);

  const canSubmitVote =
    sharedState?.currentPhase === "VOTING" &&
    !viewerState?.viewerVoteTargetPublicId &&
    Boolean(selectedVoteTargetPublicId) &&
    selectedVoteTargetPublicId !== viewerMemberPublicId &&
    sharedState.eligibleVoteTargetPublicIds.includes(
      selectedVoteTargetPublicId ?? "",
    );

  const canSubmitGuess =
    sharedState?.currentPhase === "IMPOSTER_GUESS" &&
    Boolean(viewerState?.viewerIsImposter) &&
    guessInput.trim().length > 0;

  const handleSaveSettings = async () => {
    if (!accessToken || !sharedState || !viewerCapabilities?.viewerIsHost) {
      return;
    }

    setIsSavingSettings(true);
    setErrorMessage(null);

    const request: UpdatePrivateImposterLobbySettingsRequest = {
      conceptCount: toNullableNumber(settingsDraft.conceptCount),
      roundsPerConcept: toNullableNumber(settingsDraft.roundsPerConcept),
      discussionTimerSeconds: toNullableNumber(settingsDraft.discussionTimerSeconds),
      imposterGuessTimerSeconds: toNullableNumber(
        settingsDraft.imposterGuessTimerSeconds,
      ),
      turnDurationSeconds: toNullableNumber(settingsDraft.turnDurationSeconds),
    };

    try {
      const nextState = await updatePrivateLobbySettings(
        accessToken,
        lobbyPublicId,
        request,
      );
      dispatch({ type: "BOOTSTRAP_SUCCESS", payload: nextState });
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not update settings.",
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleStart = async () => {
    if (!accessToken || !viewerCapabilities?.canStart || isStarting) {
      return;
    }

    setErrorMessage(null);
    setIsStarting(true);

    try {
      const nextState = await startPrivateLobby(accessToken, lobbyPublicId);
      dispatch({ type: "BOOTSTRAP_SUCCESS", payload: nextState });
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not start lobby.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = async () => {
    if (!accessToken || !viewerCapabilities?.canLeave || isLeaving) {
      return;
    }

    setErrorMessage(null);
    setIsLeaving(true);

    try {
      await leavePrivateLobby(accessToken, lobbyPublicId);
      router.push("/games/online");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not leave lobby.",
      );
      setIsLeaving(false);
    }
  };

  const handleStrokeCommit = (stroke: CanvasStroke) => {
    if (!sharedState || !viewerCapabilities?.canSubmitSnapshot) {
      return;
    }

    const nextSnapshotStrokes = [...authoritativeStrokes, stroke];
    setOptimisticStrokes(nextSnapshotStrokes);

    realtimeRef.current?.sendDrawingLive({
      snapshot: stringifyDrawingSnapshot(nextSnapshotStrokes),
      baseVersion: sharedState.drawingVersion,
    });

    scheduleBootstrapRefresh(1200);
  };

  const handleSubmitVote = () => {
    if (!canSubmitVote || !selectedVoteTargetPublicId) {
      return;
    }

    realtimeRef.current?.sendVote({
      suspectedLearnerPublicId: selectedVoteTargetPublicId,
    });
  };

  const handleSubmitGuess = () => {
    if (!canSubmitGuess) {
      return;
    }

    realtimeRef.current?.sendGuess({
      guess: guessInput.trim(),
    });
    setGuessInput("");
  };

  if (!accessToken) {
    return (
      <Container size="md" className="py-6 lg:py-8">
        <Alert color="yellow" radius="lg" variant="light" title="Sign in required">
          Sign in first to enter an online lobby.
        </Alert>
      </Container>
    );
  }

  if (!sharedState && state.status === "loading") {
    return (
      <Container size="md" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Group>
            <Text c="dimmed">Loading lobby...</Text>
          </Group>
        </Card>
      </Container>
    );
  }

  if (!sharedState) {
    return (
      <Container size="md" className="py-6 lg:py-8">
        <Stack gap="md">
          <Alert color="red" radius="lg" variant="light" title="Lobby unavailable">
            {errorMessage ?? "Could not load this lobby."}
          </Alert>
          <Button radius="xl" onClick={() => void refreshLobbyState()}>
            Retry
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-6 lg:py-8">
      <Stack gap="lg">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Online lobby
                </p>
                <Title order={1} className="mt-2 text-3xl text-[var(--color-text)]">
                  Code {sharedState.lobbyCode}
                </Title>
              </div>
              <Badge color={state.connected ? "green" : "orange"} variant="light">
                {state.connected ? "Connected" : "Reconnecting"}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Lobby: {sharedState.publicId}
            </Text>
          </Stack>
        </Card>

        {state.reconnecting ? (
          <Alert color="yellow" radius="lg" variant="light" title="Reconnecting">
            Connection dropped. We are resyncing with authoritative state.
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert color="red" radius="lg" variant="light" title="Sync issue">
            {errorMessage}
          </Alert>
        ) : null}

        {sharedState.currentPhase === null ? (
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Pre-start lobby
                </p>
                <Title order={2} className="mt-2 text-2xl text-[var(--color-text)]">
                  Configure and start
                </Title>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <Text size="sm" c="dimmed" mb={8}>
                  Members ({sharedState.activeMemberCount})
                </Text>
                <Stack gap="xs">
                  {sharedState.activeMembers.map((member) => (
                    <Group key={member.learnerPublicId ?? member.joinedAt} justify="space-between">
                      <Text>{toMemberLabel(member)}</Text>
                      {member.host ? <Badge color="lime">Host</Badge> : null}
                    </Group>
                  ))}
                </Stack>
              </div>

              <Divider />

              <Stack gap="sm">
                <NumberInput
                  label="Concept count"
                  value={settingsDraft.conceptCount}
                  onChange={(value) =>
                    setSettingsDraft((draft) => ({
                      ...draft,
                      conceptCount: toNumberInputValue(value),
                    }))
                  }
                  disabled={!viewerCapabilities?.viewerIsHost}
                />
                <NumberInput
                  label="Rounds per concept"
                  value={settingsDraft.roundsPerConcept}
                  onChange={(value) =>
                    setSettingsDraft((draft) => ({
                      ...draft,
                      roundsPerConcept: toNumberInputValue(value),
                    }))
                  }
                  disabled={!viewerCapabilities?.viewerIsHost}
                />
                <NumberInput
                  label="Discussion timer (seconds)"
                  value={settingsDraft.discussionTimerSeconds}
                  onChange={(value) =>
                    setSettingsDraft((draft) => ({
                      ...draft,
                      discussionTimerSeconds: toNumberInputValue(value),
                    }))
                  }
                  disabled={!viewerCapabilities?.viewerIsHost}
                />
                <NumberInput
                  label="Imposter guess timer (seconds)"
                  value={settingsDraft.imposterGuessTimerSeconds}
                  onChange={(value) =>
                    setSettingsDraft((draft) => ({
                      ...draft,
                      imposterGuessTimerSeconds: toNumberInputValue(value),
                    }))
                  }
                  disabled={!viewerCapabilities?.viewerIsHost}
                />
                <NumberInput
                  label="Turn duration (seconds)"
                  value={settingsDraft.turnDurationSeconds}
                  onChange={(value) =>
                    setSettingsDraft((draft) => ({
                      ...draft,
                      turnDurationSeconds: toNumberInputValue(value),
                    }))
                  }
                  disabled={!viewerCapabilities?.viewerIsHost}
                />
              </Stack>

              <Group>
                <Button
                  radius="xl"
                  loading={isSavingSettings}
                  disabled={!viewerCapabilities?.viewerIsHost}
                  onClick={handleSaveSettings}
                >
                  Save settings
                </Button>
                <Button
                  radius="xl"
                  loading={isStarting}
                  disabled={!viewerCapabilities?.canStart}
                  onClick={handleStart}
                  color="lime"
                >
                  Start game
                </Button>
                <Button
                  radius="xl"
                  variant="default"
                  loading={isLeaving}
                  disabled={!viewerCapabilities?.canLeave}
                  onClick={handleLeave}
                >
                  Leave lobby
                </Button>
              </Group>
            </Stack>
          </Card>
        ) : null}

        {sharedState.currentPhase === "DRAWING" ? (
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Drawing phase
                </p>
                <Title order={2} className="mt-2 text-2xl text-[var(--color-text)]">
                  {activeDrawer ? `${toMemberLabel(activeDrawer)} is drawing` : "Drawing in progress"}
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                  Turn {toDisplayTurnNumber(sharedState.currentTurnIndex)} / {sharedState.totalTurns ?? "-"} ·
                  {" "}
                  {formatDeadline(sharedState.turnEndsAt, now)}
                </Text>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <Text size="sm" c="dimmed" mb={6}>
                  Your role view
                </Text>
                <Text fw={600}>
                  {viewerState?.viewerIsImposter
                    ? "You are the imposter"
                    : viewerState?.viewerConceptTitle ?? "Concept unavailable"}
                </Text>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
                <SharedCanvas
                  strokes={renderedStrokes}
                  readOnly={!viewerCapabilities?.canSubmitSnapshot}
                  activePlayerId={
                    viewerCapabilities?.canSubmitSnapshot
                      ? sharedState.currentDrawerPublicId
                      : undefined
                  }
                  onStrokeCommit={handleStrokeCommit}
                  className="block w-full"
                />
              </div>

              <Text size="sm" c="dimmed">
                {viewerCapabilities?.canSubmitSnapshot
                  ? "You are the current drawer. Your canvas updates stream live."
                  : "You are viewing the shared live canvas."}
              </Text>
            </Stack>
          </Card>
        ) : null}

        {sharedState.currentPhase === "VOTING" ? (
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Voting phase
                </p>
                <Title order={2} className="mt-2 text-2xl text-[var(--color-text)]">
                  Vote for the imposter
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                  Round {sharedState.votingRoundNumber ?? "-"} ·{" "}
                  {formatDeadline(sharedState.votingDeadlineAt, now)}
                </Text>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <Stack gap="xs">
                  {sharedState.eligibleVoteTargetPublicIds.map((targetPublicId) => {
                    const targetMember = findMemberByPublicId(
                      sharedState.activeMembers,
                      targetPublicId,
                    );
                    const isSelfVoteTarget =
                      viewerMemberPublicId !== null &&
                      targetPublicId === viewerMemberPublicId;
                    return (
                      <Button
                        key={targetPublicId}
                        variant={
                          selectedVoteTargetPublicId === targetPublicId
                            ? "filled"
                            : "default"
                        }
                        color="lime"
                        onClick={() => {
                          if (isSelfVoteTarget) {
                            return;
                          }
                          setSelectedVoteTargetPublicId(targetPublicId);
                        }}
                        disabled={Boolean(viewerState?.viewerVoteTargetPublicId) || isSelfVoteTarget}
                        styles={
                          isSelfVoteTarget
                            ? {
                                root: {
                                  opacity: 0.45,
                                  cursor: "not-allowed",
                                },
                              }
                            : undefined
                        }
                      >
                        {targetMember
                          ? `${toMemberLabel(targetMember)}${isSelfVoteTarget ? " (You)" : ""}`
                          : targetPublicId}
                      </Button>
                    );
                  })}
                </Stack>
              </div>

              <Group>
                <Button
                  radius="xl"
                  color="lime"
                  onClick={handleSubmitVote}
                  disabled={!canSubmitVote}
                >
                  Submit vote
                </Button>
                {viewerState?.viewerVoteTargetPublicId ? (
                  <Badge color="blue" variant="light">
                    Vote locked
                  </Badge>
                ) : null}
              </Group>
            </Stack>
          </Card>
        ) : null}

        {sharedState.currentPhase === "IMPOSTER_GUESS" ? (
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Imposter guess
                </p>
                <Title order={2} className="mt-2 text-2xl text-[var(--color-text)]">
                  Final guess window
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                  {formatDeadline(sharedState.imposterGuessDeadlineAt, now)}
                </Text>
              </div>

              {viewerState?.viewerIsImposter ? (
                <Stack gap="md">
                  <TextInput
                    label="Your guess"
                    value={guessInput}
                    onChange={(event) => setGuessInput(event.currentTarget.value)}
                  />
                  <Button
                    radius="xl"
                    color="lime"
                    disabled={!canSubmitGuess}
                    onClick={handleSubmitGuess}
                  >
                    Submit guess
                  </Button>
                </Stack>
              ) : (
                <Alert color="blue" variant="light" radius="lg">
                  Waiting for the imposter to submit a guess.
                </Alert>
              )}
            </Stack>
          </Card>
        ) : null}

        {sharedState.currentPhase === "CONCEPT_RESULT" ||
        sharedState.currentPhase === "MATCH_COMPLETE" ? (
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  {sharedState.currentPhase === "MATCH_COMPLETE"
                    ? "Match complete"
                    : "Concept result"}
                </p>
                <Title order={2} className="mt-2 text-2xl text-[var(--color-text)]">
                  {sharedState.latestConceptResult?.resolution ?? "Waiting for result"}
                </Title>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <Text size="sm" c="dimmed" mb={6}>
                  Scoreboard
                </Text>
                <Stack gap="xs">
                  {sharedState.playerScores
                    .slice()
                    .sort((a, b) => b.points - a.points)
                    .map((scoreRow) => {
                      const member = findMemberByPublicId(
                        sharedState.activeMembers,
                        scoreRow.learnerPublicId,
                      );
                      return (
                        <Group
                          key={scoreRow.learnerPublicId}
                          justify="space-between"
                        >
                          <Text>{member ? toMemberLabel(member) : scoreRow.learnerPublicId}</Text>
                          <Text>{scoreRow.points}</Text>
                        </Group>
                      );
                    })}
                </Stack>
              </div>

              {sharedState.latestConceptResult ? (
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <Text size="sm" c="dimmed" mb={6}>
                    Latest concept
                  </Text>
                  <Text>
                    Winner side: {sharedState.latestConceptResult.winnerSide}
                  </Text>
                  <Text>
                    Accused:{" "}
                    {toMemberLabel(
                      findMemberByPublicId(
                        sharedState.activeMembers,
                        sharedState.latestConceptResult.accusedPublicId,
                      ),
                    )}
                  </Text>
                  <Text>
                    Voted out: {toMemberLabel(votedOutMember)}
                  </Text>
                  <Text>
                    Imposter guess:{" "}
                    {sharedState.latestConceptResult.imposterGuess ?? "No guess"}
                  </Text>
                </div>
              ) : null}
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </Container>
  );
}

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs]);

  return now;
}

function toNullableNumber(value: number | ""): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toNumberInputValue(value: string | number): number | "" {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : "";
  }

  return "";
}

function findMemberByPublicId(
  members: MemberState[],
  learnerPublicId: string | null,
): MemberState | null {
  if (!learnerPublicId) {
    return null;
  }

  return (
    members.find((member) => member.learnerPublicId === learnerPublicId) ?? null
  );
}

function toMemberLabel(member: MemberState | null): string {
  if (!member) {
    return "Unknown";
  }

  return member.username ?? member.learnerPublicId ?? "Unknown";
}

function getViewerIdentityCandidates(session: {
  user?: {
    user_metadata?: Record<string, unknown>;
    email?: string | null;
  } | null;
} | null): string[] {
  const userMetadata = session?.user?.user_metadata ?? {};
  const candidates = [
    userMetadata.username,
    userMetadata.user_name,
    userMetadata.name,
    session?.user?.email ? session.user.email.split("@")[0] : null,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return Array.from(new Set(candidates));
}

function normalizeIdentityToken(value: string): string {
  return value.trim().toLowerCase();
}

function formatDeadline(deadlineAt: string | null, now: number): string {
  if (!deadlineAt) {
    return "No deadline";
  }

  const msRemaining = Date.parse(deadlineAt) - now;
  const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  return `Time left ${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function toDisplayTurnNumber(currentTurnIndex: number | null): number | "-" {
  if (typeof currentTurnIndex !== "number" || !Number.isFinite(currentTurnIndex)) {
    return "-";
  }

  return currentTurnIndex + 1;
}
