"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Pagination from "@/components/pagination/Pagination";
import type {
  CreateFriendRequestPayload,
  FriendRequest,
  FriendRequestStatus,
  LearnerPublic,
  UpdateFriendRequestStatusPayload,
} from "@/interfaces/interfaces";
import { ApiError } from "@/lib/api/apiErrors";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { apiClientFetch } from "@/lib/api/apiClient";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";
import IncomingFriendRequestsPanel from "./IncomingFriendRequestsPanel";
import LearnerCard, { type LearnerCardFriendshipState } from "./LearnerCard";

interface LearnersGridProps {
  learners: LearnerPublic[];
  currentLearnerPublicId?: string | null;
}

type FriendRequestDecision = Extract<FriendRequestStatus, "APPROVED" | "REJECTED">;
type ResolvedRemoteFriendshipState = Extract<
  LearnerCardFriendshipState,
  "requested" | "incoming-request" | "connected"
>;

const ITEMS_PER_PAGE = 6;

function normalizePublicId(publicId: string) {
  return publicId.trim().toLowerCase();
}

function sortFriendRequests(requests: FriendRequest[]) {
  return [...requests].sort((left, right) => {
    const leftTimestamp = Date.parse(left.createdAt);
    const rightTimestamp = Date.parse(right.createdAt);
    const safeLeftTimestamp = Number.isNaN(leftTimestamp) ? 0 : leftTimestamp;
    const safeRightTimestamp = Number.isNaN(rightTimestamp) ? 0 : rightTimestamp;

    return safeRightTimestamp - safeLeftTimestamp;
  });
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() || null : null;
}

function normalizeStatusValue(value: unknown) {
  return normalizeOptionalString(value)?.replace(/\s+/g, "-") || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveFriendshipStateFromStatus(
  status: unknown,
  direction?: unknown,
): ResolvedRemoteFriendshipState | null {
  const normalizedStatus = normalizeStatusValue(status);
  const normalizedDirection = normalizeStatusValue(direction);

  if (!normalizedStatus) {
    return null;
  }

  if (
    normalizedStatus === "approved"
    || normalizedStatus === "accepted"
    || normalizedStatus === "connected"
    || normalizedStatus === "friends"
    || normalizedStatus === "friend"
    || normalizedStatus === "active"
  ) {
    return "connected";
  }

  if (
    normalizedStatus === "incoming-request"
    || normalizedStatus === "incoming-pending"
    || normalizedStatus === "received-request"
    || normalizedStatus === "request-received"
  ) {
    return "incoming-request";
  }

  if (
    normalizedStatus === "outgoing-request"
    || normalizedStatus === "outgoing-pending"
    || normalizedStatus === "request-sent"
    || normalizedStatus === "sent-request"
    || normalizedStatus === "requested"
  ) {
    return "requested";
  }

  if (normalizedStatus === "pending") {
    if (normalizedDirection === "incoming" || normalizedDirection === "received") {
      return "incoming-request";
    }

    return "requested";
  }

  return null;
}

function resolveFriendshipStateFromLearner(
  learner: LearnerPublic,
): ResolvedRemoteFriendshipState | null {
  const learnerRecord = learner as unknown as Record<string, unknown>;

  if (
    learnerRecord.isFriend === true
    || learnerRecord.areFriends === true
    || learnerRecord.isConnected === true
    || learnerRecord.connected === true
  ) {
    return "connected";
  }

  const candidatePairs: Array<[unknown, unknown]> = [
    [learnerRecord.friendshipStatus, learnerRecord.friendshipDirection],
    [learnerRecord.relationshipStatus, learnerRecord.relationshipDirection],
    [learnerRecord.connectionStatus, learnerRecord.connectionDirection],
    [learnerRecord.friendRequestStatus, learnerRecord.friendRequestDirection],
    [learnerRecord.friendship_status, learnerRecord.friendship_direction],
    [learnerRecord.relationship_status, learnerRecord.relationship_direction],
    [learnerRecord.connection_status, learnerRecord.connection_direction],
    [learnerRecord.friend_request_status, learnerRecord.friend_request_direction],
  ];

  for (const [status, direction] of candidatePairs) {
    const resolvedState = resolveFriendshipStateFromStatus(status, direction);

    if (resolvedState) {
      return resolvedState;
    }
  }

  return null;
}

function getArrayPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidateKeys = ["data", "items", "friends", "friendships", "content"];

  for (const key of candidateKeys) {
    const candidateValue = payload[key];

    if (Array.isArray(candidateValue)) {
      return candidateValue;
    }
  }

  return [];
}

