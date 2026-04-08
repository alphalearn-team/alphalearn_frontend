"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Avatar, Card, Modal, Skeleton, Stack, Text } from "@mantine/core";
import CardSkeleton from "@/components/CardSkeleton";
import type { LearnerWeeklyQuestFriendFeedItem } from "@/interfaces/interfaces";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { formatDateTime } from "@/lib/utils/formatDate";
import { fetchFriendsList } from "@/lib/utils/friends";
import {
  fetchWeeklyQuestFriendsFeed,
  getDefaultWeeklyQuestFeedPageSize,
  toWeeklyQuestFriendsFeedError,
} from "@/lib/utils/weeklyQuestFriendsFeed";
import {
  fetchWeeklyQuestTaggedHistory,
  toWeeklyQuestTaggedHistoryError,
} from "@/lib/utils/weeklyQuestTaggedHistory";
import { getQuestChallengeMediaKind } from "@/lib/utils/weeklyQuestChallenge";

type FeedMediaFilter = "all" | "image" | "video";
type FeedSortOrder = "newest" | "oldest";
type FeedTab = "feed" | "tagged";

interface ExpandedMedia {
  url: string;
  contentType: string;
  learnerUsername: string;
}

function getInitials(username: string): string {
  return username
    .split(/[._-]/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function WeeklyQuestFriendsFeedSection() {
  const { session } = useAuth();
  const [items, setItems] = useState<LearnerWeeklyQuestFriendFeedItem[]>([]);
  const [friendProfilePictures, setFriendProfilePictures] = useState<Record<string, string | null>>({});
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>("feed");
  const [mediaFilter, setMediaFilter] = useState<FeedMediaFilter>("all");
  const [sortOrder, setSortOrder] = useState<FeedSortOrder>("newest");
  const [selectedConceptPublicId, setSelectedConceptPublicId] = useState<string>("all");
  const [expandedMedia, setExpandedMedia] = useState<ExpandedMedia | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const setVideoRef = useCallback((submissionPublicId: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current[submissionPublicId] = element;
      return;
    }

    delete videoRefs.current[submissionPublicId];
  }, []);

  const accessToken = session?.access_token ?? null;
  const pageSize = useMemo(() => getDefaultWeeklyQuestFeedPageSize(), []);
  const conceptOptions = useMemo(() => {
    const conceptMap = new Map<string, string>();

    items.forEach((item) => {
      if (!conceptMap.has(item.conceptPublicId)) {
        conceptMap.set(item.conceptPublicId, item.conceptTitle);
      }
    });

    return Array.from(conceptMap.entries()).map(([publicId, title]) => ({ publicId, title }));
  }, [items]);
  const filteredItems = useMemo(() => {
    if (mediaFilter === "all") {
      return items;
    }

    return items.filter((item) => getQuestChallengeMediaKind(item.mediaContentType) === mediaFilter);
  }, [items, mediaFilter]);
  const displayItems = useMemo(() => {
    if (sortOrder === "newest") {
      return filteredItems;
    }

    return [...filteredItems].reverse();
  }, [filteredItems, sortOrder]);

  const loadPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      if (!accessToken) {
        return;
      }

      if (mode === "replace") {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setErrorMessage(null);

      try {
        const requestParams = {
          page: targetPage,
          size: pageSize,
          conceptPublicIds:
            selectedConceptPublicId === "all" ? undefined : [selectedConceptPublicId],
        };

        const response =
          activeTab === "feed"
            ? await fetchWeeklyQuestFriendsFeed(accessToken, requestParams)
            : await fetchWeeklyQuestTaggedHistory(accessToken, requestParams);

        setItems((prev) => (mode === "append" ? [...prev, ...response.items] : response.items));
        setPage(response.page);
        setHasNext(response.hasNext);
      } catch (error) {
        setErrorMessage(
          activeTab === "feed"
            ? toWeeklyQuestFriendsFeedError(error)
            : toWeeklyQuestTaggedHistoryError(error),
        );
      } finally {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [accessToken, activeTab, pageSize, selectedConceptPublicId],
  );

  useEffect(() => {
    if (!accessToken) {
      setIsInitialLoading(false);
      return;
    }

    void loadPage(0, "replace");
  }, [accessToken, activeTab, loadPage]);

  useEffect(() => {
    if (!accessToken) {
      setFriendProfilePictures({});
      return;
    }

    let isCancelled = false;

    const loadFriendProfilePictures = async () => {
      try {
        const friends = await fetchFriendsList(accessToken);

        if (isCancelled) {
          return;
        }

        setFriendProfilePictures(
          Object.fromEntries(
            friends.map((friend) => [friend.publicId, friend.profilePictureUrl ?? null]),
          ),
        );
      } catch {
        if (!isCancelled) {
          setFriendProfilePictures({});
        }
      }
    };

    void loadFriendProfilePictures();

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoadingMore && !isInitialLoading) {
          void loadPage(page + 1, "append");
        }
      },
      { threshold: 0.1 },
    );

    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasNext, isLoadingMore, isInitialLoading, page, loadPage]);

  useEffect(() => {
    const videos = Object.values(videoRefs.current).filter(
      (video): video is HTMLVideoElement => video !== null,
    );

    if (videos.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            void video.play().catch(() => {
              // Ignore autoplay rejection from browser policies.
            });
            return;
          }

          video.pause();
        });
      },
      { threshold: [0.6] },
    );

    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      observer.observe(video);
    });

    return () => {
      videos.forEach((video) => {
        observer.unobserve(video);
        video.pause();
      });
    };
  }, [filteredItems, mediaFilter, sortOrder]);

  if (!accessToken || isInitialLoading) {
    return <CardSkeleton count={3} cols={1} showBookmark={false} lines={2} />;
  }

  return (
    <>
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
              alt="Post media"
              className="max-h-[70vh] w-full rounded-lg object-contain bg-black"
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

      <Stack gap="lg">
        <div className="flex items-center justify-center">
          <div
            role="tablist"
            aria-label="Friends feed tabs"
            className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
              className={`relative inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-xs font-semibold tracking-[0.16em] transition-all ${
                activeTab === "feed"
                  ? "bg-[#19f0c2] text-[#102019] shadow-[0_0_0_1px_rgba(25,240,194,0.35)]"
                  : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]"
              }`}
            >
              <span className="mr-2 text-sm leading-none">◉</span>
              Feed
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "tagged"}
              onClick={() => setActiveTab("tagged")}
              className={`relative inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-xs font-semibold tracking-[0.16em] transition-all ${
                activeTab === "tagged"
                  ? "bg-[#19f0c2] text-[#102019] shadow-[0_0_0_1px_rgba(25,240,194,0.35)]"
                  : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]"
              }`}
            >
              <span className="mr-2 text-sm leading-none">@</span>
              Tagged
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              Concept
            </label>
            <select
              value={selectedConceptPublicId}
              onChange={(event) => setSelectedConceptPublicId(event.currentTarget.value)}
              className="h-8 rounded-md border border-[#2b3c35] bg-[#101615] px-3 text-xs font-semibold text-[#d5dfda] outline-none transition focus:border-[#19f0c2]/50"
            >
              <option value="all" style={{ color: "#d5dfda", backgroundColor: "#101615" }}>
                All concepts
              </option>
              {conceptOptions.map((concept) => (
                <option
                  key={concept.publicId}
                  value={concept.publicId}
                  style={{ color: "#d5dfda", backgroundColor: "#101615" }}
                >
                  {concept.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap justify-end gap-1">
            {(["newest", "oldest"] as const).map((order) => (
              <button
                key={order}
                type="button"
                onClick={() => setSortOrder(order)}
                title={order === "newest" ? "Sort newest first" : "Sort oldest first"}
                aria-label={order === "newest" ? "Sort newest first" : "Sort oldest first"}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
                  sortOrder === order
                    ? "border-[#19f0c2]/60 bg-[#19f0c2]/15 text-[#19f0c2]"
                    : "border-white/15 bg-black/20 text-[var(--color-text-muted)] hover:border-[#19f0c2]/40 hover:text-[#19f0c2]"
                }`}
              >
                <span className="material-symbols-outlined text-base leading-none">
                  {order === "newest" ? "arrow_downward" : "arrow_upward"}
                </span>
              </button>
            ))}

            {(["all", "image", "video"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setMediaFilter(filter)}
                className={`inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                  mediaFilter === filter
                    ? "border-[#19f0c2] bg-[#19f0c2] text-[#102019]"
                    : "border-white/15 bg-black/20 text-[var(--color-text-muted)] hover:border-[#19f0c2]/40"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

      {errorMessage ? (
          <Alert color="red" radius="lg" title="Could not load feed" variant="light">
          {errorMessage}
        </Alert>
      ) : null}

      {!errorMessage && items.length === 0 ? (
        <Card radius="24px" padding="xl" className="border border-[#19f0c2]/20 bg-black/30 flex flex-col items-center justify-center min-h-80 text-center">
          <Stack gap="md" align="center">
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                {activeTab === "feed" ? "No friend submissions yet" : "No tagged submissions yet"}
              </h2>
            <Text size="sm" className="max-w-xl text-[var(--color-text-secondary)]">
                {activeTab === "feed"
                  ? "When your friends publish weekly quest challenges, they will appear here in a live feed."
                  : "When friends tag you in weekly quest challenges, those posts will appear here."}
            </Text>
            <Link
              href="/weekly-quest"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/14 px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20 mt-4"
            >
                Start posting
            </Link>
          </Stack>
        </Card>
      ) : null}

      {displayItems.length > 0 ? (
        <div className="space-y-6">
          {displayItems.map((item) => {
            const mediaKind = getQuestChallengeMediaKind(item.mediaContentType);
            const tagNames = item.taggedFriends?.map((friend) => friend.learnerUsername) ?? [];
            const initials = getInitials(item.learnerUsername);
            const profilePictureUrl = friendProfilePictures[item.learnerPublicId] ?? null;

            return (
              <div
                key={item.submissionPublicId}
                className="border-t border-[#19f0c2]/20 pt-6 first:border-t-0 first:pt-0 transition-all duration-300 hover:border-t-[#19f0c2]/50"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/friends/${item.learnerPublicId}`}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-xl transition-colors hover:text-[var(--color-text)]"
                    >
                      <Avatar
                        src={profilePictureUrl}
                        size={40}
                        radius={999}
                        color="teal"
                        className="flex-shrink-0 border border-[#19f0c2]/30 bg-[#19f0c2]/12 text-sm font-semibold text-[#19f0c2]"
                      >
                        {initials}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[var(--color-text)] transition-colors hover:text-[#19f0c2]">
                          @{item.learnerUsername}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#19f0c2]/70 mt-1">
                          {item.conceptTitle}
                        </p>
                      </div>
                    </Link>
                    <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {formatDateTime(item.submittedAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMedia({
                        url: item.mediaPublicUrl,
                        contentType: item.mediaContentType,
                        learnerUsername: item.learnerUsername,
                      })
                    }
                    className="group relative w-full overflow-hidden rounded-xl border border-[#19f0c2]/20 bg-black/5 text-left transition-all duration-300 hover:border-[#19f0c2]/50 hover:shadow-[0_8px_24px_rgba(25,240,194,0.08)]"
                  >
                    {mediaKind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.mediaPublicUrl}
                        alt="Post media"
                        className="w-full max-h-96 object-contain transition duration-300 group-hover:scale-105"
                      />
                    ) : mediaKind === "video" ? (
                      <video
                        ref={(element) => setVideoRef(item.submissionPublicId, element)}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        src={item.mediaPublicUrl}
                        className="w-full max-h-96 bg-black object-contain"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm text-[var(--color-text-muted)]">
                        Preview unavailable
                      </div>
                    )}
                    <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-[#19f0c2]/40 bg-[#19f0c2]/10 px-3 py-1.5 text-xs font-semibold text-[#19f0c2] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Expand
                    </span>
                  </button>

                  <div className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.caption ? (
                      <>
                        <span>{item.caption}</span>
                        {tagNames.length > 0 && (
                          <span className="ml-1">
                            {tagNames.map((name, idx) => (
                              <span key={`${item.submissionPublicId}-${name}`}>
                                {idx > 0 && " "}
                                <span className="text-[#19f0c2] font-medium">@{name}</span>
                              </span>
                            ))}
                          </span>
                        )}
                      </>
                    ) : tagNames.length > 0 ? (
                      <span>
                        {tagNames.map((name, idx) => (
                          <span key={`${item.submissionPublicId}-${name}`}>
                            {idx > 0 && " "}
                            <span className="text-[#19f0c2] font-medium">@{name}</span>
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
          })}
          {isLoadingMore && (
            <div className="space-y-4 py-6 border-t border-[#19f0c2]/20">
              <div className="flex items-start gap-3">
                <Skeleton height={40} width={40} radius="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} width="30%" radius="sm" />
                  <Skeleton height={12} width="20%" radius="sm" />
                </div>
              </div>
              <Skeleton height={320} width="100%" radius="md" />
            </div>
          )}
          <div ref={sentinelRef} className="h-4" />
        </div>
      ) : !errorMessage && items.length > 0 && (mediaFilter !== "all" || selectedConceptPublicId !== "all") ? (
        <Card radius="24px" padding="xl" className="border border-[#19f0c2]/20 bg-black/30 flex flex-col items-center justify-center min-h-60 text-center">
          <Stack gap="md" align="center">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              No matching posts found
            </h2>
            <Text size="sm" className="max-w-xl text-[var(--color-text-secondary)]">
              Try switching your concept or media filters to &quot;all&quot;.
            </Text>
          </Stack>
        </Card>
      ) : null}

      </Stack>
    </>
  );
}
