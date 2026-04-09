"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  fetchFriends,
  getFriendsLoadErrorMessage,
  type Friend,
} from "@/lib/utils/friends";
import {
  cancelPrivateInvite,
  getPrivateInvites,
  type PrivateLobbyInviteStatus,
} from "@/lib/utils/gameLobbyInvites";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Group,
  Modal,
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
  kickPrivateLobbyMember,
  leavePrivateLobby,
  sendPrivateLobbyInvites,
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
  type LobbyEndReason,
  type LobbyPhase,
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
const DEFAULT_DRAW_COLOR = "#111111";
const AUTO_DONE_LEAD_MS = 1500;
const LIVE_DRAWING_FLAG_ENABLED =
  process.env.NEXT_PUBLIC_IMPOSTER_DRAWING_LIVE_ENABLED === "true";

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
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKickedModalOpen, setIsKickedModalOpen] = useState(false);
  const [kickingMemberPublicId, setKickingMemberPublicId] = useState<string | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [friendsErrorMessage, setFriendsErrorMessage] = useState<string | null>(null);
  const [outgoingInviteStatusByFriendId, setOutgoingInviteStatusByFriendId] =
    useState<Record<string, PrivateLobbyInviteStatus>>({});
  const [isOutgoingInvitesLoading, setIsOutgoingInvitesLoading] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [inviteFeedbackMessage, setInviteFeedbackMessage] = useState<string | null>(null);
  const [optimisticStrokes, setOptimisticStrokes] = useState<CanvasStroke[] | null>(
    null,
  );
  const [isSubmittingDrawingDone, setIsSubmittingDrawingDone] = useState(false);
  const [drawingDoneBaseSharedVersion, setDrawingDoneBaseSharedVersion] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_DRAW_COLOR);
  const [serverClockOffsetMs, setServerClockOffsetMs] = useState(0);
  const [isLiveDrawingEnabled, setIsLiveDrawingEnabled] = useState(
    LIVE_DRAWING_FLAG_ENABLED,
  );
  const now = useNow(1000, serverClockOffsetMs);

  const realtimeRef =
    useRef<ReturnType<typeof createImposterLobbyRealtimeClient> | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);
  const previousPhaseRef = useRef<LobbyPhase>(null);
  const isSubmittingDrawingDoneRef = useRef(isSubmittingDrawingDone);
  const autoDoneTurnKeyRef = useRef<string | null>(null);

  const sharedState = state.sharedState;
  const currentPhase = sharedState?.currentPhase ?? null;
  const isTerminalPhase = isTerminalLobbyPhase(currentPhase);
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
    const previousPhase = previousPhaseRef.current;
    previousPhaseRef.current = sharedState?.currentPhase ?? null;

    if (
      !accessToken ||
      sharedState?.currentPhase !== "ABANDONED" ||
      previousPhase === "ABANDONED"
    ) {
      return;
    }

    void refreshLobbyState(true);
  }, [accessToken, refreshLobbyState, sharedState?.currentPhase]);

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
    setOptimisticStrokes(null);
  }, [sharedState?.currentConceptIndex]);

  useEffect(() => {
    isSubmittingDrawingDoneRef.current = isSubmittingDrawingDone;
  }, [isSubmittingDrawingDone]);

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
          syncServerClockOffset(setServerClockOffsetMs, envelope.emittedAt);
          dispatch({ type: "APPLY_SHARED_ENVELOPE", payload: envelope });
          if (STRUCTURAL_REFRESH_REASONS.has(envelope.reason)) {
            scheduleBootstrapRefresh();
          }
        },
        onViewerEnvelope: (envelope) => {
          syncServerClockOffset(setServerClockOffsetMs, envelope.emittedAt);
          dispatch({ type: "APPLY_VIEWER_ENVELOPE", payload: envelope });
          if (STRUCTURAL_REFRESH_REASONS.has(envelope.reason)) {
            scheduleBootstrapRefresh();
          }
        },
        onError: (message) => {
          if (isLiveDrawingDisabledMessage(message)) {
            setIsLiveDrawingEnabled(false);
            return;
          }

          if (isLiveDrawingVersionConflict(message)) {
            setOptimisticStrokes(null);
            void refreshLobbyState(true);
            return;
          }

          if (isSessionAbandonedError(message)) {
            setIsSubmittingDrawingDone(false);
            setDrawingDoneBaseSharedVersion(null);
            setErrorMessage(
              getAbandonedConflictMessage(message, sharedState?.endReason ?? null),
            );
            void refreshLobbyState(true);
            return;
          }

          if (
            isSubmittingDrawingDoneRef.current &&
            isDoneSubmitConflictOrPhaseError(message)
          ) {
            setIsSubmittingDrawingDone(false);
            setDrawingDoneBaseSharedVersion(null);
            void refreshLobbyState(true);
            return;
          }
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
    sharedState?.endReason,
  ]);

  useEffect(() => {
    if (viewerState?.viewerVoteTargetPublicId) {
      setSelectedVoteTargetPublicId(viewerState.viewerVoteTargetPublicId);
    }
  }, [viewerState?.viewerVoteTargetPublicId]);

  useEffect(() => {
    if (
      !accessToken ||
      currentPhase === null ||
      isTerminalLobbyPhase(currentPhase)
    ) {
      return;
    }

    const reconcileIntervalId = window.setInterval(() => {
      void refreshLobbyState(true);
    }, 3000);

    return () => {
      window.clearInterval(reconcileIntervalId);
    };
  }, [accessToken, currentPhase, refreshLobbyState]);

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
  const abandonedByMember = useMemo(
    () =>
      findMemberByPublicId(
        sharedState?.activeMembers ?? [],
        sharedState?.endedByPublicId ?? null,
      ),
    [sharedState?.activeMembers, sharedState?.endedByPublicId],
  );
  const abandonedCopy = useMemo(
    () => getAbandonedCopy(sharedState?.endReason ?? null),
    [sharedState?.endReason],
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
  const reconnectingLearners = useMemo(
    () => sharedState?.reconnectingLearners ?? [],
    [sharedState?.reconnectingLearners],
  );
  const reconnectingLearnerPublicIds = useMemo(
    () => reconnectingLearners.map((entry) => entry.learnerPublicId),
    [reconnectingLearners],
  );
  const reconnectingMembers = useMemo(
    () =>
      reconnectingLearners
        .map((entry) =>
          findMemberByPublicId(sharedState?.activeMembers ?? [], entry.learnerPublicId),
        )
        .filter((member): member is MemberState => member !== null),
    [reconnectingLearners, sharedState?.activeMembers],
  );
  const viewerIsReconnecting =
    viewerMemberPublicId !== null &&
    reconnectingLearnerPublicIds.includes(viewerMemberPublicId);
  const viewerIdentityTokenSet = useMemo(
    () =>
      new Set(
        getViewerIdentityCandidates(session).map((value) =>
          normalizeIdentityToken(value)),
      ),
    [session],
  );
  const reconnectingOthers = useMemo(
    () =>
      reconnectingMembers.filter(
        (member) => member.learnerPublicId !== viewerMemberPublicId,
      ),
    [reconnectingMembers, viewerMemberPublicId],
  );
  const activeLobbyMemberPublicIds = useMemo(
    () =>
      new Set(
        (sharedState?.activeMembers ?? [])
          .map((member) => member.learnerPublicId)
          .filter((publicId): publicId is string => Boolean(publicId)),
      ),
    [sharedState?.activeMembers],
  );
  const invitableFriends = useMemo(
    () =>
      friends.filter((friend) => !activeLobbyMemberPublicIds.has(friend.publicId)),
    [activeLobbyMemberPublicIds, friends],
  );
  const selectableInvitableFriends = useMemo(
    () =>
      invitableFriends.filter(
        (friend) => outgoingInviteStatusByFriendId[friend.publicId] !== "PENDING",
      ),
    [invitableFriends, outgoingInviteStatusByFriendId],
  );
  const viewerReconnectEntry = useMemo(
    () =>
      viewerMemberPublicId
        ? reconnectingLearners.find(
            (entry) => entry.learnerPublicId === viewerMemberPublicId,
          ) ?? null
        : null,
    [reconnectingLearners, viewerMemberPublicId],
  );
  const viewerReconnectSecondsLeft = useMemo(
    () => toSecondsLeft(viewerReconnectEntry?.disconnectDeadlineAt ?? null, now),
    [now, viewerReconnectEntry?.disconnectDeadlineAt],
  );
  const nearestReconnectSecondsLeft = useMemo(() => {
    const seconds = reconnectingLearners
      .map((entry) => toSecondsLeft(entry.disconnectDeadlineAt, now))
      .filter((value): value is number => value !== null);
    if (!seconds.length) {
      return null;
    }
    return Math.min(...seconds);
  }, [now, reconnectingLearners]);

  useEffect(() => {
    if (!viewerMemberPublicId) {
      return;
    }

    if (selectedVoteTargetPublicId && selectedVoteTargetPublicId === viewerMemberPublicId) {
      setSelectedVoteTargetPublicId(null);
    }
  }, [selectedVoteTargetPublicId, viewerMemberPublicId]);

  const isSelectedVoteTargetSelf = useMemo(() => {
    if (!selectedVoteTargetPublicId) {
      return false;
    }

    const selectedTargetMember = findMemberByPublicId(
      sharedState?.activeMembers ?? [],
      selectedVoteTargetPublicId,
    );

    return isViewerVoteTarget(
      selectedVoteTargetPublicId,
      selectedTargetMember,
      viewerMemberPublicId,
      viewerIdentityTokenSet,
    );
  }, [
    selectedVoteTargetPublicId,
    sharedState?.activeMembers,
    viewerIdentityTokenSet,
    viewerMemberPublicId,
  ]);

  useEffect(() => {
    if (!isSelectedVoteTargetSelf) {
      return;
    }

    setSelectedVoteTargetPublicId(null);
  }, [isSelectedVoteTargetSelf]);

  const canSubmitVote =
    !isTerminalPhase &&
    sharedState?.currentPhase === "VOTING" &&
    !viewerState?.viewerVoteTargetPublicId &&
    Boolean(selectedVoteTargetPublicId) &&
    !isSelectedVoteTargetSelf &&
    sharedState.eligibleVoteTargetPublicIds.includes(
      selectedVoteTargetPublicId ?? "",
    );

  const canSubmitGuess =
    !isTerminalPhase &&
    sharedState?.currentPhase === "IMPOSTER_GUESS" &&
    Boolean(viewerState?.viewerIsImposter) &&
    guessInput.trim().length > 0;
  const canSubmitDrawingDone =
    !isTerminalPhase &&
    sharedState?.currentPhase === "DRAWING" &&
    Boolean(viewerCapabilities?.viewerIsCurrentDrawer) &&
    Boolean(viewerCapabilities?.canSubmitSnapshot) &&
    !isSubmittingDrawingDone;
  const viewerDrawingHint = viewerCapabilities?.canSubmitSnapshot
    ? isLiveDrawingEnabled
      ? "You are the current drawer. Your strokes sync live, then press Done to advance the turn."
      : "You are the current drawer. Draw locally, then press Done to submit."
    : isLiveDrawingEnabled
      ? "Watch live canvas updates as the current drawer draws."
      : "You can only see canvas updates after the drawer presses Done.";

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

  const executeLeave = async () => {
    if (!accessToken || !viewerCapabilities?.canLeave || isLeaving) {
      return;
    }

    setErrorMessage(null);
    setIsLeaving(true);

    try {
      const leaveResponse = await leavePrivateLobby(accessToken, lobbyPublicId);
      if (
        leaveResponse.result === "LEFT_AND_SESSION_ABANDONED" &&
        leaveResponse.lobbyState
      ) {
        dispatch({ type: "BOOTSTRAP_SUCCESS", payload: leaveResponse.lobbyState });
        setIsLeaving(false);
        return;
      }

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

  const shouldConfirmLeave = useMemo(() => {
    if (!sharedState) {
      return false;
    }

    const hasStartedGame = sharedState.currentPhase !== null;
    return hasStartedGame && !isTerminalLobbyPhase(sharedState.currentPhase);
  }, [sharedState]);

  const handleLeave = () => {
    if (shouldConfirmLeave) {
      setIsLeaveConfirmOpen(true);
      return;
    }

    void executeLeave();
  };

  const handleCopyLobbyCode = async () => {
    if (!sharedState?.lobbyCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(sharedState.lobbyCode);
      setIsCodeCopied(true);
      window.setTimeout(() => {
        setIsCodeCopied(false);
      }, 1500);
    } catch {
      setErrorMessage("Could not copy lobby code. Please copy it manually.");
    }
  };

  const handleKickMember = async (memberPublicId: string) => {
    if (!accessToken || !viewerCapabilities?.viewerIsHost || kickingMemberPublicId) {
      return;
    }

    setKickingMemberPublicId(memberPublicId);
    setErrorMessage(null);

    try {
      await kickPrivateLobbyMember(accessToken, lobbyPublicId, { memberPublicId });
      const outgoingInvites = await getPrivateInvites(accessToken, "outgoing");
      const pendingInviteIdsToCancel = outgoingInvites
        .filter((invite) =>
          invite.lobbyPublicId === lobbyPublicId
          && invite.receiverPublicId === memberPublicId
          && invite.status === "PENDING")
        .map((invite) => invite.invitePublicId);

      if (pendingInviteIdsToCancel.length > 0) {
        await Promise.allSettled(
          pendingInviteIdsToCancel.map((invitePublicId) =>
            cancelPrivateInvite(accessToken, invitePublicId)),
        );
      }

      await refreshOutgoingInvites();
      await refreshLobbyState(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not remove member right now.",
      );
    } finally {
      setKickingMemberPublicId(null);
    }
  };

  const toggleInviteFriend = (friendPublicId: string, checked: boolean) => {
    if (outgoingInviteStatusByFriendId[friendPublicId] === "PENDING") {
      return;
    }

    setSelectedFriendIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(friendPublicId);
      } else {
        next.delete(friendPublicId);
      }
      return next;
    });
  };

  const handleSelectAllInvitableFriends = () => {
    setSelectedFriendIds(new Set(selectableInvitableFriends.map((friend) => friend.publicId)));
  };

  const handleClearInvitableFriendsSelection = () => {
    setSelectedFriendIds(new Set());
  };

  const handleSendInvites = async () => {
    if (!accessToken || !viewerCapabilities?.viewerIsHost || selectedFriendIds.size === 0) {
      return;
    }

    setIsSendingInvites(true);
    setInviteFeedbackMessage(null);

    const friendPublicIds = Array.from(selectedFriendIds);

    try {
      await sendPrivateLobbyInvites(accessToken, lobbyPublicId, { friendPublicIds });
      await refreshOutgoingInvites();
      setSelectedFriendIds(new Set());
      setInviteFeedbackMessage(
        friendPublicIds.length === 1
          ? "Invite sent."
          : `Invites sent to ${friendPublicIds.length} friends.`,
      );
    } catch (error) {
      await refreshOutgoingInvites();
      setInviteFeedbackMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not send invites right now.",
      );
    } finally {
      setIsSendingInvites(false);
    }
  };

  const handleStrokeCommit = (stroke: CanvasStroke) => {
    if (
      !sharedState ||
      isTerminalLobbyPhase(sharedState.currentPhase) ||
      !viewerCapabilities?.canSubmitSnapshot
    ) {
      return;
    }

    setOptimisticStrokes((currentOptimisticStrokes) => {
      const baseStrokes = currentOptimisticStrokes ?? authoritativeStrokes;
      const nextStrokes = [...baseStrokes, stroke];

      if (isLiveDrawingEnabled && sharedState.currentPhase === "DRAWING") {
        realtimeRef.current?.sendDrawingLive({
          snapshot: stringifyDrawingSnapshot(nextStrokes),
          baseVersion: sharedState.drawingVersion,
        });
      }

      return nextStrokes;
    });
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

  const handleSubmitDrawingDone = useCallback((): boolean => {
    if (!sharedState || !canSubmitDrawingDone) {
      return false;
    }

    if (!realtimeRef.current?.isConnected()) {
      setErrorMessage("Connection is reconnecting. Retrying sync...");
      void refreshLobbyState(true);
      return false;
    }

    setErrorMessage(null);
    setIsSubmittingDrawingDone(true);
    setDrawingDoneBaseSharedVersion(state.lastSharedVersion);

    const snapshot = stringifyDrawingSnapshot(renderedStrokes);
    realtimeRef.current?.sendDrawingDone({
      snapshot,
      baseVersion: sharedState.drawingVersion,
    });
    scheduleBootstrapRefresh(1200);
    return true;
  }, [
    canSubmitDrawingDone,
    refreshLobbyState,
    renderedStrokes,
    scheduleBootstrapRefresh,
    sharedState,
    state.lastSharedVersion,
  ]);

  useEffect(() => {
    if (
      !isSubmittingDrawingDone ||
      typeof drawingDoneBaseSharedVersion !== "number" ||
      typeof state.lastSharedVersion !== "number"
    ) {
      return;
    }

    if (state.lastSharedVersion > drawingDoneBaseSharedVersion) {
      setIsSubmittingDrawingDone(false);
      setDrawingDoneBaseSharedVersion(null);
    }
  }, [drawingDoneBaseSharedVersion, isSubmittingDrawingDone, state.lastSharedVersion]);

  useEffect(() => {
    if (sharedState?.currentPhase === "DRAWING") {
      return;
    }

    setIsSubmittingDrawingDone(false);
    setDrawingDoneBaseSharedVersion(null);
    autoDoneTurnKeyRef.current = null;
  }, [sharedState?.currentPhase]);

  useEffect(() => {
    if (
      sharedState?.currentPhase !== "DRAWING" ||
      !sharedState.turnEndsAt ||
      !canSubmitDrawingDone
    ) {
      return;
    }

    const deadlineMs = Date.parse(sharedState.turnEndsAt);
    if (!Number.isFinite(deadlineMs) || now + AUTO_DONE_LEAD_MS < deadlineMs) {
      return;
    }

    const turnKey = `${sharedState.currentConceptIndex ?? "x"}:${sharedState.currentTurnIndex ?? "x"}:${sharedState.turnEndsAt}`;
    if (autoDoneTurnKeyRef.current === turnKey) {
      return;
    }

    if (handleSubmitDrawingDone()) {
      autoDoneTurnKeyRef.current = turnKey;
    }
  }, [
    canSubmitDrawingDone,
    handleSubmitDrawingDone,
    now,
    sharedState?.currentConceptIndex,
    sharedState?.currentPhase,
    sharedState?.currentTurnIndex,
    sharedState?.turnEndsAt,
  ]);

  const refreshOutgoingInvites = useCallback(async () => {
    if (!accessToken || !viewerCapabilities?.viewerIsHost) {
      setOutgoingInviteStatusByFriendId({});
      setIsOutgoingInvitesLoading(false);
      return;
    }

    setIsOutgoingInvitesLoading(true);
    try {
      const outgoingInvites = await getPrivateInvites(accessToken, "outgoing");
      const latestInviteByReceiver = new Map<string, { createdAt: number; status: PrivateLobbyInviteStatus }>();

      outgoingInvites
        .filter((invite) => invite.lobbyPublicId === lobbyPublicId)
        .forEach((invite) => {
          const createdAtMs = Date.parse(invite.createdAt);
          const current = latestInviteByReceiver.get(invite.receiverPublicId);
          if (!current || createdAtMs > current.createdAt) {
            latestInviteByReceiver.set(invite.receiverPublicId, {
              createdAt: createdAtMs,
              status: invite.status,
            });
          }
        });

      const nextStatusByFriendId: Record<string, PrivateLobbyInviteStatus> = {};
      latestInviteByReceiver.forEach((entry, receiverPublicId) => {
        nextStatusByFriendId[receiverPublicId] = entry.status;
      });

      setOutgoingInviteStatusByFriendId(nextStatusByFriendId);
    } catch {
      setOutgoingInviteStatusByFriendId({});
    } finally {
      setIsOutgoingInvitesLoading(false);
    }
  }, [accessToken, lobbyPublicId, viewerCapabilities?.viewerIsHost]);

  useEffect(() => {
    void refreshOutgoingInvites();
  }, [refreshOutgoingInvites]);

  useEffect(() => {
    if (!accessToken) {
      setFriends([]);
      setIsFriendsLoading(false);
      setFriendsErrorMessage(null);
      return;
    }

    let active = true;
    setIsFriendsLoading(true);
    setFriendsErrorMessage(null);

    void fetchFriends(accessToken)
      .then((loadedFriends) => {
        if (!active) {
          return;
        }
        setFriends(loadedFriends);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setFriendsErrorMessage(getFriendsLoadErrorMessage(error));
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setIsFriendsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    setSelectedFriendIds((previous) => {
      if (previous.size === 0) {
        return previous;
      }

      const availableFriendIds = new Set(selectableInvitableFriends.map((friend) => friend.publicId));
      const next = new Set<string>();

      previous.forEach((publicId) => {
        if (availableFriendIds.has(publicId)) {
          next.add(publicId);
        }
      });

      return next;
    });
  }, [selectableInvitableFriends]);

  useEffect(() => {
    if (
      sharedState?.viewerWasKicked
      || sharedState?.viewerRemovedReason === "KICKED_BY_HOST"
    ) {
      setIsKickedModalOpen(true);
    }
  }, [sharedState?.viewerRemovedReason, sharedState?.viewerWasKicked]);

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
        <Modal
          opened={isKickedModalOpen}
          onClose={() => {
            // Keep modal open until user chooses where to go.
          }}
          withCloseButton={false}
          closeOnEscape={false}
          closeOnClickOutside={false}
          title="You were removed from this lobby"
          centered
          radius="lg"
        >
          <Stack gap="md">
            <Text size="sm">
              The host removed you from this lobby.
            </Text>
            <Group justify="flex-end">
              <Button radius="xl" color="lime" onClick={() => router.push("/")}>
                Go Home
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={isLeaveConfirmOpen}
          onClose={() => setIsLeaveConfirmOpen(false)}
          title="Leave and end game for everyone?"
          centered
          radius="lg"
        >
          <Stack gap="md">
            <Text size="sm">
              Leaving now will end this game for all players in this lobby.
            </Text>
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => setIsLeaveConfirmOpen(false)}
                disabled={isLeaving}
              >
                No, stay
              </Button>
              <Button
                color="red"
                onClick={() => {
                  setIsLeaveConfirmOpen(false);
                  void executeLeave();
                }}
                loading={isLeaving}
              >
                Yes, leave game
              </Button>
            </Group>
          </Stack>
        </Modal>

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
              <Group gap="xs">
                <Button
                  radius="xl"
                  size="xs"
                  variant={isCodeCopied ? "light" : "default"}
                  color={isCodeCopied ? "lime" : undefined}
                  onClick={() => void handleCopyLobbyCode()}
                >
                  {isCodeCopied ? "Copied" : "Copy code"}
                </Button>
                <Badge color={state.connected ? "green" : "orange"} variant="light">
                  {state.connected ? "Connected" : "Reconnecting"}
                </Badge>
              </Group>
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

        {reconnectingLearnerPublicIds.length > 0 && sharedState.currentPhase !== "ABANDONED" ? (
          <Alert color="blue" radius="lg" variant="light" title="Reconnecting">
            <Stack gap={4}>
              {viewerIsReconnecting ? (
                <Text size="sm">
                  Reconnecting...{" "}
                  {viewerReconnectSecondsLeft !== null
                    ? `${viewerReconnectSecondsLeft}s left`
                    : "please return soon"}
                  .
                </Text>
              ) : reconnectingOthers.length > 0 ? (
                <Text size="sm">
                  {toReconnectingMembersLabel(reconnectingOthers)} disconnected. Reconnecting...
                </Text>
              ) : (
                <Text size="sm">A player disconnected. Reconnecting...</Text>
              )}
              {nearestReconnectSecondsLeft !== null ? (
                <Text size="xs" c="dimmed">
                  Auto-abandon in {nearestReconnectSecondsLeft}s if they do not return.
                </Text>
              ) : null}
            </Stack>
          </Alert>
        ) : null}

        {sharedState.currentPhase !== null && !isTerminalPhase ? (
          <Card radius="24px" padding="md" className={sectionCardClassName}>
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Need to exit this match?
              </Text>
              <Button
                radius="xl"
                color="red"
                variant="light"
                loading={isLeaving}
                disabled={!viewerCapabilities?.canLeave}
                onClick={handleLeave}
              >
                Leave game
              </Button>
            </Group>
          </Card>
        ) : null}

        {sharedState.currentPhase === "ABANDONED" ? (
          <Alert color="orange" radius="lg" variant="light" title={abandonedCopy.title}>
            <Stack gap={4}>
              <Text size="sm">{abandonedCopy.body}</Text>
              {abandonedByMember ? (
                <Text size="sm">Player involved: {toMemberLabel(abandonedByMember)}.</Text>
              ) : null}
              {sharedState.endedAt ? (
                <Text size="xs" c="dimmed">
                  Ended at {formatEndedAt(sharedState.endedAt)}
                </Text>
              ) : null}
            </Stack>
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
                      <Group gap="xs">
                        {member.host ? <Badge color="lime">Host</Badge> : null}
                        {viewerCapabilities?.viewerIsHost
                        && !member.host
                        && Boolean(member.learnerPublicId) ? (
                          <Button
                            size="xs"
                            radius="xl"
                            color="red"
                            variant="light"
                            loading={kickingMemberPublicId === member.learnerPublicId}
                            disabled={Boolean(kickingMemberPublicId)}
                            onClick={() => void handleKickMember(member.learnerPublicId!)}
                          >
                            Kick
                          </Button>
                          ) : null}
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </div>

              <Divider />

              {viewerCapabilities?.viewerIsHost ? (
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text fw={600}>Invite friends</Text>
                    </Group>

                    {friendsErrorMessage ? (
                      <Alert color="red" radius="md" variant="light" title="Could not load friends">
                        {friendsErrorMessage}
                      </Alert>
                    ) : null}

                    {isFriendsLoading ? (
                      <Text size="sm" c="dimmed">
                        Loading friends...
                      </Text>
                    ) : null}

                    {!isFriendsLoading && isOutgoingInvitesLoading ? (
                      <Text size="xs" c="dimmed">
                        Loading invite statuses...
                      </Text>
                    ) : null}

                    {!isFriendsLoading && !friendsErrorMessage && invitableFriends.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        No available friends to invite right now.
                      </Text>
                    ) : null}

                    {!isFriendsLoading && !friendsErrorMessage && invitableFriends.length > 0 ? (
                      <>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="default"
                            onClick={handleSelectAllInvitableFriends}
                          >
                            Select all
                          </Button>
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={handleClearInvitableFriendsSelection}
                          >
                            Clear
                          </Button>
                        </Group>

                        <Stack gap="xs" className="max-h-52 overflow-y-auto pr-1">
                          {invitableFriends.map((friend) => {
                            const inviteStatus = outgoingInviteStatusByFriendId[friend.publicId];
                            const isPending = inviteStatus === "PENDING";

                            return (
                              <Group key={friend.publicId} justify="space-between" align="center" wrap="nowrap">
                                <Checkbox
                                  checked={selectedFriendIds.has(friend.publicId)}
                                  onChange={(event) =>
                                    toggleInviteFriend(friend.publicId, event.currentTarget.checked)
                                  }
                                  disabled={isPending}
                                  label={friend.username}
                                />
                                {inviteStatus ? (
                                  <Badge color={toInviteStatusColor(inviteStatus)} variant="light">
                                    {inviteStatus}
                                  </Badge>
                                ) : null}
                              </Group>
                            );
                          })}
                        </Stack>

                        <Group justify="space-between" align="center">
                          <Text size="xs" c="dimmed">
                            {selectedFriendIds.size} selected
                          </Text>
                          <Button
                            radius="xl"
                            size="sm"
                            color="lime"
                            loading={isSendingInvites}
                            disabled={selectedFriendIds.size === 0}
                            onClick={handleSendInvites}
                          >
                            Send invites
                          </Button>
                        </Group>
                      </>
                    ) : null}

                    {inviteFeedbackMessage ? (
                      <Text size="xs" c="dimmed">
                        {inviteFeedbackMessage}
                      </Text>
                    ) : null}
                  </Stack>
                </div>
              ) : null}

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
                  selectedColor={selectedColor}
                  onSelectedColorChange={setSelectedColor}
                  onStrokeCommit={handleStrokeCommit}
                  className="block w-full"
                />
              </div>

              <Text size="sm" c="dimmed">
                {viewerDrawingHint}
              </Text>

              <Group>
                <Button
                  radius="xl"
                  color="lime"
                  onClick={handleSubmitDrawingDone}
                  disabled={!canSubmitDrawingDone}
                  loading={isSubmittingDrawingDone}
                >
                  Done
                </Button>
              </Group>
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
                      isViewerVoteTarget(
                        targetPublicId,
                        targetMember,
                        viewerMemberPublicId,
                        viewerIdentityTokenSet,
                      );
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

function useNow(intervalMs: number, serverClockOffsetMs: number): number {
  const [now, setNow] = useState(() => Date.now() + serverClockOffsetMs);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setNow(Date.now() + serverClockOffsetMs),
      intervalMs,
    );
    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, serverClockOffsetMs]);

  return now;
}

