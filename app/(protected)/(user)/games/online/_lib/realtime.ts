import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  DrawingLiveRequest,
  GuessRequest,
  RealtimeEnvelope,
  SharedState,
  ViewerState,
  VoteRequest,
} from "./types";

interface RealtimeClientCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onSharedEnvelope: (envelope: RealtimeEnvelope<SharedState>) => void;
  onViewerEnvelope: (envelope: RealtimeEnvelope<ViewerState>) => void;
  onError: (message: string) => void;
}

const DRAW_LIVE_SEND_INTERVAL_MS = 350;
const MAX_DRAW_LIVE_PAYLOAD_BYTES = 64 * 1024;

export interface ImposterLobbyRealtimeClient {
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
  sendDrawingLive: (request: DrawingLiveRequest) => void;
  sendVote: (request: VoteRequest) => void;
  sendGuess: (request: GuessRequest) => void;
}

export function createImposterLobbyRealtimeClient(
  lobbyPublicId: string,
  accessToken: string,
  callbacks: RealtimeClientCallbacks,
): ImposterLobbyRealtimeClient {
  const wsEndpoint = resolveWsEndpoint();
  const topicDestination = `/topic/imposter/lobbies/${lobbyPublicId}`;
  const viewerDestination = `/user/queue/imposter/lobbies/${lobbyPublicId}`;
  const drawDestination = `/app/imposter/lobbies/${lobbyPublicId}/drawing/live`;
  const voteDestination = `/app/imposter/lobbies/${lobbyPublicId}/vote`;
  const guessDestination = `/app/imposter/lobbies/${lobbyPublicId}/guess`;
  let latestPendingDrawing: DrawingLiveRequest | null = null;
  let drawFlushTimer: ReturnType<typeof setTimeout> | null = null;
  let lastDrawSentAt = 0;

  const client = new Client({
    webSocketFactory: () => new SockJS(wsEndpoint),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    ...(supportsLargeFrameSplit()
      ? {
          splitLargeFrames: true,
          maxWebSocketChunkSize: 8 * 1024,
        }
      : {}),
    onConnect: () => {
      callbacks.onConnect();

      client.subscribe(topicDestination, (message) => {
        const envelope = parseEnvelope<SharedState>(message);
        if (!envelope) {
          return;
        }
        callbacks.onSharedEnvelope(envelope);
      });

      client.subscribe(viewerDestination, (message) => {
        const envelope = parseEnvelope<ViewerState>(message);
        if (!envelope) {
          return;
        }
        callbacks.onViewerEnvelope(envelope);
      });
    },
    onStompError: (frame) => {
      console.log("STOMP ERROR", {
        message: frame.headers["message"],
        body: frame.body,
      });
      callbacks.onError(frame.body || frame.headers.message || "STOMP protocol error");
    },
    onWebSocketClose: (evt) => {
      console.log("WS CLOSE", {
        code: evt.code,
        reason: evt.reason,
        wasClean: evt.wasClean,
      });
      callbacks.onDisconnect();
    },
    onWebSocketError: (evt) => {
      console.log("WS ERROR", evt);
      callbacks.onError("WebSocket transport error");
    },
    debug: (msg) => {
      console.log("STOMP DEBUG", msg);
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
      clearDrawFlushTimer(drawFlushTimer);
      drawFlushTimer = null;
      latestPendingDrawing = null;
      void client.deactivate();
    },
    isConnected() {
      return client.connected;
    },
    sendDrawingLive(request) {
      latestPendingDrawing = request;
      const now = Date.now();
      const msUntilFlush = Math.max(0, DRAW_LIVE_SEND_INTERVAL_MS - (now - lastDrawSentAt));
      if (msUntilFlush === 0) {
        flushLatestDrawing();
        return;
      }

      if (drawFlushTimer != null) {
        return;
      }
      drawFlushTimer = setTimeout(() => {
        drawFlushTimer = null;
        flushLatestDrawing();
      }, msUntilFlush);
    },
    sendVote(request) {
      publishJson(client, voteDestination, request);
    },
    sendGuess(request) {
      publishJson(client, guessDestination, request);
    },
  };

  function flushLatestDrawing(): void {
    if (!client.connected || !latestPendingDrawing) {
      return;
    }

    const body = JSON.stringify(latestPendingDrawing);
    const payloadBytes = byteLengthUtf8(body);
    if (process.env.NODE_ENV !== "production") {
      console.debug("DRAW LIVE payload bytes", payloadBytes);
    }

    if (payloadBytes > MAX_DRAW_LIVE_PAYLOAD_BYTES) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("DRAW LIVE payload exceeds limit", {
          payloadBytes,
          limitBytes: MAX_DRAW_LIVE_PAYLOAD_BYTES,
        });
      }
      return;
    }

    client.publish({
      destination: drawDestination,
      body,
    });
    lastDrawSentAt = Date.now();
  }
}

function parseEnvelope<T>(message: IMessage): RealtimeEnvelope<T> | null {
  try {
    const parsed: unknown = JSON.parse(message.body);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const envelope = parsed as RealtimeEnvelope<T>;

    if (
      typeof envelope.type !== "string" ||
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

function publishJson(client: Client, destination: string, body: unknown): void {
  if (!client.connected) {
    return;
  }

  client.publish({
    destination,
    body: JSON.stringify(body),
  });
}

function clearDrawFlushTimer(timer: ReturnType<typeof setTimeout> | null): void {
  if (timer != null) {
    clearTimeout(timer);
  }
}

function byteLengthUtf8(input: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(input).length;
  }
  return unescape(encodeURIComponent(input)).length;
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