function extractOtherPublicIdFromFriendshipRecord(
  record: Record<string, unknown>,
  currentLearnerPublicId?: string | null,
) {
  const currentPublicId = normalizeOptionalString(currentLearnerPublicId);
  const directKeys = [
    "otherUserPublicId",
    "friendPublicId",
    "learnerPublicId",
    "userPublicId",
  ];

  for (const key of directKeys) {
    const candidateValue = normalizeOptionalString(record[key]);

    if (candidateValue && candidateValue !== currentPublicId) {
      return candidateValue;
    }
  }

  const senderPublicId = normalizeOptionalString(record.senderPublicId ?? record.sender_public_id);
  const receiverPublicId = normalizeOptionalString(
    record.receiverPublicId ?? record.receiver_public_id,
  );

  if (currentPublicId && senderPublicId && receiverPublicId) {
    if (senderPublicId === currentPublicId) {
      return receiverPublicId;
    }

    if (receiverPublicId === currentPublicId) {
      return senderPublicId;
    }
  }

  const nestedCandidateKeys = ["friend", "learner", "user", "otherUser", "other_user"];

  for (const key of nestedCandidateKeys) {
    const nestedValue = record[key];

    if (!isRecord(nestedValue)) {
      continue;
    }

    const nestedPublicId = normalizeOptionalString(
      nestedValue.publicId
        ?? nestedValue.public_id
        ?? nestedValue.otherUserPublicId
        ?? nestedValue.other_user_public_id,
    );

    if (nestedPublicId) {
      return nestedPublicId;
    }
  }

  const directPublicId = normalizeOptionalString(record.publicId ?? record.public_id);
  const appearsToBeLearnerRecord = Boolean(
    normalizeOptionalString(record.username ?? record.user_name ?? record.name),
  );

  if (
    directPublicId
    && directPublicId !== currentPublicId
    && appearsToBeLearnerRecord
  ) {
    return directPublicId;
  }

  return null;
}

function extractConnectedPublicIdsFromPayload(
  payload: unknown,
  currentLearnerPublicId?: string | null,
) {
  const connectedPublicIds = new Set<string>();

  for (const item of getArrayPayload(payload)) {
    if (!isRecord(item)) {
      continue;
    }

    const publicId = extractOtherPublicIdFromFriendshipRecord(
      item,
      currentLearnerPublicId,
    );

    if (publicId) {
      connectedPublicIds.add(publicId);
    }
  }

  return [...connectedPublicIds];
}

function isPendingRequest(request: FriendRequest) {
  return request.status === "PENDING";
}

function isApprovedRequest(request: FriendRequest) {
  return request.status === "APPROVED";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function toFriendlyFriendshipError(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("yourself")) {
    return "You can't send a friend request to yourself.";
  }

  if (
    normalizedMessage.includes("already sent")
    || normalizedMessage.includes("request already exists")
    || normalizedMessage.includes("request already sent")
  ) {
    return "A friend request is already pending for that learner.";
  }

  if (
    normalizedMessage.includes("incoming request already pending")
    || (normalizedMessage.includes("incoming") && normalizedMessage.includes("pending"))
  ) {
    return "That learner already sent you a request. Use the incoming requests section to respond.";
  }

  if (normalizedMessage.includes("already friends")) {
    return "You are already friends with that learner.";
  }

  if (normalizedMessage.includes("not found")) {
    return "That friend request no longer exists.";
  }

  if (
    normalizedMessage.includes("not authenticated")
    || normalizedMessage.includes("unauthorized")
    || normalizedMessage.includes("401")
  ) {
    return "Your session expired. Refresh the page and sign in again.";
  }

  if (
    normalizedMessage.includes("forbidden")
    || normalizedMessage.includes("not allowed")
    || normalizedMessage.includes("403")
  ) {
    return "You are not allowed to perform that action.";
  }

  return message;
}

