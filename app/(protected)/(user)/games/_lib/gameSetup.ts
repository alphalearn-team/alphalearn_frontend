export const DEFAULT_PLAYER_COUNT = 2;

export const DEFAULT_GAME_SETTINGS = {
  conceptCount: 3,
  roundsPerConcept: 3,
  discussionTimerSeconds: 60,
  imposterGuessTimerSeconds: 30,
} as const;

export type GameMode = "offline";

export interface GameSetupPlayerDraft {
  id: string;
  name: string;
}

export interface GameSetupSettings {
  conceptCount: number;
  roundsPerConcept: number;
  discussionTimerSeconds: number;
  imposterGuessTimerSeconds: number;
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

export interface OfflineInitializedMatch {
  mode: GameMode;
  phase: "reveal";
  players: MatchConfigPlayer[];
  settings: GameSetupSettings;
  concept: AssignedGameConcept;
  imposterPlayerId: string;
  currentRevealIndex: number;
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

export function createPlayerDraft(sequence: number, name = `Player ${sequence}`): GameSetupPlayerDraft {
  return {
    id: `player-${sequence}`,
    name,
  };
}

export function createDefaultPlayers(count = DEFAULT_PLAYER_COUNT): GameSetupPlayerDraft[] {
  return Array.from({ length: count }, (_, index) => createPlayerDraft(index + 1));
}

export function createDefaultGameSetupForm(): GameSetupFormValues {
  return {
    players: createDefaultPlayers(),
    settings: { ...DEFAULT_GAME_SETTINGS },
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
      conceptCount: normalizeWholeNumber(values.settings.conceptCount),
      roundsPerConcept: normalizeWholeNumber(values.settings.roundsPerConcept),
      discussionTimerSeconds: normalizeWholeNumber(values.settings.discussionTimerSeconds),
      imposterGuessTimerSeconds: normalizeWholeNumber(values.settings.imposterGuessTimerSeconds),
    },
  };
}

export function initializeOfflineMatch(
  config: OfflineMatchConfig,
  concept: AssignedGameConcept,
  imposterPlayerId: string,
): OfflineInitializedMatch {
  return {
    mode: config.mode,
    phase: "reveal",
    players: config.players,
    settings: config.settings,
    concept,
    imposterPlayerId,
    currentRevealIndex: 0,
  };
}
