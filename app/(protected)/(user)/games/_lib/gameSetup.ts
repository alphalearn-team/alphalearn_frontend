export const DEFAULT_PLAYER_COUNT = 2;

export const DEFAULT_GAME_SETTINGS = {
  conceptCount: 3,
  roundsPerConcept: 3,
  discussionTimerSeconds: 60,
  imposterGuessTimerSeconds: 30,
} as const;

export const MAX_VOTING_ROUNDS = 3;
export const MAX_CONCEPT_COUNT = 10;
export const MAX_PLAYER_COUNT = 10;
export const MAX_ROUNDS_PER_CONCEPT = 3;
export const MIN_TIMER_SECONDS = 10;
export const MAX_TIMER_SECONDS = 120;

export type GameMode = "offline";
export type ImposterConceptPoolMode = "CURRENT_MONTH_PACK" | "FULL_CONCEPT_POOL";

export interface GameSetupPlayerDraft {
  id: string;
  name: string;
}

export interface GameSetupSettings {
  conceptCount: number;
  roundsPerConcept: number;
  discussionTimerSeconds: number;
  imposterGuessTimerSeconds: number;
  conceptPoolMode: ImposterConceptPoolMode;
}

export interface GameSetupFormValues {
  players: GameSetupPlayerDraft[];
  settings: GameSetupSettings;
}

export interface MatchConfigPlayer {
  id: string;
  name: string;
}

export interface OfflineMatchConfig {
  mode: GameMode;
  players: MatchConfigPlayer[];
  settings: GameSetupSettings;
}

export interface AssignedGameConcept {
  conceptPublicId: string;
  word: string;
}

export type RevealSubstate = "handoff" | "revealed" | "completed";
export type DrawingSubstate = "handoff" | "drawing" | "review" | "completed";
export type DiscussionSubstate = "running" | "completed";
export type VotingSubstate = "handoff" | "selecting" | "submitted" | "tie-prompt" | "completed";
export type GuessSubstate = "handoff" | "guessing" | "completed";
export type MatchPhase = "reveal" | "draw" | "discussion" | "vote" | "guess" | "vote-result" | "match-summary";
export type ConceptWinnerSide = "imposter" | "non-imposters";
export type ConceptResolution =
  | "imposter-escaped-vote"
  | "imposter-correct-guess"
  | "imposter-wins-final-tie"
  | "non-imposters-caught-imposter";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  id: string;
  playerId: string;
  color: string;
  width: number;
  points: CanvasPoint[];
}

export interface PlayerVote {
  voterPlayerId: string;
  suspectedPlayerId: string;
}

export interface VoteTally {
  playerId: string;
  voteCount: number;
}

export interface PlayerScore {
  playerId: string;
  points: number;
}

export interface ConceptResult {
  conceptNumber: number;
  conceptPublicId: string;
  word: string;
  winnerSide: ConceptWinnerSide;
  resolution: ConceptResolution;
  accusedPlayerId: string | null;
  imposterPlayerId: string;
  imposterWinsByVotingTie: boolean;
  imposterGuess: string | null;
  finalVoteTallies: VoteTally[];
}

export interface OfflineInitializedMatch {
  mode: GameMode;
  lobbyCode: string;
  conceptPoolMode: ImposterConceptPoolMode;
  phase: MatchPhase;
  revealState: RevealSubstate;
  drawingState: DrawingSubstate;
  discussionState: DiscussionSubstate;
  votingState: VotingSubstate;
  guessState: GuessSubstate;
  players: MatchConfigPlayer[];
  settings: GameSetupSettings;
  totalConceptCount: number;
  currentConceptNumber: number;
  usedConceptPublicIds: string[];
  conceptResults: ConceptResult[];
  playerScores: PlayerScore[];
  startingPlayerOffset: number;
  concept: AssignedGameConcept;
  imposterPlayerId: string;
  currentRevealIndex: number;
  currentDrawingTurnIndex: number;
  totalDrawingTurns: number;
  strokes: CanvasStroke[];
  discussionDurationSeconds: number;
  discussionEndsAt: number | null;
  currentVotingPlayerIndex: number;
  currentVotingRound: number;
  restrictedVoteCandidateIds: string[] | null;
  votes: PlayerVote[];
  finalVoteTallies: VoteTally[];
  accusedPlayerId: string | null;
  imposterWinsByVotingTie: boolean;
  guessDurationSeconds: number;
  guessEndsAt: number | null;
  imposterGuess: string;
}

