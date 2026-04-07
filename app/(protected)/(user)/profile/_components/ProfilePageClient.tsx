"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  Container,
  PasswordInput,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";
import {
  createProfilePictureUpload,
  fetchMyProfile,
  finalizeProfilePicture,
  getProfileLoadErrorMessage,
  getProfilePictureErrorMessage,
  getProfileSaveErrorMessage,
  isSupportedProfileImageFile,
  normalizeProfileUsername,
  updateMyProfile,
  type ProfilePictureErrorStage,
  type UserProfile,
} from "@/lib/utils/profile";

function getProfileInitials(profile: UserProfile | null) {
  const source = profile?.username || profile?.email || "AL";
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

interface ProfileFieldProps {
  label: string;
  value: string;
  readOnly?: boolean;
}

function ProfileField({ label, value, readOnly = false }: ProfileFieldProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>
        {readOnly ? (
          <Badge variant="light" color="gray" radius="xl">
            Read only
          </Badge>
        ) : null}
      </div>
      <p className="mt-3 break-words text-sm leading-relaxed text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <Container size="xl" className="py-6 lg:py-8">
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <Card
          radius="32px"
          padding="xl"
          className="border border-[var(--color-border)]/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
        >
          <Stack gap="lg">
            <Skeleton height={14} width={140} radius="xl" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <Skeleton height={120} circle />
              <div className="flex-1 space-y-3">
                <Skeleton height={34} width="55%" radius="xl" />
                <Skeleton height={18} width="42%" radius="xl" />
                <Skeleton height={18} width="65%" radius="xl" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton height={118} radius="24px" />
              <Skeleton height={118} radius="24px" />
            </div>
          </Stack>
        </Card>

        <Card
          radius="32px"
          padding="xl"
          className="border border-[var(--color-border)]/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
        >
          <Stack gap="lg">
            <Skeleton height={14} width={110} radius="xl" />
            <Skeleton height={28} width="60%" radius="xl" />
            <Skeleton height={88} radius="24px" />
            <Skeleton height={44} width={170} radius="xl" />
          </Stack>
        </Card>
      </div>
    </Container>
  );
}

