export type LobbyEnvelopeType = "LOBBY_STATE" | "VIEWER_STATE";

export type LobbyRealtimeReason =
  | "JOIN_REJOIN"
  | "JOIN"
  | "LEAVE_HOST_TRANSFER"
  | "LEAVE"
  | "ABANDONED_BY_QUIT"
  | "ABANDONED_BY_DISCONNECT_TIMEOUT"
  | "RECONNECTING"
  | "RECONNECTED"
  | "SETTINGS"
  | "START"
  | "STATE_RECONCILE"
  | "TURN_EXPIRED"
  | "DRAWING_LIVE"
  | "VOTE"
  | "GUESS"
  | "DEADLINE_ADVANCE"
  | string;

export interface RealtimeEnvelope<TState> {
  type: LobbyEnvelopeType;
  lobbyPublicId: string;
  stateVersion: number | null;
  reason: LobbyRealtimeReason;
  emittedAt: string;
  state: TState;
}

export type LobbyConceptPoolMode = "CURRENT_MONTH_PACK" | "FULL_CONCEPT_POOL";

export type LobbyPhase =
  | "DRAWING"
  | "VOTING"
  | "IMPOSTER_GUESS"
  | "CONCEPT_RESULT"
  | "MATCH_COMPLETE"
  | "ABANDONED"
  | null;

export type ConceptWinnerSide = "IMPOSTER" | "NON_IMPOSTERS";

export type ConceptResolution =
  | "WRONG_ACCUSATION"
  | "VOTING_TIE_LIMIT"
  | "IMPOSTER_GUESS_CORRECT"
  | "IMPOSTER_GUESS_WRONG";

export interface MemberState {
  learnerPublicId: string | null;
  username: string | null;
  joinedAt: string;
  host: boolean;
}

export interface PlayerScore {
  learnerPublicId: string;
  points: number;
}

export interface VoteTally {
  learnerPublicId: string;
  voteCount: number;
}

export interface ConceptResult {
  conceptNumber: number | null;
  conceptLabel: string | null;
  winnerSide: ConceptWinnerSide;
  resolution: ConceptResolution;
  accusedPublicId: string | null;
  imposterPublicId: string | null;
  imposterWinsByVotingTie: boolean;
  imposterGuess: string | null;
  finalVoteTallies: VoteTally[];
}

export interface ReconnectingLearnerState {
  learnerPublicId: string;
  disconnectDeadlineAt: string;
}

export type KnownLobbyEndReason =
  | "PLAYER_QUIT"
  | "PLAYER_DISCONNECTED_TIMEOUT";
export type LobbyEndReason = KnownLobbyEndReason | (string & {});

export interface SharedState {
  publicId: string;
  lobbyCode: string;
  isPrivate: boolean;
  conceptPoolMode: LobbyConceptPoolMode;
  pinnedYearMonth: string | null;
  conceptCount: number | null;
  roundsPerConcept: number | null;
  discussionTimerSeconds: number | null;
  imposterGuessTimerSeconds: number | null;
  createdAt: string;
  startedAt: string | null;
  activeMemberCount: number;
  activeMembers: MemberState[];
  currentDrawerPublicId: string | null;
  currentTurnIndex: number | null;
  totalTurns: number | null;
  turnDurationSeconds: number | null;
  turnStartedAt: string | null;
  turnEndsAt: string | null;
  isRoundComplete: boolean;
  currentDrawingSnapshot: string | null;
  drawingVersion: number | null;
  currentPhase: LobbyPhase;
  currentConceptIndex: number | null;
  totalConcepts: number | null;
  playerScores: PlayerScore[];
  latestConceptResult: ConceptResult | null;
  maxVotingRounds: number | null;
  minTimerSeconds: number | null;
  maxTimerSeconds: number | null;
  stateVersion: number | null;
  conceptResultDeadlineAt: string | null;
  eligibleVoteTargetPublicIds: string[];
  votingRoundNumber: number | null;
  votingDeadlineAt: string | null;
  votedOutPublicId: string | null;
  imposterGuessDeadlineAt: string | null;
  lastImposterGuess: string | null;
  lastImposterGuessCorrect: boolean | null;
  endReason: LobbyEndReason | null;
  endedAt: string | null;
  endedByPublicId: string | null;
  reconnectingLearners: ReconnectingLearnerState[];
}

export interface ViewerState {
  viewerVoteTargetPublicId: string | null;
  viewerIsImposter: boolean;
  viewerConceptTitle: string | null;
}

