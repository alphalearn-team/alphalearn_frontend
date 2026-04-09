"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Card, Stack, Text, Textarea } from "@mantine/core";
import type { LearnerCurrentWeeklyQuest } from "@/interfaces/interfaces";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { showSuccess } from "@/lib/utils/popUpNotifications";
import { formatDateTime } from "@/lib/utils/formatDate";
import {
  createQuestChallengeUpload,
  getQuestChallengeMediaKind,
  isSupportedQuestChallengeFile,
  saveQuestChallengeSubmission,
  toFriendlyQuestChallengeError,
} from "@/lib/utils/weeklyQuestChallenge";
import CommonButton from "@/components/CommonButton";
import GlowIconButton from "@/components/GlowIconButton";
import FriendTagger from "./FriendTagger";

type UploadState = "idle" | "uploading" | "uploadFailed" | "uploaded";
type SaveState = "idle" | "saving" | "saveFailed" | "saved";

interface UploadedQuestChallengeAsset {
  objectKey: string;
  originalFilename: string;
}

interface QuestChallengeSubmissionSectionProps {
  weeklyQuest: LearnerCurrentWeeklyQuest | null;
  variant?: "compact" | "page";
}

export default function QuestChallengeSubmissionSection({
  weeklyQuest,
  variant = "compact",
}: QuestChallengeSubmissionSectionProps) {
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const initialSubmission = weeklyQuest?.questChallengeSubmission ?? null;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [captionDraft, setCaptionDraft] = useState(initialSubmission?.caption ?? "");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    initialSubmission?.taggedFriends.map((friend) => friend.learnerPublicId) ?? []
  );
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [uploadedAsset, setUploadedAsset] = useState<UploadedQuestChallengeAsset | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState(initialSubmission);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const savedSubmission = currentSubmission;
  const hasActiveQuest = Boolean(weeklyQuest);
  const isSubmitted = Boolean(savedSubmission);
  const isBusy = uploadState === "uploading" || saveState === "saving";
  const normalizeFriendIds = (ids: string[]) => Array.from(new Set(ids)).sort();
  const normalizedDraftCaption = captionDraft.trim();
  const normalizedSavedCaption = savedSubmission?.caption?.trim() ?? "";
  const normalizedSelectedFriendIds = normalizeFriendIds(selectedFriendIds);
  const normalizedSavedFriendIds = normalizeFriendIds(
    savedSubmission?.taggedFriends.map((friend) => friend.learnerPublicId) ?? [],
  );
  const hasCaptionChanged = normalizedDraftCaption !== normalizedSavedCaption;
  const hasTagsChanged =
    normalizedSelectedFriendIds.length !== normalizedSavedFriendIds.length ||
    normalizedSelectedFriendIds.some((id, index) => id !== normalizedSavedFriendIds[index]);
  const hasMediaChanged = Boolean(selectedFile || uploadedAsset);
  const canSubmit =
    Boolean(session?.access_token) &&
    !isBusy &&
    (hasMediaChanged || (Boolean(savedSubmission) && (hasCaptionChanged || hasTagsChanged)));
  const isPageVariant = variant === "page";

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  if (!hasActiveQuest) {
    return null;
  }

  const submissionStateLabel = isSubmitted ? "Submitted" : "Not submitted";
  const stepBadgeClass = "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold";

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

  const handleFileChange = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (file) {
      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;
      setLocalPreviewUrl(nextPreviewUrl);
    } else {
      setLocalPreviewUrl(null);
    }

    setSelectedFile(file);
    setUploadState("idle");
    setSaveState("idle");
    setUploadedAsset(null);
    setErrorMessage(null);

    if (!file && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStepAdvance = () => {
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      setErrorMessage("Your session is still loading. Please try again in a moment.");
      return;
    }

    if (!selectedFile && !uploadedAsset && !savedSubmission) {
      setErrorMessage("Select one image or video before submitting.");
      return;
    }

    if (!selectedFile && savedSubmission && !hasCaptionChanged && !hasTagsChanged) {
      setErrorMessage("No changes to save yet.");
      return;
    }

    setErrorMessage(null);

    try {
      let nextUploadedAsset = uploadedAsset;

      if (!nextUploadedAsset && selectedFile) {
        setUploadState("uploading");
        nextUploadedAsset = await uploadSelectedFile(selectedFile, accessToken);
        setUploadedAsset(nextUploadedAsset);
        setUploadState("uploaded");
      }

      if (!nextUploadedAsset && savedSubmission) {
        nextUploadedAsset = {
          objectKey: savedSubmission.objectKey,
          originalFilename: savedSubmission.originalFilename,
        };
      }

      if (!nextUploadedAsset) {
        setErrorMessage("The upload did not complete. Please try again.");
        return;
      }

      setSaveState("saving");

      const saved = await saveQuestChallengeSubmission(accessToken, {
        objectKey: nextUploadedAsset.objectKey,
        originalFilename: nextUploadedAsset.originalFilename,
        caption: normalizedDraftCaption ? normalizedDraftCaption : null,
        taggedFriendPublicIds: normalizedSelectedFriendIds,
      });

      setCurrentSubmission(saved);
      setSaveState("saved");
      setUploadState("idle");
      setUploadedAsset(null);
      setSelectedFile(null);
      setCaptionDraft(saved.caption ?? "");
      setSelectedFriendIds(saved.taggedFriends.map((friend) => friend.learnerPublicId));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      showSuccess(isSubmitted ? "Quest challenge submission replaced." : "Quest challenge submission saved.");
    } catch (error) {
      setErrorMessage(toFriendlyQuestChallengeError(error));
      if (uploadState === "uploading") {
        setUploadState("uploadFailed");
      } else {
        setSaveState("saveFailed");
      }
    }
  };

  if (!isPageVariant) {
    return (
      <Card radius="24px" padding="lg" className="border border-white/10 bg-black/15">
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
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      radius="32px"
      padding="xl"
      className="border border-[#313530] bg-[#171717] shadow-[0_30px_120px_-60px_rgba(0,0,0,0.95)]"
    >
      <Stack gap="lg">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Quest challenge
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              {currentStep === 1 ? "Start with today’s challenge" : "Upload your image or video"}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Step {currentStep} of 2
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {isSubmitted ? "Replace anytime" : "One file"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${stepBadgeClass} ${currentStep === 1 ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-black" : "border-white/10 bg-black/25 text-[var(--color-text-muted)]"}`}>
            1
          </div>
          <div className="h-px flex-1 bg-white/10" />
          <div className={`${stepBadgeClass} ${currentStep === 2 ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-black" : "border-white/10 bg-black/25 text-[var(--color-text-muted)]"}`}>
            2
          </div>
        </div>

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

        {uploadedAsset && saveState !== "saved" ? (
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

        {currentStep === 1 ? (
          <div className="flex min-h-[520px] flex-col justify-between rounded-[28px] border border-[#313530] bg-[#171717] p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Coming next
              </p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Watch a lesson first.
              </h4>
              <Text size="sm" className="mt-4 max-w-xl leading-relaxed text-[var(--color-text-secondary)]">
                This first step can become a warm-up or prep space later. For now it stays empty
                on purpose before the upload flow starts.
              </Text>

              <div className="mt-8 rounded-[24px] border border-dashed border-[#313530] bg-[#131313] px-6 py-12">
                <p className="text-lg text-[var(--color-text)]">
                  Read a lesson or concept to learn more about this week&apos;s topic!
                </p>
              </div>

              {savedSubmission ? (
                <div className="mt-6 rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <div className="overflow-hidden rounded-[14px] border border-white/10 bg-black/35">
                    {getQuestChallengeMediaKind(savedSubmission.contentType) === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={savedSubmission.publicUrl}
                        alt={savedSubmission.originalFilename}
                        className="max-h-72 w-full object-cover"
                      />
                    ) : getQuestChallengeMediaKind(savedSubmission.contentType) === "video" ? (
                      <video
                        controls
                        preload="metadata"
                        src={savedSubmission.publicUrl}
                        className="max-h-72 w-full bg-black"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center text-sm text-[var(--color-text-muted)]">
                        Preview unavailable
                      </div>
                    )}
                  </div>

                  <Text size="sm" className="text-[var(--color-text)]">
                    Current saved submission: {savedSubmission.originalFilename}
                  </Text>
                  <Text size="xs" className="mt-2 text-[var(--color-text-muted)]">
                    Updated {formatDateTime(savedSubmission.updatedAt)}
                  </Text>
                  {savedSubmission.caption && (
                    <Text size="xs" className="mt-3 text-[var(--color-text-secondary)]">
                      Caption: {savedSubmission.caption}
                    </Text>
                  )}
                  {savedSubmission.taggedFriends.length > 0 && (
                    <div className="mt-3">
                      <Text size="xs" className="text-[var(--color-text-muted)]">
                        Tagged friends:
                      </Text>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {savedSubmission.taggedFriends.map((friend) => (
                          <span
                            key={friend.learnerPublicId}
                            className="inline-block rounded-full bg-[var(--color-primary)]/20 px-3 py-1 text-xs text-[var(--color-primary)]"
                          >
                            {friend.learnerUsername}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end">
              <GlowIconButton
                icon="arrow_forward"
                onClick={handleStepAdvance}
                ariaLabel="Go to upload step"
                size="sm"
              />
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              disabled={isBusy}
              onChange={(event) => handleFileChange(event.currentTarget.files?.[0] ?? null)}
            />

            <div className="rounded-[28px] border border-white/10 bg-[#171717] p-6">
              <p className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Upload file
              </p>
              <Text size="sm" className="mt-2 text-[var(--color-text-secondary)]">
                Upload one image or video, then add an optional caption below.
              </Text>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-8 w-full rounded-[22px] border border-dashed px-6 py-12 text-center transition ${
                  isBusy
                    ? "cursor-not-allowed border-white/10 bg-black/20 opacity-70"
                    : "border-[#496070] bg-[#1d1d1d] hover:border-[var(--color-primary)]/55"
                }`}
              >
                <div className="mx-auto flex max-w-md flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[var(--color-text-muted)]">
                    <span className="material-symbols-outlined text-2xl">upload</span>
                  </div>
                  <p className="mt-5 text-lg text-[var(--color-text)]">
                    Drag &amp; Drop or{" "}
                    <span className="font-semibold text-[#16d9b4]">Click to upload</span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    Images and videos only
                  </p>
                </div>
              </button>

              {selectedFile && localPreviewUrl ? (
                <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10 bg-black/20">
                  {selectedFile.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={localPreviewUrl}
                      alt={selectedFile.name}
                      className="max-h-80 w-full object-cover"
                    />
                  ) : selectedFile.type.startsWith("video/") ? (
                    <video
                      controls
                      src={localPreviewUrl}
                      className="max-h-80 w-full bg-black"
                    />
                  ) : null}
                </div>
              ) : null}

              {(selectedFile || savedSubmission) ? (
                <div className="mt-6 rounded-[18px] border border-white/10 bg-[#2a2a2a] p-4">
                  {!selectedFile ? (
                    <div className="mb-4 overflow-hidden rounded-[12px] border border-white/10 bg-black/35">
                      {getQuestChallengeMediaKind(savedSubmission?.contentType) === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={savedSubmission?.publicUrl}
                          alt={savedSubmission?.originalFilename ?? "Saved submission"}
                          className="max-h-56 w-full object-cover"
                        />
                      ) : getQuestChallengeMediaKind(savedSubmission?.contentType) === "video" ? (
                        <video
                          controls
                          preload="metadata"
                          src={savedSubmission?.publicUrl}
                          className="max-h-56 w-full bg-black"
                        />
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[var(--color-text-muted)]">
                        <span className="material-symbols-outlined text-xl">
                          {selectedFile ? "description" : "check_circle"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {selectedFile?.name ?? savedSubmission?.originalFilename}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(0)} KB · ${
                                isSupportedQuestChallengeFile(selectedFile) ? "Selected" : "Unsupported type"
                              }`
                            : "Saved submission"}
                        </p>
                      </div>
                    </div>
                    {selectedFile ? (
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <Textarea
                label="Caption"
                placeholder="Write something about your challenge"
                value={captionDraft}
                onChange={(event) => setCaptionDraft(event.currentTarget.value)}
                minRows={6}
                mt="xl"
                disabled={isBusy}
              />

              {session?.access_token ? (
                <div className="mt-6 rounded-[18px] border border-white/10 bg-black/20 p-5">
                  <FriendTagger
                    accessToken={session.access_token}
                    selectedFriendIds={selectedFriendIds}
                    onSelectedFriendsChange={setSelectedFriendIds}
                    disabled={isBusy}
                    label="Tag friends (optional)"
                    placeholder="Search for friends to tag"
                  />
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <GlowIconButton
                  icon="arrow_back"
                  onClick={() => setCurrentStep(1)}
                  ariaLabel="Go back to the previous step"
                  size="sm"
                  disabled={isBusy}
                />
                <CommonButton
                  disabled={!canSubmit}
                  loading={isBusy}
                  onClick={handleSubmit}
                  className="min-w-[180px] justify-center"
                >
                  {isSubmitted ? "Save changes" : "Publish submission"}
                </CommonButton>
              </div>

              {!session?.access_token ? (
                <Text size="sm" className="mt-4 text-[var(--color-text-muted)]">
                  Waiting for your session to load before submission is enabled.
                </Text>
              ) : null}
            </div>
          </>
        ) : null}
      </Stack>
    </Card>
  );
}