function syncServerClockOffset(
  setServerClockOffsetMs: Dispatch<SetStateAction<number>>,
  emittedAt: string,
): void {
  const emittedAtMs = Date.parse(emittedAt);
  if (!Number.isFinite(emittedAtMs)) {
    return;
  }

  const measuredOffsetMs = emittedAtMs - Date.now();
  setServerClockOffsetMs((currentOffset) => {
    if (!Number.isFinite(currentOffset) || currentOffset === 0) {
      return Math.round(measuredOffsetMs);
    }

    return Math.round(currentOffset * 0.85 + measuredOffsetMs * 0.15);
  });
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

function isViewerVoteTarget(
  targetPublicId: string,
  targetMember: MemberState | null,
  viewerMemberPublicId: string | null,
  viewerIdentityTokenSet: Set<string>,
): boolean {
  if (viewerMemberPublicId && targetPublicId === viewerMemberPublicId) {
    return true;
  }

  const targetUsername = targetMember?.username;
  if (!targetUsername) {
    return false;
  }

  return viewerIdentityTokenSet.has(normalizeIdentityToken(targetUsername));
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

function formatEndedAt(endedAt: string): string {
  const endedAtMs = Date.parse(endedAt);
  if (!Number.isFinite(endedAtMs)) {
    return endedAt;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(endedAtMs));
}

function toSecondsLeft(deadlineAt: string | null, now: number): number | null {
  if (!deadlineAt) {
    return null;
  }

  const deadlineMs = Date.parse(deadlineAt);
  if (!Number.isFinite(deadlineMs)) {
    return null;
  }

  return Math.max(0, Math.ceil((deadlineMs - now) / 1000));
}

function toInviteStatusColor(status: PrivateLobbyInviteStatus): string {
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

function toReconnectingMembersLabel(members: MemberState[]): string {
  if (members.length === 0) {
    return "Players";
  }

  if (members.length === 1) {
    return toMemberLabel(members[0]);
  }

  if (members.length === 2) {
    return `${toMemberLabel(members[0])} and ${toMemberLabel(members[1])}`;
  }

  return `${toMemberLabel(members[0])} and ${members.length - 1} others`;
}

function toDisplayTurnNumber(currentTurnIndex: number | null): number | "-" {
  if (typeof currentTurnIndex !== "number" || !Number.isFinite(currentTurnIndex)) {
    return "-";
  }

  return currentTurnIndex + 1;
}

function isLiveDrawingDisabledMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized.includes("live drawing is disabled");
}

function isLiveDrawingVersionConflict(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized.includes("drawing version conflict") ||
    (normalized.includes("409") &&
      normalized.includes("drawing") &&
      normalized.includes("conflict"))
  );
}

function isDoneSubmitConflictOrPhaseError(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized.includes("stale") ||
    normalized.includes("version") ||
    normalized.includes("conflict") ||
    normalized.includes("phase") ||
    normalized.includes("drawer") ||
    normalized.includes("turn")
  );
}

