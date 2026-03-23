export interface MatchParticipant {
  id: string;
  name: string;
}

export interface ImposterAssignmentResult {
  imposterPlayerId: string;
}

export function assignImposter(
  players: MatchParticipant[],
  randomValue: number = Math.random(),
): ImposterAssignmentResult {
  if (players.length === 0) {
    throw new Error("At least one player is required to assign an imposter");
  }

  const normalizedRandom = Number.isFinite(randomValue) ? randomValue : 0;
  const boundedRandom = Math.min(Math.max(normalizedRandom, 0), 0.9999999999999999);
  const imposterIndex = Math.floor(boundedRandom * players.length);

  return {
    imposterPlayerId: players[imposterIndex].id,
  };
}
