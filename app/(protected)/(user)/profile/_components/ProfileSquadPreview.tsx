"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Skeleton } from "@mantine/core";
import {
  fetchFriendRequests,
  fetchFriends,
  getFriendRequestsLoadErrorMessage,
  getFriendsLoadErrorMessage,
  type Friend,
  type FriendRequest,
} from "@/lib/utils/friends";
import { showError } from "@/lib/utils/popUpNotifications";

interface ProfileSquadPreviewProps {
  accessToken: string;
  onFriendsCountChange?: (count: number) => void;
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

function SquadPreviewSkeleton() {
  return (
    <section className="mt-10 rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.85)] md:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Skeleton height={12} width={96} radius="xl" />
          <Skeleton height={32} width={220} radius="xl" />
          <Skeleton height={18} width={320} radius="xl" />
        </div>

        <Skeleton height={42} width={140} radius="xl" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Skeleton height={92} radius="xl" />
        <Skeleton height={92} radius="xl" />
        <Skeleton height={92} radius="xl" />
      </div>

      <div className="mt-6 space-y-3">
        <Skeleton height={16} width={150} radius="xl" />
        <div className="flex flex-wrap gap-3">
          <Skeleton height={56} width={180} radius="xl" />
          <Skeleton height={56} width={180} radius="xl" />
          <Skeleton height={56} width={180} radius="xl" />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {hint}
      </p>
    </div>
  );
}

function SquadMemberChip({ friend }: { friend: Friend }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <Avatar
        src={friend.profilePictureUrl}
        size={40}
        radius={999}
        color="teal"
        className="border border-white/10 bg-black/20 text-sm font-semibold text-[var(--color-primary)]"
      >
        {getUserInitials(friend.username)}
      </Avatar>

      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
        {friend.username}
      </p>
    </div>
  );
}

export default function ProfileSquadPreview({
  accessToken,
  onFriendsCountChange,
}: ProfileSquadPreviewProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadSquadPreview = async () => {
      setIsLoading(true);
      setLoadError(null);

      const [friendsResult, incomingResult, outgoingResult] = await Promise.allSettled([
        fetchFriends(accessToken),
        fetchFriendRequests(accessToken, "INCOMING"),
        fetchFriendRequests(accessToken, "OUTGOING"),
      ]);

      if (isCancelled) {
        return;
      }

      if (friendsResult.status === "fulfilled") {
        setFriends(friendsResult.value);
      } else {
        setFriends([]);
      }

      if (incomingResult.status === "fulfilled") {
        setIncomingRequests(incomingResult.value);
      } else {
        setIncomingRequests([]);
      }

      if (outgoingResult.status === "fulfilled") {
        setOutgoingRequests(outgoingResult.value);
      } else {
        setOutgoingRequests([]);
      }

      const nextError =
        friendsResult.status === "rejected"
          ? getFriendsLoadErrorMessage(friendsResult.reason)
          : incomingResult.status === "rejected"
            ? getFriendRequestsLoadErrorMessage(incomingResult.reason)
            : outgoingResult.status === "rejected"
              ? getFriendRequestsLoadErrorMessage(outgoingResult.reason)
              : null;

      if (nextError) {
        setLoadError(nextError);
        showError(nextError);
      }

      setIsLoading(false);
    };

    void loadSquadPreview();

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  const previewFriends = useMemo(() => friends.slice(0, 4), [friends]);
  const pendingIncomingCount = incomingRequests.filter((request) => request.status === "PENDING").length;
  const pendingOutgoingCount = outgoingRequests.filter((request) => request.status === "PENDING").length;

  useEffect(() => {
    onFriendsCountChange?.(friends.length);
  }, [friends.length, onFriendsCountChange]);

  if (isLoading) {
    return <SquadPreviewSkeleton />;
  }

  return (
    <section className="mt-10 rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.85)] md:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Squad
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Keep your learning circle close
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Your full squad manager now lives on its own page. Use it to track requests, add
            new friends, and manage your current squad without crowding the profile page.
          </p>
        </div>

        <Link
          href="/profile/squad"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-surface)] shadow-[0_0_20px_var(--color-shadow)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Open Squad
        </Link>
      </div>

      {loadError ? (
        <Alert color="red" radius="lg" variant="light" title="Squad preview is incomplete" className="mt-6">
          {loadError}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Members"
          value={friends.length}
          hint={friends.length === 1 ? "One learner is in your squad." : "Learners currently in your squad."}
        />
        <StatCard
          label="Incoming"
          value={pendingIncomingCount}
          hint="Requests waiting for your response."
        />
        <StatCard
          label="Sent"
          value={pendingOutgoingCount}
          hint="Requests you have sent and are still pending."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Squad Preview
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {friends.length > 0
                ? "A quick look at the first few people in your squad."
                : "You have not added anyone to your squad yet."}
            </p>
          </div>

          <Link
            href="/profile/squad"
            className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/5"
          >
            Manage Squad
          </Link>
        </div>

        {previewFriends.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {previewFriends.map((friend) => (
              <SquadMemberChip key={friend.publicId} friend={friend} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-center">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Start building your squad
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Visit the dedicated squad page to find learners and send friend requests.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
