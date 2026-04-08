"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Container,
  PasswordInput,
  Skeleton,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { fetchFriends, getFriendsLoadErrorMessage } from "@/lib/utils/friends";
import { showError, showInfo, showSuccess } from "@/lib/utils/popUpNotifications";
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
import ProfileSquadPreview from "./ProfileSquadPreview";

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

interface ProfileRowProps {
  label: string;
  children: ReactNode;
}

function ProfileRow({ label, children }: ProfileRowProps) {
  return (
    <div className="grid gap-2 py-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <Container size="lg" className="py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex flex-col items-center md:items-start">
            <Skeleton height={150} circle />
            <Skeleton height={16} width={120} radius="xl" className="mt-5" />
          </div>

          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Skeleton height={38} width={220} radius="xl" />
              <div className="flex gap-3">
                <Skeleton height={42} width={150} radius="xl" />
                <Skeleton height={42} width={170} radius="xl" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
              <Skeleton height={18} width={140} radius="xl" />
              <Skeleton height={18} width={180} radius="xl" />
              <Skeleton height={18} width={140} radius="xl" />
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton height={18} width={160} radius="xl" />
              <Skeleton height={18} width="70%" radius="xl" />
              <Skeleton height={18} width="50%" radius="xl" />
            </div>
          </div>
        </div>

        <div className="space-y-0 divide-y divide-white/10">
          <div className="grid gap-2 py-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
            <Skeleton height={12} width={80} radius="xl" />
            <Skeleton height={22} width={220} radius="xl" />
          </div>
          <div className="grid gap-2 py-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
            <Skeleton height={12} width={80} radius="xl" />
            <Skeleton height={78} radius="xl" />
          </div>
          <div className="grid gap-2 py-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
            <Skeleton height={12} width={80} radius="xl" />
            <Skeleton height={22} width={260} radius="xl" />
          </div>
        </div>
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
  const [pictureNotice, setPictureNotice] = useState<string | null>(null);
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
  const [isSquadPreviewOpen, setIsSquadPreviewOpen] = useState(false);
  const [squadMemberCount, setSquadMemberCount] = useState(0);
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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const accessToken = session?.access_token;

    if (!accessToken) {
      setSquadMemberCount(0);
      return;
    }

    let isCancelled = false;

    const loadSquadCount = async () => {
      try {
        const friends = await fetchFriends(accessToken);

        if (isCancelled) {
          return;
        }

        setSquadMemberCount(friends.length);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Failed to load squad count:", getFriendsLoadErrorMessage(error));
      }
    };

    void loadSquadCount();

    return () => {
      isCancelled = true;
    };
  }, [isLoading, session?.access_token]);

  const avatarUrl = selectedImagePreviewUrl || profile?.profilePictureUrl || null;
  const accessToken = session?.access_token ?? null;
  const emailValue = profile?.email ?? "No email available";
  const isBusy = isSavingProfile || isUploadingPicture;
  const shouldShowEditorSection =
    isEditingProfile
    || isPasswordEditorOpen
    || Boolean(profileError)
    || Boolean(pictureError)
    || Boolean(pictureNotice)
    || Boolean(passwordError)
    || Boolean(passwordSuccess);

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
    setPictureNotice(null);
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
    setPictureNotice(null);

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
      } else {
        const notice = "Your selected image is still pending. Click Update photo to apply it.";
        setPictureNotice(notice);
        showInfo(notice);
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
      } else {
        const notice = "Profile details saved. Click Update photo to apply the selected image.";
        setPictureNotice(notice);
        showInfo(notice);
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
      setPictureNotice(null);
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

  const handleClosePasswordEditor = () => {
    if (isChangingPassword) {
      return;
    }

    setIsPasswordEditorOpen(false);
    setPasswordError(null);
    setPasswordSuccess(null);
    setNewPassword("");
    setConfirmPassword("");
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
      <Container size="lg" className="py-8 lg:py-10">
        <div className="mx-auto max-w-4xl border-b border-white/10 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Profile
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Profile unavailable
          </h1>
          <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            {loadError || "We could not load your profile right now."}
          </Text>

          <div className="mt-6">
            <CommonButton onClick={handleRetryProfileLoad}>
              Retry
            </CommonButton>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        {loadError ? (
          <Alert color="red" radius="lg" variant="light" title="Profile load failed" className="mb-6">
            {loadError}
          </Alert>
        ) : null}

        <section className="border-b border-white/10 pb-10">
          <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
            <div className="flex flex-col items-center md:items-start">
              <Avatar
                src={avatarUrl}
                size={150}
                radius={999}
                color="teal"
                className="border-2 border-white/10 bg-black/20 text-4xl font-semibold text-[var(--color-primary)]"
              >
                {getProfileInitials(profile)}
              </Avatar>

              {isEditingProfile ? (
                <div className="mt-5 w-full space-y-3">
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
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {selectedImageFile ? "Choose another photo" : "Change photo"}
                  </button>

                  {selectedImageFile ? (
                    <>
                      <p className="text-center text-xs leading-relaxed text-[var(--color-text-muted)] md:text-left">
                        Selected: {selectedImageFile.name}
                      </p>

                      <CommonButton
                        onClick={handleUploadPicture}
                        loading={isUploadingPicture}
                        disabled={isSavingProfile}
                        className="w-full"
                      >
                        Update photo
                      </CommonButton>

                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        disabled={isBusy}
                        className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Clear selection
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-xs leading-relaxed text-[var(--color-text-muted)] md:text-left">
                      Select an image file only. Profile photo upload stays separate from username
                      and bio changes.
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h1 className="truncate text-[clamp(2rem,4vw,2.7rem)] font-semibold tracking-tight text-[var(--color-text)]">
                    {profile.username}
                  </h1>
                  <p className="mt-2 break-words text-sm text-[var(--color-text-secondary)]">
                    {emailValue}
                  </p>

                  <p className="mt-2 break-words text-sm text-[var(--color-text-secondary)]">
                    <button
                      type="button"
                      onClick={() => setIsSquadPreviewOpen((current) => !current)}
                      className="cursor-pointer bg-transparent p-0 text-inherit transition-colors hover:text-[var(--color-text)]"
                    >
                      {squadMemberCount} {squadMemberCount === 1 ? "Member" : "Members"} in My Squad
                    </button>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isEditingProfile ? (
                    <>
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
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10"
                      >
                        Edit profile
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPasswordEditorOpen(true)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10"
                      >
                        Change password
                      </button>
                    </>
                  )}
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

        {shouldShowEditorSection ? (
          <section className="pt-2">
            <div className="divide-y divide-white/10">
              {profileError ? (
                <div className="py-5">
                  <Alert color="red" radius="lg" variant="light" title="Profile save failed">
                    {profileError}
                  </Alert>
                </div>
              ) : null}

              {pictureError ? (
                <div className="py-5">
                  <Alert color="red" radius="lg" variant="light" title="Image upload failed">
                    {pictureError}
                  </Alert>
                </div>
              ) : null}

              {pictureNotice ? (
                <div className="py-5">
                  <Alert color="blue" radius="lg" variant="light" title="Photo still pending">
                    {pictureNotice}
                  </Alert>
                </div>
              ) : null}

              {(passwordError || passwordSuccess) ? (
                <div className="space-y-4 py-5">
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
                </div>
              ) : null}

              {isEditingProfile ? (
                <>
                  <ProfileRow label="Username">
                    <TextInput
                      value={draftUsername}
                      onChange={(event) => setDraftUsername(event.currentTarget.value)}
                      placeholder="Choose a username"
                      disabled={isBusy}
                      radius="xl"
                      size="md"
                    />
                  </ProfileRow>

                  <ProfileRow label="Bio">
                    <Textarea
                      value={draftBio}
                      onChange={(event) => setDraftBio(event.currentTarget.value)}
                      placeholder="Tell people what you are learning right now"
                      minRows={5}
                      autosize
                      disabled={isBusy}
                      radius="xl"
                    />
                  </ProfileRow>
                </>
              ) : null}

              {isPasswordEditorOpen ? (
                <>
                  <div className="py-5">
                    <div className="grid gap-4 md:max-w-xl">
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
                        <CommonButton onClick={handleUpdatePassword} loading={isChangingPassword}>
                          Save new password
                        </CommonButton>

                        <button
                          type="button"
                          onClick={handleClosePasswordEditor}
                          disabled={isChangingPassword}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        {accessToken && isSquadPreviewOpen ? (
          <ProfileSquadPreview
            accessToken={accessToken}
            onFriendsCountChange={setSquadMemberCount}
          />
        ) : null}
      </div>
    </Container>
  );
}
