"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert, Avatar, Container, Modal, Skeleton, Text } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  fetchLearnerProfile,
  getLearnerProfileLoadErrorMessage,
  type LearnerProfile,
} from "@/lib/utils/friends";
import { formatDateTime } from "@/lib/utils/formatDate";
import {
  fetchFriendWeeklyQuestRecords,
  getDefaultWeeklyQuestRecordsPageSize,
  getWeeklyQuestRecordsErrorMessage,
  isWeeklyQuestRecordsForbidden,
  type FriendWeeklyQuestRecord,
} from "@/lib/utils/weeklyQuestRecords";
import { fetchWeeklyQuestFriendsFeed } from "@/lib/utils/weeklyQuestFriendsFeed";
import { getQuestChallengeMediaKind } from "@/lib/utils/weeklyQuestChallenge";

interface FriendProfilePageClientProps {
  friendPublicId: string;
}

interface ExpandedMedia {
  url: string;
  contentType: string;
  learnerUsername: string;
}

const FEED_TAG_LOOKUP_PAGE_SIZE = 50;
const FEED_TAG_LOOKUP_MAX_PAGES = 10;

function getProfileInitials(profile: Pick<LearnerProfile, "username"> | null) {
  const source = profile?.username || "AL";
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AL";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getDisplayBio(bio: string | null) {
  return bio && bio.trim().length > 0 ? bio : "No bio added yet.";
}

function mergeTaggedFriends(
  items: FriendWeeklyQuestRecord[],
  taggedFriendsBySubmissionId: Map<string, FriendWeeklyQuestRecord["taggedFriends"]>,
) {
  return items.map((item) => ({
    ...item,
    taggedFriends: taggedFriendsBySubmissionId.get(item.submissionPublicId) ?? item.taggedFriends,
  }));
}

async function fetchTaggedFriendsForRecords(
  accessToken: string,
  friendPublicId: string,
  items: FriendWeeklyQuestRecord[],
) {
  const remainingSubmissionIds = new Set(items.map((item) => item.submissionPublicId));
  const taggedFriendsBySubmissionId = new Map<string, FriendWeeklyQuestRecord["taggedFriends"]>();
  let page = 0;
  let hasNext = true;

  while (
    hasNext
    && remainingSubmissionIds.size > 0
    && page < FEED_TAG_LOOKUP_MAX_PAGES
  ) {
    const response = await fetchWeeklyQuestFriendsFeed(accessToken, {
      page,
      size: FEED_TAG_LOOKUP_PAGE_SIZE,
    });

    response.items.forEach((item) => {
      if (item.learnerPublicId !== friendPublicId) {
        return;
      }

      if (!remainingSubmissionIds.has(item.submissionPublicId)) {
        return;
      }

      taggedFriendsBySubmissionId.set(item.submissionPublicId, item.taggedFriends ?? []);
      remainingSubmissionIds.delete(item.submissionPublicId);
    });

    hasNext = response.hasNext;
    page = response.page + 1;
  }

  return taggedFriendsBySubmissionId;
}

function FriendProfileLoadingSkeleton() {
  return (
    <Container size="lg" className="py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex flex-col items-center md:items-start">
            <Skeleton height={150} circle />
            <Skeleton height={42} width={132} radius="xl" className="mt-5" />
          </div>

          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <Skeleton height={38} width={220} radius="xl" />
                <Skeleton height={16} width={180} radius="xl" />
              </div>
              <Skeleton height={42} width={150} radius="xl" />
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton height={18} width={180} radius="xl" />
              <Skeleton height={18} width="72%" radius="xl" />
              <Skeleton height={18} width="54%" radius="xl" />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-4 border-t border-[#19f0c2]/20 pt-6 first:border-t-0 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <Skeleton height={16} width={160} radius="sm" />
                <Skeleton height={12} width={140} radius="sm" />
              </div>
              <Skeleton height={320} width="100%" radius="md" />
              <Skeleton height={12} width="100%" radius="sm" />
              <Skeleton height={12} width="72%" radius="sm" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

function SubmissionListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-4 border-t border-[#19f0c2]/20 pt-6 first:border-t-0 first:pt-0">
          <div className="flex items-start justify-between gap-3">
            <Skeleton height={16} width={160} radius="sm" />
            <Skeleton height={12} width={140} radius="sm" />
          </div>
          <Skeleton height={320} width="100%" radius="md" />
          <Skeleton height={12} width="100%" radius="sm" />
          <Skeleton height={12} width="68%" radius="sm" />
        </div>
      ))}
    </div>
  );
}