function isSessionAbandonedError(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized.includes("abandoned") ||
    normalized.includes("ended because a player left") ||
    normalized.includes("disconnect timeout") ||
    normalized.includes("disconnected timeout") ||
    normalized.includes("disconnected for too long") ||
    (normalized.includes("session") && normalized.includes("ended"))
  );
}

function isTerminalLobbyPhase(phase: LobbyPhase): boolean {
  return phase === "MATCH_COMPLETE" || phase === "ABANDONED";
}

function getAbandonedCopy(endReason: LobbyEndReason | null): {
  title: string;
  body: string;
} {
  if (endReason === "PLAYER_DISCONNECTED_TIMEOUT") {
    return {
      title: "Game ended due to disconnect",
      body: "A player disconnected for too long, so this session has ended for everyone.",
    };
  }

  if (endReason === "PLAYER_QUIT") {
    return {
      title: "Game ended early",
      body: "A player left, so this session has ended for everyone.",
    };
  }

  return {
    title: "Game ended",
    body: "This session has ended for everyone.",
  };
}

function getAbandonedConflictMessage(
  rawMessage: string,
  endReason: LobbyEndReason | null,
): string {
  const normalized = rawMessage.trim().toLowerCase();
  if (
    endReason === "PLAYER_DISCONNECTED_TIMEOUT" ||
    normalized.includes("disconnect timeout") ||
    normalized.includes("disconnected timeout") ||
    normalized.includes("disconnected for too long")
  ) {
    return "This game already ended because a player disconnected for too long.";
  }

  return "This game already ended because a player left.";
}