export default function ProfilePageClient() {
  const { isLoading, refreshProfile, session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordEditorOpen, setIsPasswordEditorOpen] = useState(false);
  const [profileReloadSeed, setProfileReloadSeed] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const accessToken = session?.access_token;

    if (!accessToken) {
      setIsProfileLoading(false);
      setLoadError("Your session could not be loaded. Please refresh and try again.");
      return;
    }

    let isCancelled = false;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setLoadError(null);

      try {
        const nextProfile = await fetchMyProfile(accessToken);

        if (isCancelled) {
          return;
        }

        setProfile(nextProfile);
        setDraftUsername(nextProfile.username);
        setDraftBio(nextProfile.bio ?? "");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = getProfileLoadErrorMessage(error);
        setLoadError(message);
        showError(message);
      } finally {
        if (!isCancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [isLoading, profileReloadSeed, session?.access_token]);

  const avatarUrl = selectedImagePreviewUrl || profile?.profilePictureUrl || null;
  const emailValue = profile?.email ?? "No email available";
  const isBusy = isSavingProfile || isUploadingPicture;

  const clearSelectedImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setSelectedImageFile(null);
    setSelectedImagePreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetDraftState = (nextProfile: UserProfile) => {
    setDraftUsername(nextProfile.username);
    setDraftBio(nextProfile.bio ?? "");
    setProfileError(null);
    setPictureError(null);
  };

  const closeProfileEditor = () => {
    if (profile) {
      resetDraftState(profile);
    }

    clearSelectedImage();
    setIsEditingProfile(false);
  };

  const handleRetryProfileLoad = () => {
    setProfileReloadSeed((current) => current + 1);
  };

  const handleImageSelection = (file: File | null) => {
    clearSelectedImage();
    setPictureError(null);

    if (!file) {
      return;
    }

    if (!isSupportedProfileImageFile(file)) {
      const message = "Please choose an image file for your profile picture.";
      setPictureError(message);
      showError(message);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setSelectedImagePreviewUrl(nextPreviewUrl);
    setSelectedImageFile(file);
  };

  const handleSaveProfile = async () => {
    const accessToken = session?.access_token;

    if (!profile || !accessToken) {
      const message = "Your session could not be loaded. Please refresh and try again.";
      setProfileError(message);
      showError(message);
      return;
    }

    const username = normalizeProfileUsername(draftUsername);

    if (!username) {
      const message = "Username cannot be blank.";
      setProfileError(message);
      showError(message);
      return;
    }

    const nextBio = draftBio.trim().length > 0 ? draftBio : "";
    const hasProfileChanges = username !== profile.username || nextBio !== (profile.bio ?? "");

    if (!hasProfileChanges) {
      if (!selectedImageFile) {
        setIsEditingProfile(false);
      }
      setProfileError(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const updatedProfile = await updateMyProfile(accessToken, {
        username,
        bio: nextBio,
      });

      setProfile(updatedProfile);
      resetDraftState(updatedProfile);
      await refreshProfile();

      if (!selectedImageFile) {
        setIsEditingProfile(false);
      }

      showSuccess("Profile updated successfully.");
    } catch (error) {
      const message = getProfileSaveErrorMessage(error);
      setProfileError(message);
      showError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadPicture = async () => {
    const accessToken = session?.access_token;

    if (!selectedImageFile) {
      const message = "Choose an image before updating your profile picture.";
      setPictureError(message);
      showError(message);
      return;
    }

    if (!accessToken) {
      const message = "Your session could not be loaded. Please refresh and try again.";
      setPictureError(message);
      showError(message);
      return;
    }

    let pictureStage: ProfilePictureErrorStage = "prepare";

    setIsUploadingPicture(true);
    setPictureError(null);

    try {
      const uploadInstruction = await createProfilePictureUpload(accessToken, {
        filename: selectedImageFile.name,
        contentType: selectedImageFile.type,
        fileSizeBytes: selectedImageFile.size,
      });

      pictureStage = "upload";

      const uploadResponse = await fetch(uploadInstruction.uploadUrl, {
        method: "PUT",
        headers: uploadInstruction.requiredHeaders,
        body: selectedImageFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("The image upload did not complete. Please try again.");
      }

      pictureStage = "finalize";

      const updatedProfile = await finalizeProfilePicture(accessToken, {
        objectKey: uploadInstruction.objectKey,
      });

      setProfile(updatedProfile);
      resetDraftState(updatedProfile);
      await refreshProfile();
      clearSelectedImage();
      showSuccess("Profile picture updated successfully.");
    } catch (error) {
      const message = getProfilePictureErrorMessage(error, pictureStage);
      setPictureError(message);
      showError(message);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      const message = "Enter a new password before saving.";
      setPasswordError(message);
      setPasswordSuccess(null);
      showError(message);
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = "Your password confirmation does not match.";
      setPasswordError(message);
      setPasswordSuccess(null);
      showError(message);
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      const message = "Password updated successfully.";
      setPasswordSuccess(message);
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordEditorOpen(false);
      showSuccess(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not update your password.";
      setPasswordError(message);
      showError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || isProfileLoading) {
    return <ProfileLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <Container size="xl" className="py-6 lg:py-8">
        <Card
          radius="32px"
          padding="xl"
          className="border border-[var(--color-border)]/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
        >
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Profile
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Profile unavailable
              </h1>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                {loadError || "We could not load your profile right now."}
              </Text>
            </div>

            <CommonButton
              onClick={handleRetryProfileLoad}
              className="w-fit"
            >
              Retry
            </CommonButton>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-6 lg:py-8">
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <Card
          radius="32px"
          padding="xl"
          className="border border-[var(--color-border)]/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
        >
          <Stack gap="xl">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Profile
                </p>
                <Title order={1} className="mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-semibold tracking-tight leading-[1.02]">
                  Manage your AlphaLearn identity.
                </Title>
                <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                  View your account details, update your public profile, and keep your sign-in
                  information secure from one place.
                </Text>
              </div>

              <div className="flex flex-wrap gap-3">
                {isEditingProfile ? (
                  <button
                    type="button"
                    onClick={closeProfileEditor}
                    disabled={isBusy}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/12 px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/18"
                  >
                    Edit profile
                  </button>
                )}
              </div>
            </div>

            {loadError ? (
              <Alert color="red" radius="lg" variant="light" title="Profile load failed">
                {loadError}
              </Alert>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={avatarUrl}
                    size={120}
                    radius={32}
                    color="teal"
                    className="border border-white/10 bg-black/30 text-3xl font-semibold text-[var(--color-primary)]"
                  >
                    {getProfileInitials(profile)}
                  </Avatar>

                  <h2 className="mt-5 text-xl font-semibold text-[var(--color-text)]">
                    {profile.username}
                  </h2>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {getDisplayBio(profile.bio)}
                  </p>

                  {isEditingProfile ? (
                    <div className="mt-6 w-full space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleImageSelection(event.currentTarget.files?.[0] ?? null)}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBusy}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {selectedImageFile ? "Choose another image" : "Choose profile picture"}
                      </button>

                      {selectedImageFile ? (
                        <>
                          <CommonButton
                            onClick={handleUploadPicture}
                            loading={isUploadingPicture}
                            disabled={isSavingProfile}
                            className="w-full"
                          >
                            Update picture
                          </CommonButton>

                          <button
                            type="button"
                            onClick={clearSelectedImage}
                            disabled={isBusy}
                            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Clear selected image
                          </button>
                        </>
                      ) : null}

                      <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                        Select an image file only. The upload is saved separately from your
                        username and bio.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                {profileError ? (
                  <Alert color="red" radius="lg" variant="light" title="Profile save failed">
                    {profileError}
                  </Alert>
                ) : null}

                {pictureError ? (
                  <Alert color="red" radius="lg" variant="light" title="Image upload failed">
                    {pictureError}
                  </Alert>
                ) : null}

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <TextInput
                      label="Username"
                      value={draftUsername}
                      onChange={(event) => setDraftUsername(event.currentTarget.value)}
                      placeholder="Choose a username"
                      disabled={isBusy}
                      radius="xl"
                      size="md"
                    />

                    <Textarea
                      label="Bio"
                      value={draftBio}
                      onChange={(event) => setDraftBio(event.currentTarget.value)}
                      placeholder="Tell people what you are learning right now"
                      minRows={5}
                      autosize
                      disabled={isBusy}
                      radius="xl"
                    />

                    <TextInput
                      label="Email"
                      value={profile.email ?? ""}
                      placeholder="No email available"
                      readOnly
                      disabled
                      radius="xl"
                      size="md"
                      description="Email is managed by your account and cannot be edited here."
                    />

                    <div className="flex flex-wrap gap-3 pt-2">
                      <CommonButton
                        onClick={handleSaveProfile}
                        loading={isSavingProfile}
                        disabled={isUploadingPicture}
                      >
                        Save profile
                      </CommonButton>

                      <button
                        type="button"
                        onClick={closeProfileEditor}
                        disabled={isBusy}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-transparent px-5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Close editor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileField label="Username" value={profile.username} />
                    <ProfileField label="Email" value={emailValue} readOnly />
                    <ProfileField label="Bio" value={getDisplayBio(profile.bio)} />
                    <ProfileField
                      label="Profile picture"
                      value={profile.profilePictureUrl ? "Image uploaded" : "Using placeholder avatar"}
                    />
                  </div>
                )}
              </div>
            </div>
          </Stack>
        </Card>

        <div className="space-y-6">
          <Card
            radius="32px"
            padding="xl"
            className="border border-[var(--color-border)]/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
          >
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Account
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                  Read-only identity details
                </h2>
                <Text size="sm" className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
                  Your email comes from your authenticated account and stays read-only on this
                  page.
                </Text>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Email
                </p>
                <p className="mt-3 break-words text-sm leading-relaxed text-[var(--color-text)]">
                  {emailValue}
                </p>
              </div>
            </Stack>
          </Card>

          <Card
            radius="32px"
            padding="xl"
            className="border border-[var(--color-border)]/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
          >
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Security
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                  Change your password
                </h2>
                <Text size="sm" className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
                  Password changes happen through Supabase Auth and stay separate from your profile
                  edits.
                </Text>
              </div>

              {passwordError ? (
                <Alert color="red" radius="lg" variant="light" title="Password update failed">
                  {passwordError}
                </Alert>
              ) : null}

              {passwordSuccess ? (
                <Alert color="green" radius="lg" variant="light" title="Password updated">
                  {passwordSuccess}
                </Alert>
              ) : null}

              {isPasswordEditorOpen ? (
                <div className="space-y-4">
                  <PasswordInput
                    label="New password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.currentTarget.value)}
                    disabled={isChangingPassword}
                    radius="xl"
                    size="md"
                  />

                  <PasswordInput
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                    disabled={isChangingPassword}
                    radius="xl"
                    size="md"
                  />

                  <div className="flex flex-wrap gap-3 pt-2">
                    <CommonButton
                      onClick={handleUpdatePassword}
                      loading={isChangingPassword}
                    >
                      Save new password
                    </CommonButton>

                    <button
                      type="button"
                      onClick={() => {
                        if (isChangingPassword) {
                          return;
                        }

                        setIsPasswordEditorOpen(false);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      disabled={isChangingPassword}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-transparent px-5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <CommonButton onClick={() => setIsPasswordEditorOpen(true)} className="w-fit">
                  Change password
                </CommonButton>
              )}
            </Stack>
          </Card>
        </div>
      </div>
    </Container>
  );
}
