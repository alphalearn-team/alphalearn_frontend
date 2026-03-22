import type { AdminContributorApplication } from "@/interfaces/interfaces";

export function sortPendingContributorApplications(
  applications: AdminContributorApplication[],
) {
  return [...applications].sort(
    (left, right) =>
      Date.parse(right.submittedAt) - Date.parse(left.submittedAt),
  );
}

export function getApplicantLabel(application: AdminContributorApplication) {
  if (application.learnerUsername?.trim()) {
    return application.learnerUsername;
  }

  return "Unknown learner";
}

export function validateRejectionReason(reason: string) {
  if (!reason.trim()) {
    return "A rejection reason is required.";
  }

  return null;
}

export function toFriendlyAdminContributorApplicationError(message: string) {
  if (message.includes("400")) {
    return "Invalid request. Please review the application data and try again.";
  }

  if (message.includes("403")) {
    return "You are not allowed to perform this moderation action.";
  }

  if (message.includes("404")) {
    return "This contributor application was not found.";
  }

  if (message.includes("409")) {
    return "This application was already reviewed. Refresh the queue to continue.";
  }

  return message;
}
