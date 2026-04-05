import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  MatchmakingEventReason,
  MatchmakingEventState,
  RealtimeEnvelope,
} from "./types";

interface MatchmakingRealtimeCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onEvent: (
    envelope: RealtimeEnvelope<MatchmakingEventState> & {
      reason: MatchmakingEventReason;
    },
  ) => void;
  onError: (message: string) => void;
}

const STOMP_HEARTBEAT_INCOMING_MS = 10_000;
const STOMP_HEARTBEAT_OUTGOING_MS = 10_000;

export interface MatchmakingRealtimeClient {
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

export function createRankedMatchmakingRealtimeClient(
  accessToken: string,
  callbacks: MatchmakingRealtimeCallbacks,
): MatchmakingRealtimeClient {
  const wsEndpoint = resolveWsEndpoint();
  const destination = "/user/queue/imposter/matchmaking";

  const client = new Client({
    webSocketFactory: () => new SockJS(wsEndpoint),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 2000,
    heartbeatIncoming: STOMP_HEARTBEAT_INCOMING_MS,
    heartbeatOutgoing: STOMP_HEARTBEAT_OUTGOING_MS,
    ...(supportsLargeFrameSplit()
      ? {
          splitLargeFrames: true,
          maxWebSocketChunkSize: 8 * 1024,
        }
      : {}),
    onConnect: () => {
      callbacks.onConnect();

      client.subscribe(destination, (message) => {
        const envelope = parseMatchmakingEnvelope(message);
        if (!envelope) {
          return;
        }

        callbacks.onEvent(envelope);
      });
    },
    onStompError: (frame) => {
      callbacks.onError(frame.body || frame.headers.message || "STOMP protocol error");
    },
    onWebSocketClose: () => {
      callbacks.onDisconnect();
    },
    onWebSocketError: () => {
      callbacks.onError("WebSocket transport error");
    },
  });

  return {
    connect() {
      if (client.active) {
        return;
      }

      client.activate();
    },
    disconnect() {
      if (!client.active) {
        return;
      }

      void client.deactivate();
    },
    isConnected() {
      return client.connected;
    },
  };
}

function parseMatchmakingEnvelope(
  message: IMessage,
): (RealtimeEnvelope<MatchmakingEventState> & {
  reason: MatchmakingEventReason;
}) | null {
  try {
    const parsed: unknown = JSON.parse(message.body);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const envelope = parsed as RealtimeEnvelope<MatchmakingEventState> & {
      reason: MatchmakingEventReason;
    };

    if (
      envelope.type !== "MATCHMAKING_EVENT" ||
      typeof envelope.lobbyPublicId !== "string" ||
      typeof envelope.reason !== "string" ||
      typeof envelope.emittedAt !== "string"
    ) {
      return null;
    }

    return envelope;
  } catch {
    return null;
  }
}

function supportsLargeFrameSplit(): boolean {
  return true;
}

function resolveWsEndpoint(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!configuredBaseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const url = new URL(configuredBaseUrl);
  const trimmedPathname = url.pathname.replace(/\/+$/, "");
  const basePath = trimmedPathname.endsWith("/api")
    ? trimmedPathname.slice(0, -4)
    : trimmedPathname;

  url.pathname = `${basePath}/ws`.replace(/\/{2,}/g, "/");
  url.search = "";
  url.hash = "";

  return url.toString();
}
