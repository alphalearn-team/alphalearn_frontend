"use client";

import { useCallback, useMemo, useReducer } from "react";
import { ApiError } from "@/lib/api/apiErrors";
import {
  cancelRankedMatchmaking,
  enqueueRankedMatchmaking,
  getRankedMatchmakingStatus,
} from "./api";
import type { MatchmakingEventState, RankedMatchmakingStatusDto } from "./types";

type RankedQueuePhase = "idle" | "searching" | "matched" | "cancelled" | "error";

interface RankedMatchmakingQueueState {
  phase: RankedQueuePhase;
  status: RankedMatchmakingStatusDto | null;
  busy: boolean;
  error: string | null;
}

type RankedMatchmakingQueueAction =
  | { type: "REQUEST_START" }
  | { type: "REQUEST_ERROR"; payload: string }
  | { type: "SET_STATUS"; payload: RankedMatchmakingStatusDto }
  | { type: "APPLY_EVENT"; payload: MatchmakingEventState }
  | { type: "CLEAR_ERROR" };

const STATUS_RETRY_DELAYS_MS = [200, 450];

export function useRankedMatchmakingQueue(accessToken: string | null) {
  const [state, dispatch] = useReducer(
    rankedMatchmakingQueueReducer,
    createInitialRankedMatchmakingQueueState(),
  );

  const hydrateStatus = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    dispatch({ type: "REQUEST_START" });

    try {
      const status = await getRankedStatusWithRetry(accessToken);
      dispatch({ type: "SET_STATUS", payload: status });
    } catch (error) {
      dispatch({
        type: "REQUEST_ERROR",
        payload:
          error instanceof Error && error.message
            ? error.message
            : "Could not load ranked matchmaking status.",
      });
    }
  }, [accessToken]);

  const enqueue = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    dispatch({ type: "REQUEST_START" });

    try {
      const status = await enqueueRankedMatchmaking(accessToken);
      dispatch({ type: "SET_STATUS", payload: status });
    } catch (error) {
      dispatch({
        type: "REQUEST_ERROR",
        payload:
          error instanceof Error && error.message
            ? error.message
            : "Could not enter ranked queue.",
      });
    }
  }, [accessToken]);

  const cancel = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    dispatch({ type: "REQUEST_START" });

    try {
      const status = await cancelRankedMatchmaking(accessToken);
      dispatch({ type: "SET_STATUS", payload: status });
    } catch (error) {
      dispatch({
        type: "REQUEST_ERROR",
        payload:
          error instanceof Error && error.message
            ? error.message
            : "Could not cancel ranked queue.",
      });
    }
  }, [accessToken]);

  const applyMatchmakingEvent = useCallback((eventState: MatchmakingEventState) => {
    dispatch({ type: "APPLY_EVENT", payload: eventState });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const helpers = useMemo(
    () => ({
      isSearching: state.phase === "searching",
      isMatched: state.phase === "matched",
      isBusy: state.busy,
      matchedLobbyPublicId: state.status?.lobbyPublicId ?? null,
      queuePosition: state.status?.queuePosition ?? null,
      queueSize: state.status?.queueSize ?? null,
    }),
    [state.busy, state.phase, state.status?.lobbyPublicId, state.status?.queuePosition, state.status?.queueSize],
  );

  return {
    state,
    ...helpers,
    hydrateStatus,
    enqueue,
    cancel,
    applyMatchmakingEvent,
    clearError,
  };
}

function createInitialRankedMatchmakingQueueState(): RankedMatchmakingQueueState {
  return {
    phase: "idle",
    status: null,
    busy: false,
    error: null,
  };
}

function rankedMatchmakingQueueReducer(
  state: RankedMatchmakingQueueState,
  action: RankedMatchmakingQueueAction,
): RankedMatchmakingQueueState {
  switch (action.type) {
    case "REQUEST_START":
      return {
        ...state,
        busy: true,
        error: null,
      };
    case "REQUEST_ERROR":
      return {
        ...state,
        busy: false,
        phase: "error",
        error: action.payload,
      };
    case "SET_STATUS":
      return {
        ...state,
        busy: false,
        status: action.payload,
        phase: toPhase(action.payload.state),
        error: null,
      };
    case "APPLY_EVENT": {
      const nextStatus: RankedMatchmakingStatusDto = {
        state: action.payload.state,
        lobbyPublicId: action.payload.lobbyPublicId,
        queuePosition: state.status?.queuePosition ?? null,
        queueSize: state.status?.queueSize ?? null,
      };
      return {
        ...state,
        busy: false,
        status: nextStatus,
        phase: toPhase(nextStatus.state),
      };
    }
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
        phase: state.status ? toPhase(state.status.state) : "idle",
      };
    default:
      return state;
  }
}

function toPhase(state: RankedMatchmakingStatusDto["state"]): RankedQueuePhase {
  if (state === "QUEUED") {
    return "searching";
  }

  if (state === "MATCHED") {
    return "matched";
  }

  if (state === "CANCELLED") {
    return "cancelled";
  }

  return "idle";
}

async function getRankedStatusWithRetry(
  accessToken: string,
): Promise<RankedMatchmakingStatusDto> {
  let lastError: unknown = null;

  for (const delayMs of [0, ...STATUS_RETRY_DELAYS_MS]) {
    if (delayMs > 0) {
      await waitMs(delayMs);
    }

    try {
      return await getRankedMatchmakingStatus(accessToken);
    } catch (error) {
      lastError = error;
      if (!isRetryableStatusError(error)) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Could not load ranked matchmaking status.");
}

function isRetryableStatusError(error: unknown): boolean {
  return error instanceof ApiError ? error.status >= 500 : true;
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
