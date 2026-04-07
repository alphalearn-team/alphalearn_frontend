"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Avatar, Loader, Skeleton, TextInput } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import {
  cancelFriendRequest,
  fetchFriendRequests,
  fetchFriends,
  fetchLearners,
  getAddFriendErrorMessage,
  getCancelFriendRequestErrorMessage,
  getFriendRequestsLoadErrorMessage,
  getFriendsLoadErrorMessage,
  getLearnersLoadErrorMessage,
  getRespondToFriendRequestErrorMessage,
  getUnfriendErrorMessage,
  searchFriends,
  searchLearners,
  sendFriendRequest,
  type Friend,
  type FriendRequest,
  type LearnerPublic,
  unfriend,
  updateFriendRequestStatus,
} from "@/lib/utils/friends";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";

interface ProfileSquadSectionProps {
  accessToken: string;
  currentUserPublicId: string;
  currentUsername: string;
}

function SectionCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.85)] md:p-7 ${className}`}>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          {title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function SquadListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height={44} radius="xl" />
      <Skeleton height={72} radius="xl" />
      <Skeleton height={72} radius="xl" />
      <Skeleton height={72} radius="xl" />
    </div>
  );
}

function PendingRequestSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height={72} radius="xl" />
      <Skeleton height={72} radius="xl" />
    </div>
  );
}

function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-center">
      <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
}

function getUserInitials(username: string) {
  const parts = username.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AL";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function UserListAvatar({
  username,
  profilePictureUrl,
}: {
  username: string;
  profilePictureUrl: string | null;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const avatarSrc = profilePictureUrl && !hasImageError ? profilePictureUrl : null;

  return (
    <Avatar
      src={avatarSrc}
      size={44}
      radius={999}
      color="teal"
      className="shrink-0 border border-white/10 bg-black/20 text-sm font-semibold text-[var(--color-primary)]"
      imageProps={{
        onError: () => setHasImageError(true),
      }}
    >
      {getUserInitials(username)}
    </Avatar>
  );
}

function SquadRow({
  username,
  profilePictureUrl,
  actionLabel,
  actionLoadingLabel,
  disabled,
  onAction,
  tone = "danger",
}: {
  username: string;
  profilePictureUrl: string | null;
  actionLabel: string;
  actionLoadingLabel: string;
  disabled: boolean;
  onAction: () => void;
  tone?: "danger" | "primary";
}) {
  const buttonClassName = tone === "danger"
    ? "border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
    : "border-white/10 bg-white/5 text-[var(--color-text)] hover:bg-white/10";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <UserListAvatar username={username} profilePictureUrl={profilePictureUrl} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-text)]">{username}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
      >
        {disabled ? actionLoadingLabel : actionLabel}
      </button>
    </div>
  );
}

function RequestRow({
  username,
  profilePictureUrl,
  meta,
  primaryActionLabel,
  secondaryActionLabel,
  primaryActionTone = "primary",
  primaryActionDisabled,
  secondaryActionDisabled,
  onPrimaryAction,
  onSecondaryAction,
}: {
  username: string;
  profilePictureUrl: string | null;
  meta: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  primaryActionTone?: "primary" | "danger";
  primaryActionDisabled: boolean;
  secondaryActionDisabled: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}) {
  const primaryActionClassName = primaryActionTone === "danger"
    ? "border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
    : "border-white/10 bg-white/5 text-[var(--color-text)] hover:bg-white/10";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <UserListAvatar username={username} profilePictureUrl={profilePictureUrl} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-text)]">{username}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{meta}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSecondaryAction}
          disabled={secondaryActionDisabled}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {secondaryActionLabel}
        </button>

        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={primaryActionDisabled}
          className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${primaryActionClassName}`}
        >
          {primaryActionLabel}
        </button>
      </div>
    </div>
  );
}

function toCreatedLabel(createdAt: string) {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return "Pending request";
  }

  return `Requested ${parsed.toLocaleDateString()}`;
}