export interface GameSetupValidationResult {
  playerErrors: Record<string, string>;
}

function normalizeWholeNumber(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.round(value));
}

function normalizeConceptCount(value: number): number {
  return Math.min(MAX_CONCEPT_COUNT, normalizeWholeNumber(value));
}

function normalizeRoundsPerConcept(value: number): number {
  return Math.min(MAX_ROUNDS_PER_CONCEPT, normalizeWholeNumber(value));
}

function normalizeTimerSeconds(value: number): number {
  return Math.min(MAX_TIMER_SECONDS, Math.max(MIN_TIMER_SECONDS, normalizeWholeNumber(value)));
}

function createInitialPlayerScores(players: MatchConfigPlayer[]): PlayerScore[] {
  return players.map((player) => ({
    playerId: player.id,
    points: 0,
  }));
}

export function createPlayerDraft(sequence: number, name = ""): GameSetupPlayerDraft {
  return {
    id: `player-${sequence}`,
    name,
  };
}

export function createDefaultPlayers(count = DEFAULT_PLAYER_COUNT): GameSetupPlayerDraft[] {
  return Array.from({ length: Math.min(count, MAX_PLAYER_COUNT) }, (_, index) => createPlayerDraft(index + 1, ""));
}

export function createDefaultGameSetupForm(): GameSetupFormValues {
  return {
    players: createDefaultPlayers(),
    settings: {
      ...DEFAULT_GAME_SETTINGS,
      conceptPoolMode: "FULL_CONCEPT_POOL",
    },
  };
}

export function getNextPlayerSequence(players: GameSetupPlayerDraft[]): number {
  return players.reduce((highestSequence, player) => {
    const match = player.id.match(/player-(\d+)/);
    const sequence = match ? Number(match[1]) : 0;

    return Math.max(highestSequence, sequence);
  }, 0) + 1;
}

export function trimPlayerName(name: string): string {
  return name.trim();
}

export function validateGameSetupForm(values: GameSetupFormValues): GameSetupValidationResult {
  const playerErrors: Record<string, string> = {};

  for (const player of values.players) {
    if (!trimPlayerName(player.name)) {
      playerErrors[player.id] = "Enter a player name";
    }
  }

  return { playerErrors };
}

export function hasGameSetupErrors(result: GameSetupValidationResult): boolean {
  return Object.keys(result.playerErrors).length > 0;
}

export function toOfflineMatchConfig(values: GameSetupFormValues): OfflineMatchConfig {
  return {
    mode: "offline",
    players: values.players.map((player) => ({
      id: player.id,
      name: trimPlayerName(player.name),
    })),
    settings: {
      conceptCount: normalizeConceptCount(values.settings.conceptCount),
      roundsPerConcept: normalizeRoundsPerConcept(values.settings.roundsPerConcept),
      discussionTimerSeconds: normalizeTimerSeconds(values.settings.discussionTimerSeconds),
      imposterGuessTimerSeconds: normalizeTimerSeconds(values.settings.imposterGuessTimerSeconds),
      conceptPoolMode: values.settings.conceptPoolMode,
    },
  };
}

export function initializeOfflineMatch(
  config: OfflineMatchConfig,
  concept: AssignedGameConcept,
  imposterPlayerId: string,
  lobbyCode: string,
  conceptPoolMode: ImposterConceptPoolMode,
): OfflineInitializedMatch {
  return {
    mode: config.mode,
    lobbyCode,
    conceptPoolMode,
    phase: "reveal",
    revealState: "handoff",
    drawingState: "handoff",
    discussionState: "completed",
    votingState: "completed",
    guessState: "completed",
    players: config.players,
    settings: config.settings,
    totalConceptCount: config.settings.conceptCount,
    currentConceptNumber: 1,
    usedConceptPublicIds: [concept.conceptPublicId],
    conceptResults: [],
    playerScores: createInitialPlayerScores(config.players),
    startingPlayerOffset: 0,
    concept,
    imposterPlayerId,
    currentRevealIndex: 0,
    currentDrawingTurnIndex: 0,
    totalDrawingTurns: config.players.length * config.settings.roundsPerConcept,
    strokes: [],
    discussionDurationSeconds: config.settings.discussionTimerSeconds,
    discussionEndsAt: null,
    currentVotingPlayerIndex: 0,
    currentVotingRound: 1,
    restrictedVoteCandidateIds: null,
    votes: [],
    finalVoteTallies: [],
    accusedPlayerId: null,
    imposterWinsByVotingTie: false,
    guessDurationSeconds: config.settings.imposterGuessTimerSeconds,
    guessEndsAt: null,
    imposterGuess: "",
  };
}

