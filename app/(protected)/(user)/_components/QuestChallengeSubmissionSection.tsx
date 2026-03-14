"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Stack, Text, TextInput, Textarea } from "@mantine/core";
import type { LearnerCurrentWeeklyQuest } from "@/interfaces/interfaces";
import { useAuth } from "@/context/AuthContext";
import { showSuccess } from "@/lib/actions/notifications";
import { formatDateTime } from "@/lib/formatDate";
import {
  createQuestChallengeUpload,
  getQuestChallengeMediaKind,
  isSupportedQuestChallengeFile,
  saveQuestChallengeSubmission,
  toFriendlyQuestChallengeError,
} from "@/lib/weeklyQuestChallenge";

type UploadState = "idle" | "uploading" | "uploadFailed" | "uploaded";
type SaveState = "idle" | "saving" | "saveFailed" | "saved";

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
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [uploadedAsset, setUploadedAsset] = useState<UploadedQuestChallengeAsset | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState(
    weeklyQuest?.questChallengeSubmission ?? null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const savedSubmission = currentSubmission;
  const hasActiveQuest = Boolean(weeklyQuest);
  const isSubmitted = Boolean(savedSubmission);
  const mediaKind = getQuestChallengeMediaKind(savedSubmission?.contentType);
  const isBusy = uploadState === "uploading" || saveState === "saving";
  const canSubmit = Boolean(session?.access_token) && !isBusy && Boolean(selectedFile || uploadedAsset);

  useEffect(() => {
    setCaptionDraft(savedSubmission?.caption ?? "");
  }, [savedSubmission?.caption]);

  useEffect(() => {
    setCurrentSubmission(weeklyQuest?.questChallengeSubmission ?? null);
  }, [weeklyQuest?.questChallengeSubmission]);

  if (!hasActiveQuest) {
    return null;
  }

  const submissionStateLabel = isSubmitted ? "Submitted" : "Not submitted";

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setUploadState("idle");
    setSaveState("idle");
    setUploadedAsset(null);
    setErrorMessage(null);
  };

  const uploadSelectedFile = async (file: File, accessToken: string) => {
    const uploadInstruction = await createQuestChallengeUpload(accessToken, {
      filename: file.name,
      contentType: file.type,
      fileSizeBytes: file.size,
    });

    const uploadResponse = await fetch(uploadInstruction.uploadUrl, {
      method: "PUT",
      headers: uploadInstruction.requiredHeaders,
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("File upload failed. Please retry the upload.");
    }

    return {
      objectKey: uploadInstruction.objectKey,
      originalFilename: file.name,
    };
  };

  const handleSubmit = async () => {
    const accessToken = session?.access_token;
    let activeStep: "upload" | "save" | null = null;

    if (!accessToken) {
      setErrorMessage("Your session is still loading. Please try again in a moment.");
      return;
    }

    if (!uploadedAsset && !selectedFile) {
      setErrorMessage("Select one image or video before submitting.");
      return;
    }

    if (selectedFile && !isSupportedQuestChallengeFile(selectedFile)) {
      setErrorMessage("Only image and video files are supported for quest challenge submissions.");
      setUploadState("uploadFailed");
      return;
    }

    setErrorMessage(null);

    try {
      let nextUploadedAsset = uploadedAsset;

      if (!nextUploadedAsset && selectedFile) {
        activeStep = "upload";
        setUploadState("uploading");
        nextUploadedAsset = await uploadSelectedFile(selectedFile, accessToken);
        setUploadedAsset(nextUploadedAsset);
        setUploadState("uploaded");
      }

      if (!nextUploadedAsset) {
        setErrorMessage("The upload did not complete. Please try again.");
        return;
      }

      activeStep = "save";
      setSaveState("saving");

      const saved = await saveQuestChallengeSubmission(accessToken, {
        objectKey: nextUploadedAsset.objectKey,
        originalFilename: nextUploadedAsset.originalFilename,
        caption: captionDraft.trim() ? captionDraft.trim() : null,
      });

      setCurrentSubmission(saved);
      setSaveState("saved");
      setUploadState("idle");
      setUploadedAsset(null);
      setSelectedFile(null);
      setCaptionDraft(saved.caption ?? "");
      showSuccess(isSubmitted ? "Quest challenge submission replaced." : "Quest challenge submission saved.");
    } catch (error) {
      const message = toFriendlyQuestChallengeError(error);
      setErrorMessage(message);

      if (activeStep === "save") {
        setSaveState("saveFailed");
      } else if (activeStep === "upload") {
        setUploadState("uploadFailed");
      }
    }
  };

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

        {uploadState === "uploading" ? (
          <Alert color="blue" radius="lg" variant="light" title="Uploading">
            Uploading your file to quest challenge storage.
          </Alert>
        ) : null}

        {uploadState === "uploadFailed" ? (
          <Alert color="red" radius="lg" variant="light" title="Upload failed">
            Your file is still selected. Fix the issue and retry the upload.
          </Alert>
        ) : null}

        {uploadedAsset ? (
          <Alert color="blue" radius="lg" variant="light" title="Upload ready">
            Your file upload is ready to save to the quest challenge.
          </Alert>
        ) : null}

        {saveState === "saving" ? (
          <Alert color="blue" radius="lg" variant="light" title="Saving">
            Saving your quest challenge submission.
          </Alert>
        ) : null}

        {saveState === "saveFailed" ? (
          <Alert color="red" radius="lg" variant="light" title="Save failed">
            Your uploaded file is still ready. Retry save without reselecting the file.
          </Alert>
        ) : null}

        {saveState === "saved" ? (
          <Alert color="green" radius="lg" variant="light" title="Submitted">
            Your quest challenge submission has been saved.
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
          disabled={isBusy}
          onChange={(event) => handleFileChange(event.currentTarget.files?.[0] ?? null)}
        />

        <Textarea
          label="Caption"
          placeholder="Add an optional caption"
          value={captionDraft}
          onChange={(event) => setCaptionDraft(event.currentTarget.value)}
          minRows={3}
          disabled={isBusy}
        />

        <div className="flex flex-wrap gap-3">
          <Button disabled={!canSubmit} loading={isBusy} onClick={handleSubmit}>
            {isSubmitted ? "Replace submission" : "Save submission"}
          </Button>
          {saveState === "saveFailed" && uploadedAsset ? (
            <Button variant="light" disabled={isBusy} onClick={handleSubmit}>
              Retry save
            </Button>
          ) : null}
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
