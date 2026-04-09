import type {
  PrivateImposterLobbyStateDto,
  RealtimeEnvelope,
  SharedState,
  ViewerCapabilities,
  ViewerState,
} from "./types";

export interface OnlineLobbyRuntimeState {
  lobbyPublicId: string;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  connected: boolean;
  reconnecting: boolean;
  sharedState: SharedState | null;
  viewerState: ViewerState | null;
  viewerCapabilities: ViewerCapabilities | null;
  lastSharedVersion: number | null;
  lastViewerVersion: number | null;
  lastSharedReason: string | null;
  lastViewerReason: string | null;
}

export type OnlineLobbyRuntimeAction =
  | { type: "BOOTSTRAP_LOADING" }
  | { type: "BOOTSTRAP_SUCCESS"; payload: PrivateImposterLobbyStateDto }
  | { type: "BOOTSTRAP_ERROR"; payload: string }
  | { type: "SOCKET_CONNECTED" }
  | { type: "SOCKET_DISCONNECTED" }
  | { type: "APPLY_SHARED_ENVELOPE"; payload: RealtimeEnvelope<SharedState> }
  | { type: "APPLY_VIEWER_ENVELOPE"; payload: RealtimeEnvelope<ViewerState> };

export function createOnlineLobbyInitialState(
  lobbyPublicId: string,
): OnlineLobbyRuntimeState {
  return {
    lobbyPublicId,
    status: "idle",
    error: null,
    connected: false,
    reconnecting: false,
    sharedState: null,
    viewerState: null,
    viewerCapabilities: null,
    lastSharedVersion: null,
    lastViewerVersion: null,
    lastSharedReason: null,
    lastViewerReason: null,
  };
}

export function onlineLobbyRuntimeReducer(
  state: OnlineLobbyRuntimeState,
  action: OnlineLobbyRuntimeAction,
): OnlineLobbyRuntimeState {
  switch (action.type) {
    case "BOOTSTRAP_LOADING":
      return {
        ...state,
        status: state.status === "ready" ? "ready" : "loading",
        error: null,
      };
    case "BOOTSTRAP_SUCCESS": {
      const dto = action.payload;

      return {
        ...state,
        status: "ready",
        error: null,
        sharedState: mapSharedState(dto),
        viewerState: mapViewerState(dto),
        viewerCapabilities: mapViewerCapabilities(dto),
        lastSharedVersion: dto.stateVersion,
        lastViewerVersion: dto.stateVersion,
      };
    }
    case "BOOTSTRAP_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };
    case "SOCKET_CONNECTED":
      return {
        ...state,
        connected: true,
        reconnecting: false,
      };
    case "SOCKET_DISCONNECTED":
      return {
        ...state,
        connected: false,
        reconnecting: state.status === "ready",
      };
    case "APPLY_SHARED_ENVELOPE": {
      const nextVersion = action.payload.stateVersion;
      if (!shouldApplyVersion(state.lastSharedVersion, nextVersion)) {
        return state;
      }

      return {
        ...state,
        sharedState: action.payload.state,
        lastSharedVersion: nextVersion ?? state.lastSharedVersion,
        lastSharedReason: action.payload.reason,
      };
    }
    case "APPLY_VIEWER_ENVELOPE": {
      const nextVersion = action.payload.stateVersion;
      if (!shouldApplyVersion(state.lastViewerVersion, nextVersion)) {
        return state;
      }

      return {
        ...state,
        viewerState: mergeViewerState(state.viewerState, action.payload.state),
        lastViewerVersion: nextVersion ?? state.lastViewerVersion,
        lastViewerReason: action.payload.reason,
      };
    }
    default:
      return state;
  }
}

function shouldApplyVersion(
  lastVersion: number | null,
  nextVersion: number | null,
): boolean {
  if (typeof nextVersion !== "number" || !Number.isFinite(nextVersion)) {
    return false;
  }

  if (typeof lastVersion !== "number" || !Number.isFinite(lastVersion)) {
    return true;
  }

  return nextVersion > lastVersion;
}