export default function ProfileSquadSection({
  accessToken,
  currentUserPublicId,
  currentUsername,
}: ProfileSquadSectionProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [learners, setLearners] = useState<LearnerPublic[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [squadSearchQuery, setSquadSearchQuery] = useState("");
  const [learnerSearchQuery, setLearnerSearchQuery] = useState("");
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [learnersError, setLearnersError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);
  const [isLearnersLoading, setIsLearnersLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [friendPendingRemoval, setFriendPendingRemoval] = useState<Friend | null>(null);
  const [unfriendingFriendIds, setUnfriendingFriendIds] = useState<string[]>([]);
  const [addingFriendIds, setAddingFriendIds] = useState<string[]>([]);
  const [requestActionIds, setRequestActionIds] = useState<number[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadFriends = async () => {
      setIsFriendsLoading(true);
      setFriendsError(null);

      try {
        const nextFriends = await fetchFriends(accessToken);

        if (isCancelled) {
          return;
        }

        setFriends(nextFriends);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = getFriendsLoadErrorMessage(error);
        setFriendsError(message);
      } finally {
        if (!isCancelled) {
          setIsFriendsLoading(false);
        }
      }
    };

    void loadFriends();

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    let isCancelled = false;

    const loadLearners = async () => {
      setIsLearnersLoading(true);
      setLearnersError(null);

      try {
        const nextLearners = await fetchLearners(accessToken);

        if (isCancelled) {
          return;
        }

        setLearners(nextLearners);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = getLearnersLoadErrorMessage(error);
        setLearnersError(message);
      } finally {
        if (!isCancelled) {
          setIsLearnersLoading(false);
        }
      }
    };

    void loadLearners();

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    let isCancelled = false;

    const loadRequests = async (showLoading: boolean) => {
      if (showLoading) {
        setIsRequestsLoading(true);
      }

      setRequestsError(null);

      try {
        const [incoming, outgoing] = await Promise.all([
          fetchFriendRequests(accessToken, "INCOMING"),
          fetchFriendRequests(accessToken, "OUTGOING"),
        ]);

        if (isCancelled) {
          return;
        }

        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = getFriendRequestsLoadErrorMessage(error);
        setRequestsError(message);
      } finally {
        if (!isCancelled && showLoading) {
          setIsRequestsLoading(false);
        }
      }
    };

    void loadRequests(true);

    const intervalId = window.setInterval(() => {
      void loadRequests(false);
    }, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [accessToken]);

  const filteredFriends = useMemo(
    () => searchFriends(friends, squadSearchQuery),
    [friends, squadSearchQuery],
  );

  const pendingIncomingRequests = useMemo(
    () => incomingRequests.filter((request) => request.status === "PENDING"),
    [incomingRequests],
  );

  const pendingOutgoingRequests = useMemo(
    () => outgoingRequests.filter((request) => request.status === "PENDING"),
    [outgoingRequests],
  );

  const addableLearners = useMemo(() => {
    const filteredLearners = searchLearners(learners, learnerSearchQuery);
    const currentFriendIds = new Set(friends.map((friend) => friend.publicId));
    const pendingReceiverIds = new Set(
      pendingOutgoingRequests.map((request) => request.otherUserPublicId),
    );
    const incomingSenderIds = new Set(
      pendingIncomingRequests.map((request) => request.otherUserPublicId),
    );

    return filteredLearners.filter((learner) => {
      if (learner.publicId === currentUserPublicId) {
        return false;
      }

      if (currentFriendIds.has(learner.publicId)) {
        return false;
      }

      if (pendingReceiverIds.has(learner.publicId)) {
        return false;
      }

      if (incomingSenderIds.has(learner.publicId)) {
        return false;
      }

      return true;
    });
  }, [
    currentUserPublicId,
    friends,
    learnerSearchQuery,
    learners,
    pendingIncomingRequests,
    pendingOutgoingRequests,
  ]);

  const retryFriendsLoad = async () => {
    setIsFriendsLoading(true);
    setFriendsError(null);

    try {
      setFriends(await fetchFriends(accessToken));
    } catch (error) {
      const message = getFriendsLoadErrorMessage(error);
      setFriendsError(message);
      showError(message);
    } finally {
      setIsFriendsLoading(false);
    }
  };

  const retryLearnersLoad = async () => {
    setIsLearnersLoading(true);
    setLearnersError(null);

    try {
      setLearners(await fetchLearners(accessToken));
    } catch (error) {
      const message = getLearnersLoadErrorMessage(error);
      setLearnersError(message);
      showError(message);
    } finally {
      setIsLearnersLoading(false);
    }
  };

  const retryRequestsLoad = async () => {
    setIsRequestsLoading(true);
    setRequestsError(null);

    try {
      const [incoming, outgoing] = await Promise.all([
        fetchFriendRequests(accessToken, "INCOMING"),
        fetchFriendRequests(accessToken, "OUTGOING"),
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      const message = getFriendRequestsLoadErrorMessage(error);
      setRequestsError(message);
      showError(message);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  const handleConfirmUnfriend = async () => {
    if (!friendPendingRemoval) {
      return;
    }

    const friendToRemove = friendPendingRemoval;

    if (unfriendingFriendIds.includes(friendToRemove.publicId)) {
      return;
    }

    setUnfriendingFriendIds((current) => [...current, friendToRemove.publicId]);

    try {
      await unfriend(accessToken, friendToRemove.publicId);
      setFriends((current) => current.filter((friend) => friend.publicId !== friendToRemove.publicId));
      setFriendPendingRemoval(null);
      showSuccess(`${friendToRemove.username} was removed from your squad.`);
    } catch (error) {
      const message = getUnfriendErrorMessage(error);
      showError(message);
    } finally {
      setUnfriendingFriendIds((current) =>
        current.filter((friendId) => friendId !== friendToRemove.publicId),
      );
    }
  };

  const handleAddFriend = async (learner: LearnerPublic) => {
    if (addingFriendIds.includes(learner.publicId)) {
      return;
    }

    setAddingFriendIds((current) => [...current, learner.publicId]);

    try {
      const request = await sendFriendRequest(accessToken, {
        receiverPublicId: learner.publicId,
      });
      setOutgoingRequests((current) => [...current, request]);
      showSuccess(`Friend request sent to ${learner.username}.`);
    } catch (error) {
      const message = getAddFriendErrorMessage(error);
      showError(message);
    } finally {
      setAddingFriendIds((current) => current.filter((friendId) => friendId !== learner.publicId));
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (requestActionIds.includes(request.requestId)) {
      return;
    }

    setRequestActionIds((current) => [...current, request.requestId]);

    try {
      await updateFriendRequestStatus(accessToken, request.requestId, {
        status: "APPROVED",
      });

      setIncomingRequests((current) => current.filter((item) => item.requestId !== request.requestId));
      setFriends((current) => {
        if (current.some((friend) => friend.publicId === request.otherUserPublicId)) {
          return current;
        }

        return [
          ...current,
          {
            publicId: request.otherUserPublicId,
            username: request.otherUsername,
            profilePictureUrl: request.otherUserProfilePictureUrl,
          },
        ];
      });
      showSuccess(`${request.otherUsername} is now in your squad.`);
    } catch (error) {
      const message = getRespondToFriendRequestErrorMessage(error);
      showError(message);
    } finally {
      setRequestActionIds((current) => current.filter((id) => id !== request.requestId));
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    if (requestActionIds.includes(request.requestId)) {
      return;
    }

    setRequestActionIds((current) => [...current, request.requestId]);

    try {
      await updateFriendRequestStatus(accessToken, request.requestId, {
        status: "REJECTED",
      });
      setIncomingRequests((current) => current.filter((item) => item.requestId !== request.requestId));
      showSuccess(`Friend request from ${request.otherUsername} was declined.`);
    } catch (error) {
      const message = getRespondToFriendRequestErrorMessage(error);
      showError(message);
    } finally {
      setRequestActionIds((current) => current.filter((id) => id !== request.requestId));
    }
  };

  const handleCancelRequest = async (request: FriendRequest) => {
    if (requestActionIds.includes(request.requestId)) {
      return;
    }

    setRequestActionIds((current) => [...current, request.requestId]);

    try {
      await cancelFriendRequest(accessToken, request.requestId);
      setOutgoingRequests((current) => current.filter((item) => item.requestId !== request.requestId));
      showSuccess(`Friend request to ${request.otherUsername} was cancelled.`);
    } catch (error) {
      const message = getCancelFriendRequestErrorMessage(error);
      showError(message);
    } finally {
      setRequestActionIds((current) => current.filter((id) => id !== request.requestId));
    }
  };

  const hasSquadSearch = squadSearchQuery.trim().length > 0;
  const hasLearnerSearch = learnerSearchQuery.trim().length > 0;

  return (
    <>
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="My Squad"
          description="See your current friends, search within your squad, and remove connections when needed."
        >
          <div className="space-y-4">
            <TextInput
              placeholder="Search your squad"
              value={squadSearchQuery}
              onChange={(event) => setSquadSearchQuery(event.currentTarget.value)}
              disabled={isFriendsLoading}
              radius="xl"
              size="md"
            />

            {friendsError ? (
              <Alert color="red" radius="lg" variant="light" title="Squad load failed">
                <div className="space-y-3">
                  <p>{friendsError}</p>
                  <CommonButton onClick={retryFriendsLoad} size="sm">
                    Retry
                  </CommonButton>
                </div>
              </Alert>
            ) : null}

            {isFriendsLoading ? <SquadListSkeleton /> : null}

            {!isFriendsLoading && !friendsError && friends.length === 0 ? (
              <EmptyState
                title="Your squad is empty"
                message="Add a few friends below and they will show up here for quick access."
              />
            ) : null}

            {!isFriendsLoading && !friendsError && friends.length > 0 && filteredFriends.length === 0 ? (
              <EmptyState
                title="No squad matches"
                message={hasSquadSearch
                  ? "No current friends match that username."
                  : "Your squad is empty right now."}
              />
            ) : null}

            {!isFriendsLoading && !friendsError && filteredFriends.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  {filteredFriends.length} {filteredFriends.length === 1 ? "friend" : "friends"}
                </p>

                {filteredFriends.map((friend) => (
                  <SquadRow
                    key={friend.publicId}
                    username={friend.username}
                    profilePictureUrl={friend.profilePictureUrl}
                    actionLabel="Unfriend"
                    actionLoadingLabel="Removing..."
                    disabled={unfriendingFriendIds.includes(friend.publicId)}
                    onAction={() => setFriendPendingRemoval(friend)}
                    tone="danger"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Find Friends"
          description={`Search AlphaLearn learners and send friend requests to grow ${currentUsername}'s squad.`}
        >
          <div className="space-y-4">
            <TextInput
              placeholder="Search learners by username"
              value={learnerSearchQuery}
              onChange={(event) => setLearnerSearchQuery(event.currentTarget.value)}
              disabled={isLearnersLoading}
              radius="xl"
              size="md"
            />

            {learnersError ? (
              <Alert color="red" radius="lg" variant="light" title="Learners load failed">
                <div className="space-y-3">
                  <p>{learnersError}</p>
                  <CommonButton onClick={retryLearnersLoad} size="sm">
                    Retry
                  </CommonButton>
                </div>
              </Alert>
            ) : null}

            {isLearnersLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6">
                <Loader size={20} />
                <span className="ml-3 text-sm text-[var(--color-text-secondary)]">
                  Loading learners...
                </span>
              </div>
            ) : null}

            {!isLearnersLoading && !learnersError && addableLearners.length === 0 ? (
              <EmptyState
                title={hasLearnerSearch ? "No learners found" : "No learners available"}
                message={hasLearnerSearch
                  ? "Try a different username. Matching learners will appear here."
                  : "There are no eligible learners to add right now."}
              />
            ) : null}

            {!isLearnersLoading && !learnersError && addableLearners.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  {hasLearnerSearch ? "Matching learners" : "Suggested learners"}
                </p>

                {addableLearners.map((learner) => (
                  <SquadRow
                    key={learner.publicId}
                    username={learner.username}
                    profilePictureUrl={learner.profilePictureUrl}
                    actionLabel="Add friend"
                    actionLoadingLabel="Sending..."
                    disabled={addingFriendIds.includes(learner.publicId)}
                    onAction={() => {
                      void handleAddFriend(learner);
                    }}
                    tone="primary"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Pending Requests"
        description="Track requests you have received and the invites you have already sent."
        className="mt-6"
      >
        {requestsError ? (
          <Alert color="red" radius="lg" variant="light" title="Friend requests failed to load" className="mb-4">
            <div className="space-y-3">
              <p>{requestsError}</p>
              <CommonButton onClick={retryRequestsLoad} size="sm">
                Retry
              </CommonButton>
            </div>
          </Alert>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Incoming
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Approve or decline requests sent to you.
              </p>
            </div>

            {isRequestsLoading ? <PendingRequestSkeleton /> : null}

            {!isRequestsLoading && !requestsError && pendingIncomingRequests.length === 0 ? (
              <EmptyState
                title="No incoming requests"
                message="When another learner adds you, their request will appear here."
              />
            ) : null}

            {!isRequestsLoading && !requestsError && pendingIncomingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingIncomingRequests.map((request) => (
                  <RequestRow
                    key={request.requestId}
                    username={request.otherUsername}
                    profilePictureUrl={request.otherUserProfilePictureUrl}
                    meta={toCreatedLabel(request.createdAt)}
                    primaryActionLabel="Accept"
                    secondaryActionLabel="Decline"
                    primaryActionDisabled={requestActionIds.includes(request.requestId)}
                    secondaryActionDisabled={requestActionIds.includes(request.requestId)}
                    onPrimaryAction={() => {
                      void handleAcceptRequest(request);
                    }}
                    onSecondaryAction={() => {
                      void handleRejectRequest(request);
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Sent
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Pending requests you have already sent to other learners.
              </p>
            </div>

            {isRequestsLoading ? <PendingRequestSkeleton /> : null}

            {!isRequestsLoading && !requestsError && pendingOutgoingRequests.length === 0 ? (
              <EmptyState
                title="No sent requests"
                message="Friend requests you send will stay here until they are accepted or cancelled."
              />
            ) : null}

            {!isRequestsLoading && !requestsError && pendingOutgoingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingOutgoingRequests.map((request) => (
                  <RequestRow
                    key={request.requestId}
                    username={request.otherUsername}
                    profilePictureUrl={request.otherUserProfilePictureUrl}
                    meta={toCreatedLabel(request.createdAt)}
                    primaryActionLabel="Cancel request"
                    secondaryActionLabel="Pending"
                    primaryActionTone="danger"
                    primaryActionDisabled={requestActionIds.includes(request.requestId)}
                    secondaryActionDisabled
                    onPrimaryAction={() => {
                      void handleCancelRequest(request);
                    }}
                    onSecondaryAction={() => {}}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <ConfirmModal
        opened={friendPendingRemoval !== null}
        onClose={() => setFriendPendingRemoval(null)}
        onConfirm={() => {
          void handleConfirmUnfriend();
        }}
        title="Remove friend?"
        message={friendPendingRemoval
          ? `Remove ${friendPendingRemoval.username} from your squad?`
          : "Remove this learner from your squad?"}
        confirmText="Unfriend"
        confirmColor="red"
        loading={friendPendingRemoval !== null && unfriendingFriendIds.includes(friendPendingRemoval.publicId)}
        icon="person_remove"
      />
    </>
  );
}