export function getCurrentRevealPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  return match.players[match.currentRevealIndex] ?? null;
}

export function getFirstDrawingPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  if (match.players.length === 0) {
    return null;
  }

  return match.players[match.startingPlayerOffset % match.players.length] ?? null;
}

export function getCurrentDrawingPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  if (match.players.length === 0 || match.currentDrawingTurnIndex < 0) {
    return null;
  }

  return match.players[(match.startingPlayerOffset + match.currentDrawingTurnIndex) % match.players.length] ?? null;
}

export function getNextDrawingPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  if (match.currentDrawingTurnIndex >= match.totalDrawingTurns - 1 || match.players.length === 0) {
    return null;
  }

  return match.players[(match.startingPlayerOffset + match.currentDrawingTurnIndex + 1) % match.players.length] ?? null;
}

export function getCurrentDrawingRound(match: OfflineInitializedMatch): number {
  if (match.players.length === 0) {
    return 0;
  }

  return Math.floor(match.currentDrawingTurnIndex / match.players.length) + 1;
}

export function enterDrawingPhase(match: OfflineInitializedMatch): OfflineInitializedMatch {
  return {
    ...match,
    phase: "draw",
    revealState: "completed",
    drawingState: "handoff",
    discussionState: "completed",
    votingState: "completed",
    guessState: "completed",
    currentDrawingTurnIndex: 0,
    totalDrawingTurns: match.players.length * match.settings.roundsPerConcept,
    strokes: [],
    discussionDurationSeconds: match.settings.discussionTimerSeconds,
    discussionEndsAt: null,
    currentVotingPlayerIndex: 0,
    currentVotingRound: 1,
    restrictedVoteCandidateIds: null,
    votes: [],
    finalVoteTallies: [],
    accusedPlayerId: null,
    imposterWinsByVotingTie: false,
    guessDurationSeconds: match.settings.imposterGuessTimerSeconds,
    guessEndsAt: null,
    imposterGuess: "",
  };
}

export function enterDiscussionPhase(
  match: OfflineInitializedMatch,
  startedAt = Date.now(),
): OfflineInitializedMatch {
  return {
    ...match,
    phase: "discussion",
    drawingState: "completed",
    discussionState: "running",
    discussionDurationSeconds: match.settings.discussionTimerSeconds,
    discussionEndsAt: startedAt + match.settings.discussionTimerSeconds * 1000,
  };
}

export function startDrawingTurn(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "draw" || match.drawingState !== "handoff" || !getCurrentDrawingPlayer(match)) {
    return match;
  }

  return {
    ...match,
    drawingState: "drawing",
  };
}

export function addCanvasStroke(
  match: OfflineInitializedMatch,
  stroke: CanvasStroke,
): OfflineInitializedMatch {
  if (match.phase !== "draw" || match.drawingState !== "drawing") {
    return match;
  }

  return {
    ...match,
    strokes: [...match.strokes, stroke],
  };
}

export function finishDrawingTurn(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "draw" || match.drawingState !== "drawing") {
    return match;
  }

  const isFinalTurn = match.currentDrawingTurnIndex >= match.totalDrawingTurns - 1;

  if (isFinalTurn) {
    return enterDiscussionPhase(match);
  }

  return {
    ...match,
    drawingState: "review",
  };
}

export function continueFromDrawingReview(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "draw" || match.drawingState !== "review") {
    return match;
  }

  return {
    ...match,
    currentDrawingTurnIndex: match.currentDrawingTurnIndex + 1,
    drawingState: "handoff",
  };
}

export function getDiscussionRemainingSeconds(
  match: OfflineInitializedMatch,
  now = Date.now(),
): number {
  if (match.phase !== "discussion" || !match.discussionEndsAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((match.discussionEndsAt - now) / 1000));
}

export function isDiscussionTimerLow(
  match: OfflineInitializedMatch,
  now = Date.now(),
): boolean {
  return getDiscussionRemainingSeconds(match, now) <= 10;
}

