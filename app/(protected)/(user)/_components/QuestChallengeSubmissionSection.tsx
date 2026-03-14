"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Stack, Text, TextInput, Textarea } from "@mantine/core";
import type { LearnerCurrentWeeklyQuest } from "@/interfaces/interfaces";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime } from "@/lib/formatDate";
import { getQuestChallengeMediaKind } from "@/lib/weeklyQuestChallenge";

type SubmissionUiState = "idle" | "uploading" | "uploadFailed" | "uploaded" | "saving" | "saved";

interface UploadedQuestChallengeAsset {
  objectKey: string;
  originalFilename: string;
}

interface QuestChallengeSubmissionSectionProps {
  weeklyQuest: LearnerCurrentWeeklyQuest | null;
}

export default function QuestChallengeSubmissionSection({
  weeklyQuest,
}: QuestChallengeSubmissionSectionProps) {
  const { session } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [uploadState, setUploadState] = useState<SubmissionUiState>("idle");
  const [saveState, setSaveState] = useState<SubmissionUiState>("idle");
  const [uploadedAsset, setUploadedAsset] = useState<UploadedQuestChallengeAsset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const savedSubmission = weeklyQuest?.questChallengeSubmission ?? null;
  const hasActiveQuest = Boolean(weeklyQuest);
  const isSubmitted = Boolean(savedSubmission);
  const mediaKind = getQuestChallengeMediaKind(savedSubmission?.contentType);
  const canSubmit = Boolean(selectedFile && session?.access_token) && uploadState !== "uploading" && saveState !== "saving";

  useEffect(() => {
    setCaptionDraft(savedSubmission?.caption ?? "");
  }, [savedSubmission?.caption]);

  if (!hasActiveQuest) {
    return null;
  }

  const submissionStateLabel = isSubmitted ? "Submitted" : "Not submitted";

  return (
    <Card
      radius="24px"
      padding="lg"
      className="border border-white/10 bg-black/15"
    >
      <Stack gap="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Quest challenge
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
              {submissionStateLabel}
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {isSubmitted ? "Replace anytime" : "One file"}
          </span>
        </div>

        {savedSubmission ? (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Current submission
            </p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {mediaKind === "image" ? (
                <img
                  src={savedSubmission.publicUrl}
                  alt={savedSubmission.originalFilename}
                  className="h-auto max-h-80 w-full object-cover"
                />
              ) : mediaKind === "video" ? (
                <video
                  controls
                  src={savedSubmission.publicUrl}
                  className="h-auto max-h-80 w-full bg-black"
                />
              ) : null}
            </div>

            <Stack gap={6} className="mt-4">
              <Text size="sm" className="text-[var(--color-text)]">
                {savedSubmission.originalFilename}
              </Text>
              {savedSubmission.caption ? (
                <Text size="sm" className="text-[var(--color-text-secondary)]">
                  {savedSubmission.caption}
                </Text>
              ) : null}
              <Text size="xs" className="text-[var(--color-text-muted)]">
                Submitted {formatDateTime(savedSubmission.submittedAt)}
              </Text>
              <Text size="xs" className="text-[var(--color-text-muted)]">
                Updated {formatDateTime(savedSubmission.updatedAt)}
              </Text>
            </Stack>
          </div>
        ) : (
          <Alert color="gray" radius="lg" variant="light" title="Not submitted">
            Submit one image or video for this week&apos;s quest challenge.
          </Alert>
        )}

        {errorMessage ? (
          <Alert color="red" radius="lg" variant="light" title="Submission error">
            {errorMessage}
          </Alert>
        ) : null}

        {uploadedAsset ? (
          <Alert color="blue" radius="lg" variant="light" title="Upload ready">
            Your file upload is ready to save to the quest challenge.
          </Alert>
        ) : null}

        <TextInput
          label={isSubmitted ? "Replace with file" : "Select file"}
          value={selectedFile?.name ?? ""}
          readOnly
          placeholder="Choose one image or video"
        />

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            setSelectedFile(file);
            setUploadState("idle");
            setSaveState("idle");
            setUploadedAsset(null);
            setErrorMessage(null);
          }}
        />

        <Textarea
          label="Caption"
          placeholder="Add an optional caption"
          value={captionDraft}
          onChange={(event) => setCaptionDraft(event.currentTarget.value)}
          minRows={3}
        />

        <div className="flex flex-wrap gap-3">
          <Button disabled={!canSubmit}>
            {isSubmitted ? "Replace submission" : "Save submission"}
          </Button>
          {!session?.access_token ? (
            <Text size="sm" className="self-center text-[var(--color-text-muted)]">
              Waiting for your session to load before submission is enabled.
            </Text>
          ) : null}
        </div>
      </Stack>
    </Card>
  );
}