export interface ViewerCapabilities {
  viewerIsHost: boolean;
  viewerIsActiveMember: boolean;
  canLeave: boolean;
  canStart: boolean;
  viewerIsCurrentDrawer: boolean;
  canSubmitSnapshot: boolean;
  canPressDone: boolean;
}

export interface PrivateImposterLobbyStateDto {
  publicId: string;
  lobbyCode: string;
  isPrivate: boolean;
  conceptPoolMode: LobbyConceptPoolMode;
  pinnedYearMonth: string | null;
  conceptCount: number | null;
  roundsPerConcept: number | null;
  discussionTimerSeconds: number | null;
  imposterGuessTimerSeconds: number | null;
  createdAt: string;
  startedAt: string | null;
  activeMemberCount: number;
  activeMembers: MemberState[];
  viewerIsHost: boolean;
  viewerIsActiveMember: boolean;
  canLeave: boolean;
  canStart: boolean;
  currentDrawerPublicId: string | null;
  currentTurnIndex: number | null;
  totalTurns: number | null;
  turnDurationSeconds: number | null;
  turnStartedAt: string | null;
  turnEndsAt: string | null;
  viewerIsCurrentDrawer: boolean;
  canSubmitSnapshot: boolean;
  canPressDone: boolean;
  isRoundComplete: boolean;
  currentDrawingSnapshot: string | null;
  drawingVersion: number | null;
  currentPhase: LobbyPhase;
  currentConceptIndex: number | null;
  totalConcepts: number | null;
  playerScores: PlayerScore[];
  latestConceptResult: ConceptResult | null;
  maxVotingRounds: number | null;
  minTimerSeconds: number | null;
  maxTimerSeconds: number | null;
  stateVersion: number | null;
  conceptResultDeadlineAt: string | null;
  viewerVoteTargetPublicId: string | null;
  eligibleVoteTargetPublicIds: string[];
  votingRoundNumber: number | null;
  votingDeadlineAt: string | null;
  votedOutPublicId: string | null;
  imposterGuessDeadlineAt: string | null;
  viewerIsImposter: boolean;
  viewerConceptTitle: string | null;
  lastImposterGuess: string | null;
  lastImposterGuessCorrect: boolean | null;
  endReason: LobbyEndReason | null;
  endedAt: string | null;
  endedByPublicId: string | null;
  reconnectingLearners: ReconnectingLearnerState[];
}

export interface PrivateImposterLobbyDto {
  publicId: string;
  lobbyCode: string;
  isPrivate: boolean;
  conceptPoolMode: LobbyConceptPoolMode;
  pinnedYearMonth: string | null;
  createdAt: string;
}

export interface JoinedPrivateImposterLobbyDto extends PrivateImposterLobbyDto {
  joinedAt: string;
  alreadyMember: boolean;
}

export type PrivateImposterLobbyLeaveResult =
  | "LEFT"
  | "LEFT_AND_PROMOTED_HOST"
  | "LEFT_AND_LOBBY_DELETED"
  | "LEFT_AND_SESSION_ABANDONED";

export interface LeavePrivateImposterLobbyResponse {
  result: PrivateImposterLobbyLeaveResult;
  lobbyState: PrivateImposterLobbyStateDto | null;
}

export interface CreatePrivateImposterLobbyRequest {
  conceptPoolMode: LobbyConceptPoolMode;
}

export interface JoinPrivateImposterLobbyRequest {
  lobbyCode: string;
}

export interface UpdatePrivateImposterLobbySettingsRequest {
  conceptCount: number | null;
  roundsPerConcept: number | null;
  discussionTimerSeconds: number | null;
  imposterGuessTimerSeconds: number | null;
  turnDurationSeconds: number | null;
}

export interface DrawingLiveRequest {
  snapshot: string;
  baseVersion: number | null;
}

export interface DrawingDoneRequest {
  snapshot: string;
  baseVersion: number | null;
}

export interface VoteRequest {
  suspectedLearnerPublicId: string;
}

export interface GuessRequest {
  guess: string;
}

export const STRUCTURAL_REFRESH_REASONS = new Set<LobbyRealtimeReason>([
  "JOIN_REJOIN",
  "JOIN",
  "LEAVE_HOST_TRANSFER",
  "LEAVE",
  "ABANDONED_BY_QUIT",
  "ABANDONED_BY_DISCONNECT_TIMEOUT",
  "RECONNECTING",
  "RECONNECTED",
  "SETTINGS",
  "START",
  "STATE_RECONCILE",
  "TURN_EXPIRED",
  "DEADLINE_ADVANCE",
]);