export function completeDiscussionPhase(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "discussion") {
    return match;
  }

  return {
    ...match,
    phase: "vote",
    discussionState: "completed",
    discussionEndsAt: null,
    votingState: "handoff",
    guessState: "completed",
    currentVotingPlayerIndex: 0,
    currentVotingRound: 1,
    restrictedVoteCandidateIds: null,
    votes: [],
    finalVoteTallies: [],
    accusedPlayerId: null,
    imposterWinsByVotingTie: false,
    guessDurationSeconds: match.settings.imposterGuessTimerSeconds,
    guessEndsAt: null,
    imposterGuess: "",
  };
}

function getConceptWinnerSide(match: OfflineInitializedMatch): ConceptWinnerSide {
  if (match.imposterWinsByVotingTie) {
    return "imposter";
  }

  if (match.accusedPlayerId !== match.imposterPlayerId) {
    return "imposter";
  }

  return normalizeGuess(match.imposterGuess) === normalizeGuess(match.concept.word)
    ? "imposter"
    : "non-imposters";
}

function getConceptResolution(match: OfflineInitializedMatch): ConceptResolution {
  if (match.imposterWinsByVotingTie) {
    return "imposter-wins-final-tie";
  }

  if (match.accusedPlayerId !== match.imposterPlayerId) {
    return "imposter-escaped-vote";
  }

  return normalizeGuess(match.imposterGuess) === normalizeGuess(match.concept.word)
    ? "imposter-correct-guess"
    : "non-imposters-caught-imposter";
}

function normalizeGuess(value: string): string {
  return value.trim().toLowerCase();
}

function awardPointsForConcept(
  playerScores: PlayerScore[],
  players: MatchConfigPlayer[],
  winnerSide: ConceptWinnerSide,
  imposterPlayerId: string,
): PlayerScore[] {
  const winningPlayerIds =
    winnerSide === "imposter"
      ? new Set([imposterPlayerId])
      : new Set(players.filter((player) => player.id !== imposterPlayerId).map((player) => player.id));

  return playerScores.map((playerScore) => ({
    ...playerScore,
    points: winningPlayerIds.has(playerScore.playerId)
      ? playerScore.points + 1
      : playerScore.points,
  }));
}

function buildConceptResult(match: OfflineInitializedMatch, finalVoteTallies: VoteTally[]): ConceptResult {
  return {
    conceptNumber: match.currentConceptNumber,
    conceptPublicId: match.concept.conceptPublicId,
    word: match.concept.word,
    winnerSide: getConceptWinnerSide(match),
    resolution: getConceptResolution(match),
    accusedPlayerId: match.accusedPlayerId,
    imposterPlayerId: match.imposterPlayerId,
    imposterWinsByVotingTie: match.imposterWinsByVotingTie,
    imposterGuess: match.imposterGuess ? match.imposterGuess : null,
    finalVoteTallies,
  };
}

export function enterImposterGuessPhase(
  match: OfflineInitializedMatch,
  startedAt = Date.now(),
): OfflineInitializedMatch {
  if (match.accusedPlayerId !== match.imposterPlayerId) {
    return match;
  }

  return {
    ...match,
    phase: "guess",
    votingState: "completed",
    guessState: "handoff",
    guessDurationSeconds: match.settings.imposterGuessTimerSeconds,
    guessEndsAt: startedAt + match.settings.imposterGuessTimerSeconds * 1000,
    imposterGuess: "",
  };
}

export function finalizeConceptResult(match: OfflineInitializedMatch): OfflineInitializedMatch {
  const conceptResult = buildConceptResult(match, match.finalVoteTallies);

  return {
    ...match,
    phase: "vote-result",
    guessState: "completed",
    conceptResults: [...match.conceptResults, conceptResult],
    playerScores: awardPointsForConcept(
      match.playerScores,
      match.players,
      conceptResult.winnerSide,
      match.imposterPlayerId,
    ),
  };
}

export function getLatestConceptResult(match: OfflineInitializedMatch): ConceptResult | null {
  return match.conceptResults.at(-1) ?? null;
}

export function hasMoreConceptsRemaining(match: OfflineInitializedMatch): boolean {
  return match.currentConceptNumber < match.totalConceptCount;
}

export function getPlayerScore(match: OfflineInitializedMatch, playerId: string): number {
  return match.playerScores.find((playerScore) => playerScore.playerId === playerId)?.points ?? 0;
}

export function getMatchLeaders(match: OfflineInitializedMatch): MatchConfigPlayer[] {
  const highestScore = Math.max(0, ...match.playerScores.map((playerScore) => playerScore.points));

  return match.players.filter((player) => getPlayerScore(match, player.id) === highestScore);
}