function SubmissionCard({
  item,
  onExpand,
}: {
  item: FriendWeeklyQuestRecord;
  onExpand: (item: FriendWeeklyQuestRecord) => void;
}) {
  const mediaKind = getQuestChallengeMediaKind(item.mediaContentType);
  const tagNames = item.taggedFriends.map((friend) => friend.learnerUsername);

  return (
    <div className="border-t border-[#19f0c2]/20 pt-6 first:border-t-0 first:pt-0 transition-all duration-300 hover:border-t-[#19f0c2]/50">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[#19f0c2]/70">
            {item.conceptTitle}
          </p>

          <p className="whitespace-nowrap text-xs text-[var(--color-text-muted)]">
            {formatDateTime(item.submittedAt)}
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-[#19f0c2]/20 bg-black/5 transition-all duration-300 hover:border-[#19f0c2]/50 hover:shadow-[0_8px_24px_rgba(25,240,194,0.08)]">
          {mediaKind === "image" ? (
            <button
              type="button"
              onClick={() => onExpand(item)}
              className="block w-full text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.mediaPublicUrl}
                alt={item.caption || item.conceptTitle}
                className="max-h-96 w-full object-contain transition duration-300 group-hover:scale-105"
              />
            </button>
          ) : mediaKind === "video" ? (
            <video
              controls
              playsInline
              preload="metadata"
              src={item.mediaPublicUrl}
              className="max-h-96 w-full bg-black object-contain"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-[var(--color-text-muted)]">
              Preview unavailable
            </div>
          )}

          {mediaKind !== "unknown" ? (
            <button
              type="button"
              onClick={() => onExpand(item)}
              className="absolute right-3 top-3 rounded-full border border-[#19f0c2]/40 bg-[#19f0c2]/10 px-3 py-1.5 text-xs font-semibold text-[#19f0c2] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              Expand
            </button>
          ) : null}
        </div>

        <div className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {item.caption ? (
            <>
              <span>{item.caption}</span>
              {tagNames.length > 0 ? (
                <span className="ml-1">
                  {tagNames.map((name, index) => (
                    <span key={`${item.submissionPublicId}-${name}`}>
                      {index > 0 && " "}
                      <span className="font-medium text-[#19f0c2]">#{name}</span>
                    </span>
                  ))}
                </span>
              ) : null}
            </>
          ) : tagNames.length > 0 ? (
            <span>
              {tagNames.map((name, index) => (
                <span key={`${item.submissionPublicId}-${name}`}>
                  {index > 0 && " "}
                  <span className="font-medium text-[#19f0c2]">#{name}</span>
                </span>
              ))}
            </span>
          ) : (
            <span className="italic text-[var(--color-text-muted)]">
              No caption provided.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FriendProfilePageClient({
  friendPublicId,
}: FriendProfilePageClientProps) {
  const { isLoading, session } = useAuth();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<FriendWeeklyQuestRecord[]>([]);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [submissionsNotice, setSubmissionsNotice] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reloadSeed, setReloadSeed] = useState(0);
  const [expandedMedia, setExpandedMedia] = useState<ExpandedMedia | null>(null);

  const accessToken = session?.access_token ?? null;
  const pageSize = getDefaultWeeklyQuestRecordsPageSize();

  const enrichSubmissionTags = useCallback(
    async (items: FriendWeeklyQuestRecord[]) => {
      if (!accessToken || items.length === 0) {
        return;
      }

      try {
        const taggedFriendsBySubmissionId = await fetchTaggedFriendsForRecords(
          accessToken,
          friendPublicId,
          items,
        );

        if (taggedFriendsBySubmissionId.size === 0) {
          return;
        }

        setSubmissions((current) => mergeTaggedFriends(current, taggedFriendsBySubmissionId));
      } catch {
        // Tag enrichment is best-effort because /records does not include tag data.
      }
    },
    [accessToken, friendPublicId],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!accessToken) {
      setProfile(null);
      setProfileError("Your session could not be loaded. Please refresh and try again.");
      setSubmissions([]);
      setSubmissionsError(null);
      setSubmissionsNotice(null);
      setHasNext(false);
      setIsInitialLoading(false);
      return;
    }

    let isCancelled = false;

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      setProfileError(null);
      setSubmissionsError(null);
      setSubmissionsNotice(null);

      const [profileResult, submissionsResult] = await Promise.allSettled([
        fetchLearnerProfile(accessToken, friendPublicId),
        fetchFriendWeeklyQuestRecords(accessToken, {
          friendPublicId,
          page: 0,
          size: pageSize,
        }),
      ]);

      if (isCancelled) {
        return;
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        setProfile(null);
        setProfileError(getLearnerProfileLoadErrorMessage(profileResult.reason));
      }

      if (submissionsResult.status === "fulfilled") {
        setSubmissions(submissionsResult.value.items);
        setPage(submissionsResult.value.page);
        setHasNext(submissionsResult.value.hasNext);
        void enrichSubmissionTags(submissionsResult.value.items);
      } else {
        setSubmissions([]);
        setPage(0);
        setHasNext(false);

        const viewerIsFriend =
          profileResult.status === "fulfilled" ? profileResult.value.viewerIsFriend : undefined;

        if (
          isWeeklyQuestRecordsForbidden(submissionsResult.reason)
          && viewerIsFriend === false
        ) {
          setSubmissionsNotice("Quest submissions are only visible to friends.");
        } else {
          setSubmissionsError(
            getWeeklyQuestRecordsErrorMessage(submissionsResult.reason, {
              viewerIsFriend,
            }),
          );
        }
      }

      setIsInitialLoading(false);
    };

    void loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, enrichSubmissionTags, friendPublicId, isLoading, pageSize, reloadSeed]);

  const handleRetry = () => {
    setReloadSeed((current) => current + 1);
  };

  const handleLoadMore = async () => {
    if (!accessToken || isLoadingMore || !hasNext) {
      return;
    }

    setIsLoadingMore(true);
    setSubmissionsError(null);

    try {
      const response = await fetchFriendWeeklyQuestRecords(accessToken, {
        friendPublicId,
        page: page + 1,
        size: pageSize,
      });

      setSubmissions((current) => [...current, ...response.items]);
      setPage(response.page);
      setHasNext(response.hasNext);
      void enrichSubmissionTags(response.items);
    } catch (error) {
      setSubmissionsError(
        getWeeklyQuestRecordsErrorMessage(error, {
          viewerIsFriend: profile?.viewerIsFriend,
        }),
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading || isInitialLoading) {
    return <FriendProfileLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <Container size="lg" className="py-8 lg:py-10">
        <div className="mx-auto max-w-4xl border-b border-white/10 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Friend Profile
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Profile unavailable
          </h1>
          <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            {profileError || "We could not load this profile right now."}
          </Text>

          <div className="mt-6 flex flex-wrap gap-3">
            <CommonButton onClick={handleRetry}>
              Retry
            </CommonButton>

            <Link
              href="/profile/squad"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10"
            >
              Back to Squad
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        {profileError ? (
          <Alert color="red" radius="lg" variant="light" title="Profile load failed" className="mb-6">
            {profileError}
          </Alert>
        ) : null}

        <section className="border-b border-white/10 pb-10">
          <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
            <div className="flex flex-col items-center md:items-start">
              <Avatar
                src={profile.profilePictureUrl}
                size={150}
                radius={999}
                color="teal"
                className="border-2 border-white/10 bg-black/20 text-4xl font-semibold text-[var(--color-primary)]"
              >
                {getProfileInitials(profile)}
              </Avatar>

              <Link
                href="/profile/squad"
                className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10"
              >
                Back to Squad
              </Link>
            </div>

            <div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h1 className="truncate text-[clamp(2rem,4vw,2.7rem)] font-semibold tracking-tight text-[var(--color-text)]">
                    {profile.username}
                  </h1>
                  <p className="mt-2 break-words text-sm text-[var(--color-text-secondary)]">
                    Friend profile
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text-secondary)]">
                    {profile.viewerIsFriend ? "In your squad" : "Read only"}
                  </span>
                </div>
              </div>

              <div className="mt-6 max-w-2xl">
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {getDisplayBio(profile.bio)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Quest Submissions
          </p>

          <div className="mt-6">
            {submissionsError ? (
              <Alert color="red" radius="lg" variant="light" title="Could not load submissions">
                <div className="space-y-3">
                  <p>{submissionsError}</p>
                  <CommonButton
                    onClick={submissions.length > 0 ? handleLoadMore : handleRetry}
                    loading={submissions.length > 0 && isLoadingMore}
                    size="sm"
                  >
                    {submissions.length > 0 ? "Try load more again" : "Retry"}
                  </CommonButton>
                </div>
              </Alert>
            ) : null}

            {!submissionsError && submissionsNotice ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Quest submissions are private
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {submissionsNotice}
                </p>
              </div>
            ) : null}

            {!submissionsError && !submissionsNotice && submissions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  No quest submissions yet.
                </p>
              </div>
            ) : null}

            {submissions.length > 0 ? (
              <div className="space-y-6">
                {submissions.map((item) => (
                  <SubmissionCard
                    key={item.submissionPublicId}
                    item={item}
                    onExpand={(selectedItem) =>
                      setExpandedMedia({
                        url: selectedItem.mediaPublicUrl,
                        contentType: selectedItem.mediaContentType,
                        learnerUsername: selectedItem.learnerUsername,
                      })}
                  />
                ))}

                {isLoadingMore ? <SubmissionListSkeleton /> : null}

                {hasNext ? (
                  <div className="flex justify-center pt-2">
                    <CommonButton onClick={handleLoadMore} loading={isLoadingMore}>
                      Load more
                    </CommonButton>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <Modal
        opened={expandedMedia !== null}
        onClose={() => setExpandedMedia(null)}
        centered
        size="xl"
        radius="lg"
        title={
          expandedMedia ? (
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              @{expandedMedia.learnerUsername}
            </span>
          ) : undefined
        }
      >
        {expandedMedia ? (
          getQuestChallengeMediaKind(expandedMedia.contentType) === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={expandedMedia.url}
              alt="Submission media"
              className="max-h-[70vh] w-full rounded-lg bg-black object-contain"
            />
          ) : (
            <video
              controls
              src={expandedMedia.url}
              className="max-h-[70vh] w-full rounded-lg bg-black"
            />
          )
        ) : null}
      </Modal>
    </Container>
  );
}
