"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Card, Modal, Stack, Text } from "@mantine/core";
import type { LearnerWeeklyQuestFriendFeedItem } from "@/interfaces/interfaces";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { formatDateTime } from "@/lib/utils/formatDate";
import {
  fetchWeeklyQuestHistory,
  getDefaultWeeklyQuestHistoryPageSize,
  toWeeklyQuestHistoryError,
} from "@/lib/utils/weeklyQuestHistory";
import { getQuestChallengeMediaKind } from "@/lib/utils/weeklyQuestChallenge";
import CardSkeleton from "@/components/CardSkeleton";

type FeedMediaFilter = "all" | "image" | "video";

interface ExpandedMedia {
  url: string;
  contentType: string;
}

export default function MyPostsSection() {
  const { session } = useAuth();
  const [items, setItems] = useState<LearnerWeeklyQuestFriendFeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<FeedMediaFilter>("all");
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
  const pageSize = useMemo(() => getDefaultWeeklyQuestHistoryPageSize(), []);
  const filteredItems = useMemo(() => {
    if (mediaFilter === "all") {
      return items;
    }

    return items.filter((item) => getQuestChallengeMediaKind(item.mediaContentType) === mediaFilter);
  }, [items, mediaFilter]);

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
        const response = await fetchWeeklyQuestHistory(accessToken, {
          page: targetPage,
          size: pageSize,
        });

        setItems((prev) => (mode === "append" ? [...prev, ...response.items] : response.items));
        setPage(response.page);
        setHasNext(response.hasNext);
      } catch (error) {
        setErrorMessage(toWeeklyQuestHistoryError(error));
      } finally {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [accessToken, pageSize],
  );

  useEffect(() => {
    if (!accessToken) {
      setIsInitialLoading(false);
      return;
    }

    void loadPage(0, "replace");
  }, [accessToken, loadPage]);

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
  }, [filteredItems, mediaFilter]);

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
        <div className="flex flex-wrap justify-end gap-1">
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

        {errorMessage ? (
          <Alert color="red" radius="lg" title="Could not load posts" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        {!errorMessage && items.length === 0 ? (
          <Card radius="24px" padding="xl" className="border border-[#19f0c2]/20 bg-black/30 flex flex-col items-center justify-center min-h-60 text-center">
            <Stack gap="md" align="center">
              <div className="text-6xl">📝</div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                My posts
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                No submissions yet
              </h2>
              <Text size="sm" className="max-w-xl text-[var(--color-text-secondary)]">
                Your submitted quest challenges will appear here.
              </Text>
              <Link
                href="/weekly-quest"
                className="inline-flex min-h-11 w-fit items-center justify-center rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/14 px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20 mt-4"
              >
                Create submission
              </Link>
            </Stack>
          </Card>
        ) : null}

        {filteredItems.length > 0 ? (
          <div className="space-y-6">
            {filteredItems.map((item) => {
              const mediaKind = getQuestChallengeMediaKind(item.mediaContentType);
              const tagNames = item.taggedFriends?.map((friend) => friend.learnerUsername) ?? [];

              return (
                <div
                  key={item.submissionPublicId}
                  className="border-t border-[#19f0c2]/20 pt-6 first:border-t-0 first:pt-0 transition-all duration-300 hover:border-t-[#19f0c2]/50"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-base font-semibold text-[var(--color-text)]">
                          {item.conceptTitle}
                        </div>
                      </div>
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
                                  <span className="text-[#19f0c2] font-medium">#{name}</span>
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
                              <span className="text-[#19f0c2] font-medium">#{name}</span>
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
            {isLoadingMore && <CardSkeleton count={1} cols={1} showBookmark={false} lines={2} />}
            <div ref={sentinelRef} className="h-4" />
          </div>
        ) : !errorMessage && items.length > 0 && mediaFilter !== "all" ? (
          <Card radius="24px" padding="xl" className="border border-[#19f0c2]/20 bg-black/30 flex flex-col items-center justify-center min-h-60 text-center">
            <Stack gap="md" align="center">
              <div className="text-5xl">🔍</div>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                No {mediaFilter} posts found
              </h2>
              <Text size="sm" className="max-w-xl text-[var(--color-text-secondary)]">
                Try switching your media filter to &quot;all&quot;.
              </Text>
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </>
  );
}
