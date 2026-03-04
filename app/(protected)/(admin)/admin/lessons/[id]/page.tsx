import type { AdminLessonReviewDetail } from "@/interfaces/interfaces";
import "@mantine/tiptap/styles.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import AdminBreadcrumb from "@/components/admin/breadcrumb";
import LessonModerationBadge from "@/components/lessons/lessonModerationBadge";
import { TextDisplayer } from "@/components/texteditor/textDisplayer";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/formatDate";
import ReviewActions from "../reviewActions";

function getReviewSummary(lesson: AdminLessonReviewDetail) {
  const automatedReasonCount = lesson.automatedModerationReasons.filter(Boolean).length;

  if (lesson.lessonModerationStatus === "REJECTED" && lesson.adminRejectionReason) {
    return {
      title: "Manually rejected",
      description:
        "This lesson was rejected during admin review. Automated reasons and the admin rejection reason are shown separately below.",
      classes: "border-red-500/30 bg-red-500/10 text-red-100",
    };
  }

  if (lesson.lessonModerationStatus === "REJECTED") {
    return {
      title: "Automatically rejected",
      description:
        "This lesson was rejected by automated moderation. No manual rejection reason was recorded.",
      classes: "border-red-500/30 bg-red-500/10 text-red-100",
    };
  }

  if (lesson.lessonModerationStatus === "PENDING" && automatedReasonCount > 0) {
    return {
      title: "Flagged for manual review",
      description:
        "Automated moderation found issues that need an admin decision before this lesson can be published.",
      classes: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    };
  }

  if (lesson.lessonModerationStatus === "APPROVED") {
    return {
      title: "Approved",
      description: "This lesson has already passed moderation review.",
      classes: "border-green-500/30 bg-green-500/10 text-green-100",
    };
  }

  return {
    title:
      lesson.lessonModerationStatus === "PENDING"
        ? "Pending manual review"
        : "Moderation status recorded",
    description:
      lesson.lessonModerationStatus === "PENDING"
        ? "This lesson is waiting for an admin moderation decision."
        : "Review the moderation metadata below for the latest backend state.",
    classes: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100",
  };
}

async function getAdminLessonDetail(
  lessonPublicId: string,
): Promise<AdminLessonReviewDetail | null> {
  try {
    return await apiFetch<AdminLessonReviewDetail>(`/admin/lessons/${lessonPublicId}`);
  } catch {
    return null;
  }
}

export default async function AdminLessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getAdminLessonDetail(id);

  if (!lesson) {
    return notFound();
  }

  const automatedReasons = lesson.automatedModerationReasons.filter(Boolean);
  const reviewSummary = getReviewSummary(lesson);
  const submittedAt = lesson.submittedAt ?? lesson.createdAt ?? null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <AdminBreadcrumb />

        <Container size="lg" px={0}>
          <Stack gap="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Title order={1}>{lesson.title}</Title>
                  <LessonModerationBadge status={lesson.lessonModerationStatus} />
                </div>
                <Text size="sm" className="text-[var(--color-text-secondary)]">
                  Review lesson content, automated moderation reasons, and any recorded admin rejection reason.
                </Text>
              </div>
              <Link href="/admin/lessons">
                <Button variant="light">Back to Queue</Button>
              </Link>
            </div>

            <Card className="admin-card">
              <div className={`rounded-2xl border px-5 py-4 ${reviewSummary.classes}`}>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-base">policy</span>
                  {reviewSummary.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{reviewSummary.description}</p>
              </div>
            </Card>

            {lesson.lessonModerationStatus === "PENDING" && (
              <Card className="admin-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Text size="sm" className="font-semibold text-[var(--color-text)]">
                      Review decision
                    </Text>
                    <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                      Approve the lesson for publication or reject it with an admin reason.
                    </Text>
                  </div>
                  <ReviewActions
                    lessonPublicId={lesson.lessonPublicId}
                    lessonTitle={lesson.title}
                  />
                </div>
              </Card>
            )}

            <Card className="admin-card">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Lesson ID
                  </Text>
                  <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                    {lesson.lessonPublicId}
                  </Text>
                </div>
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Contributor
                  </Text>
                  <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                    {lesson.author
                      ? `${lesson.author.username || lesson.author.publicId} (${lesson.author.publicId})`
                      : "Unknown"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Submitted
                  </Text>
                  <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                    {submittedAt ? formatDateTime(submittedAt) : "Unknown"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Concepts
                  </Text>
                  <Text size="sm" className="mt-1 break-words text-[var(--color-text-secondary)]">
                    {lesson.conceptPublicIds?.length ? lesson.conceptPublicIds.join(", ") : "None"}
                  </Text>
                </div>
              </div>
            </Card>

            {automatedReasons.length > 0 && (
              <Card className="admin-card">
                <div className="space-y-3">
                  <div>
                    <Text size="sm" className="font-semibold text-[var(--color-text)]">
                      Automated Moderation Reasons
                    </Text>
                    <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                      These reasons come from automated moderation and are separate from any manual rejection note.
                    </Text>
                  </div>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    {automatedReasons.map((reason) => (
                      <li key={reason} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {lesson.adminRejectionReason && (
              <Card className="admin-card">
                <div className="space-y-3">
                  <div>
                    <Text size="sm" className="font-semibold text-[var(--color-text)]">
                      Admin Rejection Reason
                    </Text>
                    <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                      This note was provided by the admin reviewer and is intentionally separate from automated reasons.
                    </Text>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {lesson.adminRejectionReason}
                  </div>
                </div>
              </Card>
            )}

            {lesson.lessonModerationStatus === "REJECTED" && !lesson.adminRejectionReason && (
              <Card className="admin-card">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <Text size="sm" className="font-semibold text-red-100">
                    Automatic rejection
                  </Text>
                  <Text size="sm" className="mt-1 text-red-100/80">
                    No admin rejection reason is present for this lesson. Treat the automated moderation reasons as the rejection source.
                  </Text>
                </div>
              </Card>
            )}

            <Card className="admin-card">
              {lesson.content ? (
                <TextDisplayer content={lesson.content} />
              ) : (
                <Text c="dimmed">No lesson content available.</Text>
              )}
            </Card>
          </Stack>
        </Container>
      </div>
    </div>
  );
}
