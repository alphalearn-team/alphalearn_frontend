import { apiClientFetch } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/apiErrors";

const PROFILE_PATH = "/me/profile";
const PROFILE_PICTURE_UPLOAD_PATH = "/me/profile/picture/uploads";
const PROFILE_PICTURE_PATH = "/me/profile/picture";

export interface UserProfile {
  publicId: string;
  username: string;
  bio: string | null;
  profilePictureUrl: string | null;
  email: string | null;
}

export interface UpdateUserProfileRequest {
  username?: string;
  bio?: string;
}

export interface ProfilePictureUploadRequest {
  filename: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface ProfilePictureUploadResponse {
  objectKey: string;
  publicUrl: string | null;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}

export interface FinalizeProfilePictureRequest {
  objectKey: string;
}

export type ProfilePictureErrorStage = "prepare" | "upload" | "finalize";

export function normalizeProfileUsername(username: string) {
  return username.trim();
}

export function isSupportedProfileImageFile(file: Pick<File, "type">) {
  return Boolean(file.type) && file.type.startsWith("image/");
}

export function getProfileLoadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "Your profile could not be found.";
    }

    if (error.status >= 500) {
      return "We could not load your profile right now. Please try again.";
    }

    return error.message || "We could not load your profile.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not load your profile.";
}

export function getProfileSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return error.message || "Username cannot be blank.";
    }

    if (error.status === 409) {
      return "That username is already taken. Please choose a different one.";
    }

    if (error.status >= 500) {
      return "We could not save your profile right now. Please try again.";
    }

    return error.message || "We could not save your profile.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not save your profile.";
}

export function getProfilePictureErrorMessage(
  error: unknown,
  stage: ProfilePictureErrorStage,
) {
  if (stage === "upload") {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "The image upload did not complete. Please try again.";
  }

  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 415) {
      return error.message || "Please choose a valid image file.";
    }

    if (error.status === 413) {
      return "That image is too large. Please choose a smaller file.";
    }

    if (error.status >= 500) {
      return stage === "finalize"
        ? "Your image uploaded, but we could not attach it to your profile. Please try again."
        : "We could not start the image upload right now. Please try again.";
    }

    return error.message
      || (stage === "finalize"
        ? "Your image uploaded, but we could not attach it to your profile. Please try again."
        : "We could not upload that image.");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return stage === "finalize"
    ? "Your image uploaded, but we could not attach it to your profile. Please try again."
    : "We could not upload that image.";
}

export async function fetchMyProfile(accessToken: string) {
  return apiClientFetch<UserProfile>(PROFILE_PATH, accessToken);
}

export async function updateMyProfile(
  accessToken: string,
  payload: UpdateUserProfileRequest,
) {
  return apiClientFetch<UserProfile>(PROFILE_PATH, accessToken, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function createProfilePictureUpload(
  accessToken: string,
  payload: ProfilePictureUploadRequest,
) {
  return apiClientFetch<ProfilePictureUploadResponse>(
    PROFILE_PICTURE_UPLOAD_PATH,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function finalizeProfilePicture(
  accessToken: string,
  payload: FinalizeProfilePictureRequest,
) {
  return apiClientFetch<UserProfile>(PROFILE_PICTURE_PATH, accessToken, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