function upsertFriendRequest(requests: FriendRequest[], nextRequest: FriendRequest) {
  return sortFriendRequests([
    nextRequest,
    ...requests.filter((request) => request.requestId !== nextRequest.requestId),
  ]);
}

async function fetchFriendRequestLists(
  accessToken: string,
  signal?: AbortSignal,
) {
  const [incoming, outgoing] = await Promise.all([
    apiClientFetch<FriendRequest[]>(
      "/friend-requests?direction=INCOMING",
      accessToken,
      { signal },
    ),
    apiClientFetch<FriendRequest[]>(
      "/friend-requests?direction=OUTGOING",
      accessToken,
      { signal },
    ),
  ]);

  return {
    incoming: sortFriendRequests(incoming),
    outgoing: sortFriendRequests(outgoing),
  };
}

async function fetchConnectedFriendIds(
  accessToken: string,
  currentLearnerPublicId?: string | null,
  signal?: AbortSignal,
) {
  const endpointCandidates = ["/friends"];

  for (const endpoint of endpointCandidates) {
    try {
      const payload = await apiClientFetch<unknown>(endpoint, accessToken, { signal });
      return extractConnectedPublicIdsFromPayload(payload, currentLearnerPublicId);
    } catch (error) {
      if (
        error instanceof ApiError
        && (error.status === 404 || error.status === 405)
      ) {
        continue;
      }

      throw error;
    }
  }

  return [];
}

async function fetchFriendshipState(
  accessToken: string,
  currentLearnerPublicId?: string | null,
  signal?: AbortSignal,
) {
  const [{ incoming, outgoing }, connectedPublicIds] = await Promise.all([
    fetchFriendRequestLists(accessToken, signal),
    fetchConnectedFriendIds(accessToken, currentLearnerPublicId, signal),
  ]);

  return {
    incoming,
    outgoing,
    connectedPublicIds,
  };
}

