import type {
  ConceptResolution,
  SharedState,
  VoteTally,
} from "../online/_lib/types";

export interface OnlineScoreRow {
  learnerPublicId: string;
  username: string;
  points: number;
}

export interface OnlineVoteTallyRow {
  learnerPublicId: string;
  username: string;
  voteCount: number;
}

export interface OnlineConceptResultViewModel {
  conceptNumber: number | null;
  conceptLabel: string | null;
  winnerSide: "IMPOSTER" | "NON_IMPOSTERS";
  resolution: ConceptResolution;
  accusedPublicId: string | null;
  accusedLabel: string;
  imposterPublicId: string | null;
  imposterLabel: string;
  imposterGuess: string | null;
  imposterWinsByVotingTie: boolean;
  finalVoteTallies: OnlineVoteTallyRow[];
  scoreRows: OnlineScoreRow[];
}

function toUsername(
  lobbyState: SharedState,
  learnerPublicId: string | null,
): string {
  if (!learnerPublicId) {
    return "No accusation";
  }

  return (
    lobbyState.activeMembers.find((member) => member.learnerPublicId === learnerPublicId)?.username ??
    "Unknown learner"
  );
}

function compareScoreRows(left: OnlineScoreRow, right: OnlineScoreRow): number {
  if (right.points !== left.points) {
    return right.points - left.points;
  }

  const byName = left.username.localeCompare(right.username);
  if (byName !== 0) {
    return byName;
  }

  return left.learnerPublicId.localeCompare(right.learnerPublicId);
}

function mapVoteTallies(
  lobbyState: SharedState,
  tallies: VoteTally[],
): OnlineVoteTallyRow[] {
  return tallies
    .map((tally) => ({
      learnerPublicId: tally.learnerPublicId,
      username: toUsername(lobbyState, tally.learnerPublicId),
      voteCount: tally.voteCount,
    }))
    .sort((left, right) => {
      if (right.voteCount !== left.voteCount) {
        return right.voteCount - left.voteCount;
      }

      return left.username.localeCompare(right.username);
    });
}

export function mapOnlineScoreRows(lobbyState: SharedState): OnlineScoreRow[] {
  return (lobbyState.playerScores ?? [])
    .map((score) => ({
      learnerPublicId: score.learnerPublicId,
      username: toUsername(lobbyState, score.learnerPublicId),
      points: score.points,
    }))
    .sort(compareScoreRows);
}

export function mapOnlineConceptResultViewModel(
  lobbyState: SharedState,
): OnlineConceptResultViewModel | null {
  const conceptResult = lobbyState.latestConceptResult;
  if (!conceptResult) {
    return null;
  }

  return {
    conceptNumber: conceptResult.conceptNumber,
    conceptLabel: conceptResult.conceptLabel,
    winnerSide: conceptResult.winnerSide,
    resolution: conceptResult.resolution,
    accusedPublicId: conceptResult.accusedPublicId,
    accusedLabel: toUsername(lobbyState, conceptResult.accusedPublicId),
    imposterPublicId: conceptResult.imposterPublicId,
    imposterLabel: toUsername(lobbyState, conceptResult.imposterPublicId),
    imposterGuess: conceptResult.imposterGuess,
    imposterWinsByVotingTie: conceptResult.imposterWinsByVotingTie,
    finalVoteTallies: mapVoteTallies(lobbyState, conceptResult.finalVoteTallies),
    scoreRows: mapOnlineScoreRows(lobbyState),
  };
}