export function prepareNextConcept(
  match: OfflineInitializedMatch,
  concept: AssignedGameConcept,
  imposterPlayerId: string,
): OfflineInitializedMatch {
  return {
    ...match,
    phase: "reveal",
    revealState: "handoff",
    drawingState: "handoff",
    discussionState: "completed",
    votingState: "completed",
    guessState: "completed",
    currentConceptNumber: match.currentConceptNumber + 1,
    usedConceptPublicIds: [...match.usedConceptPublicIds, concept.conceptPublicId],
    startingPlayerOffset: (match.startingPlayerOffset + 1) % Math.max(match.players.length, 1),
    concept,
    imposterPlayerId,
    currentRevealIndex: 0,
    currentDrawingTurnIndex: 0,
    totalDrawingTurns: match.players.length * match.settings.roundsPerConcept,
    strokes: [],
    discussionDurationSeconds: match.settings.discussionTimerSeconds,
    discussionEndsAt: null,
    currentVotingPlayerIndex: 0,
    currentVotingRound: 1,
    restrictedVoteCandidateIds: null,
    votes: [],
    finalVoteTallies: [],
    accusedPlayerId: null,
    imposterWinsByVotingTie: false,
    guessDurationSeconds: match.settings.imposterGuessTimerSeconds,
    guessEndsAt: null,
    imposterGuess: "",
  };
}

export function finalizeMatch(match: OfflineInitializedMatch): OfflineInitializedMatch {
  return {
    ...match,
    phase: "match-summary",
  };
}

export function getCurrentVotingPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  if (match.players.length === 0 || match.currentVotingPlayerIndex < 0) {
    return null;
  }

  return match.players[match.currentVotingPlayerIndex] ?? null;
}

export function getNextVotingPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  if (match.currentVotingPlayerIndex >= match.players.length - 1) {
    return null;
  }

  return match.players[match.currentVotingPlayerIndex + 1] ?? null;
}

export function getVotingCandidates(match: OfflineInitializedMatch): MatchConfigPlayer[] {
  const currentVoter = getCurrentVotingPlayer(match);
  const restrictedIds = match.restrictedVoteCandidateIds;

  return match.players.filter((player) => {
    if (player.id === currentVoter?.id) {
      return false;
    }

    if (!restrictedIds) {
      return true;
    }

    return restrictedIds.includes(player.id);
  });
}

export function startVotingTurn(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "vote" || match.votingState !== "handoff" || !getCurrentVotingPlayer(match)) {
    return match;
  }

  return {
    ...match,
    votingState: "selecting",
  };
}