export default function LearnersGrid({
  learners,
  currentLearnerPublicId,
}: LearnersGridProps) {
  const { session, isLoading: isAuthLoading } = useAuth();
  const accessToken = session?.access_token ?? null;
  const authUserId = session?.user.id ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friendRequestsLoadError, setFriendRequestsLoadError] = useState<string | null>(null);
  const [isLoadingFriendRequests, setIsLoadingFriendRequests] = useState(true);
  const [isRefreshingFriendRequests, setIsRefreshingFriendRequests] = useState(false);
  const [hasLoadedFriendRequests, setHasLoadedFriendRequests] = useState(false);
  const [sendingLearnerIds, setSendingLearnerIds] = useState<string[]>([]);
  const [requestMutations, setRequestMutations] = useState<
    Record<number, FriendRequestDecision>
  >({});
  const [localConnectedUserIds, setLocalConnectedUserIds] = useState<string[]>([]);
  const [remoteConnectedUserIds, setRemoteConnectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setIncomingRequests([]);
    setOutgoingRequests([]);
    setHasLoadedFriendRequests(false);
    setFriendRequestsLoadError(null);
    setIsLoadingFriendRequests(true);
    setIsRefreshingFriendRequests(false);
    setSendingLearnerIds([]);
    setRequestMutations({});
    setLocalConnectedUserIds([]);
    setRemoteConnectedUserIds([]);
  }, [authUserId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!accessToken) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setHasLoadedFriendRequests(false);
      setIsLoadingFriendRequests(false);
      setIsRefreshingFriendRequests(false);
      setFriendRequestsLoadError(
        "Your session is unavailable. Refresh the page and sign in again.",
      );
      return;
    }

    const abortController = new AbortController();

    setIsLoadingFriendRequests(true);
    setFriendRequestsLoadError(null);

    void fetchFriendshipState(
      accessToken,
      currentLearnerPublicId,
      abortController.signal,
    )
      .then(({ incoming, outgoing, connectedPublicIds }) => {
        if (abortController.signal.aborted) {
          return;
        }

        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
        setRemoteConnectedUserIds(connectedPublicIds);
        setHasLoadedFriendRequests(true);
        setFriendRequestsLoadError(null);
      })
      .catch((error) => {
        if (abortController.signal.aborted) {
          return;
        }

        setFriendRequestsLoadError(
          toFriendlyFriendshipError(
            error,
            "Could not load friend requests right now.",
          ),
        );
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingFriendRequests(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [accessToken, currentLearnerPublicId, isAuthLoading]);

  const refreshFriendRequests = async (options?: { showFailureToast?: boolean }) => {
    if (!accessToken) {
      const message = "Your session is unavailable. Refresh the page and sign in again.";
      setFriendRequestsLoadError(message);

      if (options?.showFailureToast) {
        showError(message);
      }

      return false;
    }

    setIsRefreshingFriendRequests(true);

    try {
      const {
        incoming,
        outgoing,
        connectedPublicIds,
      } = await fetchFriendshipState(accessToken, currentLearnerPublicId);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setRemoteConnectedUserIds(connectedPublicIds);
      setHasLoadedFriendRequests(true);
      setFriendRequestsLoadError(null);

      return true;
    } catch (error) {
      const message = toFriendlyFriendshipError(
        error,
        "Could not refresh friend requests right now.",
      );
      setFriendRequestsLoadError(message);

      if (options?.showFailureToast) {
        showError(message);
      }

      return false;
    } finally {
      setIsRefreshingFriendRequests(false);
    }
  };

  const addConnectedUserId = (publicId: string) => {
    const normalizedPublicId = normalizePublicId(publicId);

    setLocalConnectedUserIds((currentPublicIds) => {
      if (currentPublicIds.includes(normalizedPublicId)) {
        return currentPublicIds;
      }

      return [...currentPublicIds, normalizedPublicId];
    });
  };

  const pendingIncomingRequests = incomingRequests.filter(isPendingRequest);
  const pendingOutgoingRequests = outgoingRequests.filter(isPendingRequest);
  const pendingIncomingUserIds = new Set(
    pendingIncomingRequests.map((request) => normalizePublicId(request.otherUserPublicId)),
  );
  const pendingOutgoingUserIds = new Set(
    pendingOutgoingRequests.map((request) => normalizePublicId(request.otherUserPublicId)),
  );
  const connectedUserIds = new Set([
    ...localConnectedUserIds,
    ...remoteConnectedUserIds,
  ]);
  const remoteFriendshipStates = new Map(
    learners.map((learner) => [
      normalizePublicId(learner.publicId),
      resolveFriendshipStateFromLearner(learner),
    ]),
  );

  for (const request of incomingRequests) {
    if (isApprovedRequest(request)) {
      connectedUserIds.add(normalizePublicId(request.otherUserPublicId));
    }
  }

  for (const request of outgoingRequests) {
    if (isApprovedRequest(request)) {
      connectedUserIds.add(normalizePublicId(request.otherUserPublicId));
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLearners = normalizedQuery
    ? learners.filter((learner) => learner.username.toLowerCase().includes(normalizedQuery))
    : learners;

  const totalPages = Math.ceil(filteredLearners.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLearners = filteredLearners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getLearnerFriendshipState = (learnerPublicId: string): LearnerCardFriendshipState => {
    const normalizedPublicId = normalizePublicId(learnerPublicId);
    const remoteFriendshipState = remoteFriendshipStates.get(normalizedPublicId) ?? null;

    if (sendingLearnerIds.includes(normalizedPublicId)) {
      return "sending";
    }

    if (
      connectedUserIds.has(normalizedPublicId)
      || remoteFriendshipState === "connected"
    ) {
      return "connected";
    }

    if (
      pendingOutgoingUserIds.has(normalizedPublicId)
      || remoteFriendshipState === "requested"
    ) {
      return "requested";
    }

    if (
      pendingIncomingUserIds.has(normalizedPublicId)
      || remoteFriendshipState === "incoming-request"
    ) {
      return "incoming-request";
    }

    if (!hasLoadedFriendRequests) {
      if (isAuthLoading || isLoadingFriendRequests) {
        return "loading";
      }

      return "unavailable";
    }

    return "ready";
  };

  const handleSendFriendRequest = async (learner: LearnerPublic) => {
    const normalizedPublicId = normalizePublicId(learner.publicId);

    if (!accessToken) {
      showError("Your session expired. Refresh the page and sign in again.");
      return;
    }

    if (
      !hasLoadedFriendRequests
      || sendingLearnerIds.includes(normalizedPublicId)
      || pendingOutgoingUserIds.has(normalizedPublicId)
      || pendingIncomingUserIds.has(normalizedPublicId)
      || connectedUserIds.has(normalizedPublicId)
    ) {
      return;
    }

    setSendingLearnerIds((currentPublicIds) => {
      if (currentPublicIds.includes(normalizedPublicId)) {
        return currentPublicIds;
      }

      return [...currentPublicIds, normalizedPublicId];
    });

    try {
      const payload: CreateFriendRequestPayload = {
        receiverPublicId: learner.publicId,
      };

      const createdRequest = await apiClientFetch<FriendRequest>(
        "/friend-requests",
        accessToken,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      setOutgoingRequests((currentRequests) =>
        upsertFriendRequest(currentRequests, createdRequest),
      );
      showSuccess(`Friend request sent to ${learner.username}.`);

      const refreshed = await refreshFriendRequests();
      if (!refreshed) {
        showError("Friend request sent, but the request lists could not be refreshed.");
      }
    } catch (error) {
      const rawMessage = getErrorMessage(error, "").toLowerCase();
      const message = toFriendlyFriendshipError(
        error,
        `Could not send a friend request to ${learner.username}.`,
      );

      showError(message);

      if (rawMessage.includes("already friends")) {
        addConnectedUserId(learner.publicId);
      }

      if (
        rawMessage.includes("already sent")
        || rawMessage.includes("already friends")
        || (rawMessage.includes("incoming") && rawMessage.includes("pending"))
      ) {
        void refreshFriendRequests();
      }
    } finally {
      setSendingLearnerIds((currentPublicIds) =>
        currentPublicIds.filter((publicId) => publicId !== normalizedPublicId),
      );
    }
  };

  const handleUpdateFriendRequest = async (
    request: FriendRequest,
    status: FriendRequestDecision,
  ) => {
    if (!accessToken || requestMutations[request.requestId]) {
      return;
    }

    setRequestMutations((currentMutations) => ({
      ...currentMutations,
      [request.requestId]: status,
    }));

    try {
      const payload: UpdateFriendRequestStatusPayload = { status };

      await apiClientFetch<void>(
        `/friend-requests/${request.requestId}`,
        accessToken,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      setIncomingRequests((currentRequests) =>
        currentRequests.filter(
          (currentRequest) => currentRequest.requestId !== request.requestId,
        ),
      );

      if (status === "APPROVED") {
        addConnectedUserId(request.otherUserPublicId);
        showSuccess(`Friend request from ${request.otherUsername} accepted.`);
      } else {
        showSuccess(`Friend request from ${request.otherUsername} rejected.`);
      }

      const refreshed = await refreshFriendRequests();
      if (!refreshed) {
        showError("The request was updated, but the request lists could not be refreshed.");
      }
    } catch (error) {
      const fallback =
        status === "APPROVED"
          ? `Could not accept ${request.otherUsername}'s friend request.`
          : `Could not reject ${request.otherUsername}'s friend request.`;

      showError(toFriendlyFriendshipError(error, fallback));
      void refreshFriendRequests();
    } finally {
      setRequestMutations((currentMutations) => {
        const nextMutations = { ...currentMutations };
        delete nextMutations[request.requestId];
        return nextMutations;
      });
    }
  };

  return (
    <Stack gap="xl">
      <IncomingFriendRequestsPanel
        requests={pendingIncomingRequests}
        isLoading={isLoadingFriendRequests && !hasLoadedFriendRequests}
        isRefreshing={isRefreshingFriendRequests}
        loadError={friendRequestsLoadError}
        requestMutations={requestMutations}
        onAccept={(request) => handleUpdateFriendRequest(request, "APPROVED")}
        onReject={(request) => handleUpdateFriendRequest(request, "REJECTED")}
        onRetry={() => {
          void refreshFriendRequests({ showFailureToast: true });
        }}
      />

      {learners.length === 0 ? (
        <LearnersEmptyState />
      ) : (
        <>
          <LearnersHeader
            filteredCount={filteredLearners.length}
            searchQuery={searchQuery}
            totalCount={learners.length}
            onSearchChange={setSearchQuery}
          />

          {filteredLearners.length === 0 ? (
            <LearnersNoResultsState
              query={searchQuery}
              onClearSearch={() => setSearchQuery("")}
            />
          ) : (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {paginatedLearners.map((learner) => (
                  <LearnerCard
                    key={learner.publicId}
                    {...learner}
                    friendshipState={getLearnerFriendshipState(learner.publicId)}
                    onSendFriendRequest={handleSendFriendRequest}
                  />
                ))}
              </SimpleGrid>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredLearners.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  itemLabel="learners"
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </>
      )}
    </Stack>
  );
}

function LearnersHeader({
  filteredCount,
  searchQuery,
  totalCount,
  onSearchChange,
}: {
  filteredCount: number;
  searchQuery: string;
  totalCount: number;
  onSearchChange: (value: string) => void;
}) {
  const hasQuery = searchQuery.trim().length > 0;
  const countLabel = hasQuery
    ? `${filteredCount} of ${totalCount} ${totalCount === 1 ? "learner" : "learners"}`
    : `${totalCount} ${totalCount === 1 ? "learner" : "learners"} available`;

  return (
    <Group justify="space-between" align="center" className="gap-4">
      <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {countLabel}
      </span>

      <div className="w-full max-w-sm">
        <TextInput
          aria-label="Search learners by username"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Search learners..."
          leftSection={
            <span className="material-symbols-outlined text-[18px] text-[var(--color-text-muted)]">
              search
            </span>
          }
          styles={{
            input: {
              minHeight: "46px",
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            },
          }}
        />
      </div>
    </Group>
  );
}

function LearnersEmptyState() {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          groups
        </span>
      </div>

      <Title order={3} className="text-[var(--color-text-muted)]">
        No learners yet
      </Title>

      <Text className="text-sm text-[var(--color-text-muted)]">
        No learner profiles are available to browse right now.
      </Text>
    </Stack>
  );
}

function LearnersNoResultsState({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) {
  return (
    <Stack align="center" py={100} gap="md">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">
          person_search
        </span>
      </div>

      <Title order={3} className="text-center text-[var(--color-text-muted)]">
        No learners match your search
      </Title>

      <Text className="max-w-md text-center text-sm text-[var(--color-text-muted)]">
        No usernames matched &quot;{query.trim()}&quot;. Try a different search or clear the filter.
      </Text>

      <Button
        variant="outline"
        radius="xl"
        onClick={onClearSearch}
        styles={{
          root: {
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          },
        }}
      >
        Clear Search
      </Button>
    </Stack>
  );
}