function mapSharedState(dto: PrivateImposterLobbyStateDto): SharedState {
  return {
    publicId: dto.publicId,
    lobbyCode: dto.lobbyCode,
    isPrivate: dto.isPrivate,
    conceptPoolMode: dto.conceptPoolMode,
    pinnedYearMonth: dto.pinnedYearMonth,
    conceptCount: dto.conceptCount,
    roundsPerConcept: dto.roundsPerConcept,
    discussionTimerSeconds: dto.discussionTimerSeconds,
    imposterGuessTimerSeconds: dto.imposterGuessTimerSeconds,
    createdAt: dto.createdAt,
    startedAt: dto.startedAt,
    activeMemberCount: dto.activeMemberCount,
    activeMembers: dto.activeMembers,
    currentDrawerPublicId: dto.currentDrawerPublicId,
    currentTurnIndex: dto.currentTurnIndex,
    totalTurns: dto.totalTurns,
    turnDurationSeconds: dto.turnDurationSeconds,
    turnStartedAt: dto.turnStartedAt,
    turnEndsAt: dto.turnEndsAt,
    isRoundComplete: dto.isRoundComplete,
    currentDrawingSnapshot: dto.currentDrawingSnapshot,
    drawingVersion: dto.drawingVersion,
    currentPhase: dto.currentPhase,
    currentConceptIndex: dto.currentConceptIndex,
    totalConcepts: dto.totalConcepts,
    playerScores: dto.playerScores,
    latestConceptResult: dto.latestConceptResult,
    maxVotingRounds: dto.maxVotingRounds,
    minTimerSeconds: dto.minTimerSeconds,
    maxTimerSeconds: dto.maxTimerSeconds,
    stateVersion: dto.stateVersion,
    conceptResultDeadlineAt: dto.conceptResultDeadlineAt,
    eligibleVoteTargetPublicIds: dto.eligibleVoteTargetPublicIds,
    votingRoundNumber: dto.votingRoundNumber,
    votingDeadlineAt: dto.votingDeadlineAt,
    votedOutPublicId: dto.votedOutPublicId,
    imposterGuessDeadlineAt: dto.imposterGuessDeadlineAt,
    lastImposterGuess: dto.lastImposterGuess,
    lastImposterGuessCorrect: dto.lastImposterGuessCorrect,
    endReason: dto.endReason,
    endedAt: dto.endedAt,
    endedByPublicId: dto.endedByPublicId,
    viewerWasKicked: Boolean(dto.viewerWasKicked),
    viewerRemovedReason: dto.viewerRemovedReason ?? null,
    reconnectingLearners: dto.reconnectingLearners ?? [],
  };
}

function mapViewerState(dto: PrivateImposterLobbyStateDto): ViewerState {
  return {
    viewerVoteTargetPublicId: dto.viewerVoteTargetPublicId ?? null,
    viewerIsImposter: Boolean(dto.viewerIsImposter),
    viewerConceptTitle: dto.viewerConceptTitle ?? null,
  };
}

function mergeViewerState(
  previous: ViewerState | null,
  incoming: ViewerState,
): ViewerState {
  const incomingVoteTarget = incoming.viewerVoteTargetPublicId;
  const incomingConceptTitle = incoming.viewerConceptTitle;

  return {
    viewerVoteTargetPublicId:
      typeof incomingVoteTarget === "string" || incomingVoteTarget === null
        ? incomingVoteTarget
        : previous?.viewerVoteTargetPublicId ?? null,
    viewerIsImposter:
      typeof incoming.viewerIsImposter === "boolean"
        ? incoming.viewerIsImposter
        : previous?.viewerIsImposter ?? false,
    viewerConceptTitle:
      typeof incomingConceptTitle === "string" || incomingConceptTitle === null
        ? incomingConceptTitle
        : previous?.viewerConceptTitle ?? null,
  };
}

function mapViewerCapabilities(
  dto: PrivateImposterLobbyStateDto,
): ViewerCapabilities {
  return {
    viewerIsHost: dto.viewerIsHost,
    viewerIsActiveMember: dto.viewerIsActiveMember,
    canLeave: dto.canLeave,
    canStart: dto.canStart,
    viewerIsCurrentDrawer: dto.viewerIsCurrentDrawer,
    canSubmitSnapshot: dto.canSubmitSnapshot,
    canPressDone: dto.canPressDone,
  };
}