function tallyVotes(votes: PlayerVote[]): VoteTally[] {
  const counts = new Map<string, number>();

  for (const vote of votes) {
    counts.set(vote.suspectedPlayerId, (counts.get(vote.suspectedPlayerId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([playerId, voteCount]) => ({ playerId, voteCount }))
    .sort((left, right) => {
      if (right.voteCount !== left.voteCount) {
        return right.voteCount - left.voteCount;
      }

      return left.playerId.localeCompare(right.playerId);
    });
}

function getTiedHighestCandidateIds(tallies: VoteTally[]): string[] {
  const highestVoteCount = tallies[0]?.voteCount;

  if (!highestVoteCount) {
    return [];
  }

  const tiedTallies = tallies.filter((tally) => tally.voteCount === highestVoteCount);

  if (tiedTallies.length <= 1) {
    return [];
  }

  return tiedTallies.map((tally) => tally.playerId);
}

export function submitVote(
  match: OfflineInitializedMatch,
  suspectedPlayerId: string,
): OfflineInitializedMatch {
  if (match.phase !== "vote" || match.votingState !== "selecting") {
    return match;
  }

  const currentVoter = getCurrentVotingPlayer(match);

  if (!currentVoter || currentVoter.id === suspectedPlayerId) {
    return match;
  }

  if (match.votes.some((vote) => vote.voterPlayerId === currentVoter.id)) {
    return match;
  }

  const nextVotes = [
    ...match.votes,
    {
      voterPlayerId: currentVoter.id,
      suspectedPlayerId,
    },
  ];

  const isFinalVote = nextVotes.length >= match.players.length;

  if (isFinalVote) {
    const finalVoteTallies = tallyVotes(nextVotes);
    const tiedCandidateIds = getTiedHighestCandidateIds(finalVoteTallies);

    if (tiedCandidateIds.length > 0) {
      if (match.currentVotingRound >= MAX_VOTING_ROUNDS) {
        const resolvedMatch = {
          ...match,
          phase: "vote-result" as const,
          votingState: "completed" as const,
          restrictedVoteCandidateIds: tiedCandidateIds,
          votes: nextVotes,
          finalVoteTallies,
          accusedPlayerId: null,
          imposterWinsByVotingTie: true,
          guessState: "completed" as const,
          guessEndsAt: null,
          imposterGuess: "",
        };
        return finalizeConceptResult(resolvedMatch);
      }

      return {
        ...match,
        votingState: "tie-prompt",
        currentVotingPlayerIndex: 0,
        currentVotingRound: match.currentVotingRound + 1,
        restrictedVoteCandidateIds: tiedCandidateIds,
        votes: [],
        finalVoteTallies: finalVoteTallies,
        accusedPlayerId: null,
        imposterWinsByVotingTie: false,
        guessState: "completed",
        guessEndsAt: null,
        imposterGuess: "",
      };
    }

    const resolvedMatch = {
      ...match,
      phase: "vote" as const,
      votingState: "completed" as const,
      restrictedVoteCandidateIds: null,
      votes: nextVotes,
      finalVoteTallies,
      accusedPlayerId: finalVoteTallies[0]?.playerId ?? null,
      imposterWinsByVotingTie: false,
      guessState: "completed" as const,
      guessEndsAt: null,
      imposterGuess: "",
    };

    if (resolvedMatch.accusedPlayerId === resolvedMatch.imposterPlayerId) {
      return enterImposterGuessPhase(resolvedMatch);
    }

    return finalizeConceptResult(resolvedMatch);
  }

  return {
    ...match,
    votingState: "submitted",
    votes: nextVotes,
  };
}

export function continueFromSubmittedVote(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "vote" || match.votingState !== "submitted") {
    return match;
  }

  return {
    ...match,
    currentVotingPlayerIndex: match.currentVotingPlayerIndex + 1,
    votingState: "handoff",
  };
}

export function continueFromTiePrompt(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "vote" || match.votingState !== "tie-prompt") {
    return match;
  }

  return {
    ...match,
    votingState: "handoff",
    currentVotingPlayerIndex: 0,
  };
}

export function getTiedVotingPlayers(match: OfflineInitializedMatch): MatchConfigPlayer[] {
  if (!match.restrictedVoteCandidateIds) {
    return [];
  }

  return match.players.filter((player) => match.restrictedVoteCandidateIds?.includes(player.id));
}

export function getImposterPlayer(match: OfflineInitializedMatch): MatchConfigPlayer | null {
  return match.players.find((player) => player.id === match.imposterPlayerId) ?? null;
}

export function startImposterGuess(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "guess" || match.guessState !== "handoff") {
    return match;
  }

  return {
    ...match,
    guessState: "guessing",
  };
}

export function updateImposterGuess(
  match: OfflineInitializedMatch,
  nextGuess: string,
): OfflineInitializedMatch {
  if (match.phase !== "guess" || match.guessState !== "guessing") {
    return match;
  }

  return {
    ...match,
    imposterGuess: nextGuess,
  };
}

export function getGuessRemainingSeconds(
  match: OfflineInitializedMatch,
  now = Date.now(),
): number {
  if (match.phase !== "guess" || !match.guessEndsAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((match.guessEndsAt - now) / 1000));
}

export function submitImposterGuess(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.phase !== "guess" || match.guessState !== "guessing") {
    return match;
  }

  return finalizeConceptResult({
    ...match,
    guessState: "completed",
    guessEndsAt: null,
  });
}

export function isCurrentRevealPlayerImposter(match: OfflineInitializedMatch): boolean {
  const currentPlayer = getCurrentRevealPlayer(match);
  return currentPlayer?.id === match.imposterPlayerId;
}

export function revealCurrentPlayerRole(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.revealState !== "handoff" || !getCurrentRevealPlayer(match)) {
    return match;
  }

  return {
    ...match,
    revealState: "revealed",
  };
}

export function hideCurrentPlayerRole(match: OfflineInitializedMatch): OfflineInitializedMatch {
  if (match.revealState !== "revealed" || !getCurrentRevealPlayer(match)) {
    return match;
  }

  const isLastReveal = match.currentRevealIndex >= match.players.length - 1;

  if (isLastReveal) {
    return enterDrawingPhase({
      ...match,
      revealState: "completed",
    });
  }

  return {
    ...match,
    currentRevealIndex: match.currentRevealIndex + 1,
    revealState: "handoff",
  };
}
