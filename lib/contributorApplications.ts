import type {
  ContributorApplication,
  ContributorApplicationStatus,
} from "@/interfaces/interfaces";

export type ContributorApplicationRole = "LEARNER" | "CONTRIBUTOR" | null;

export type ContributorApplicationViewState = {
  latestApplication: ContributorApplication | null;
  canApply: boolean;
  badgeColor: "gray" | "blue" | "green" | "red";
  statusLabel: string;
  title: string;
  description: string;
  showRejectionReason: boolean;
};

function byNewestSubmission(
  left: ContributorApplication,
  right: ContributorApplication,
) {
  return Date.parse(right.submittedAt) - Date.parse(left.submittedAt);
}

export function sortContributorApplications(
  applications: ContributorApplication[],
): ContributorApplication[] {
  return [...applications].sort(byNewestSubmission);
}

export function getLatestContributorApplication(
  applications: ContributorApplication[],
): ContributorApplication | null {
  if (applications.length === 0) {
    return null;
  }

  return sortContributorApplications(applications)[0] ?? null;
}

export function mergeContributorApplication(
  currentApplications: ContributorApplication[],
  nextApplication: ContributorApplication,
): ContributorApplication[] {
  const remainingApplications = currentApplications.filter(
    (application) => application.publicId !== nextApplication.publicId,
  );

  return sortContributorApplications([
    nextApplication,
    ...remainingApplications,
  ]);
}

export function resolveContributorApplicationsAfterConflict(
  currentApplications: ContributorApplication[],
  refreshedApplications: ContributorApplication[] | null | undefined,
): ContributorApplication[] {
  if (!refreshedApplications || refreshedApplications.length === 0) {
    return sortContributorApplications(currentApplications);
  }

  return sortContributorApplications(refreshedApplications);
}

function buildNoApplicationState(): ContributorApplicationViewState {
  return {
    latestApplication: null,
    canApply: true,
    badgeColor: "gray",
    statusLabel: "Not Submitted",
    title: "Apply to become a contributor",
    description:
      "Submit an application to request contributor access and unlock lesson creation workflows.",
    showRejectionReason: false,
  };
}

function buildContributorState(
  latestApplication: ContributorApplication | null,
): ContributorApplicationViewState {
  if (latestApplication?.status === "APPROVED") {
    return {
      latestApplication,
      canApply: false,
      badgeColor: "green",
      statusLabel: "Approved",
      title: "Contributor access approved",
      description:
        "Your contributor application was approved. You already have contributor access.",
      showRejectionReason: false,
    };
  }

  return {
    latestApplication,
    canApply: false,
    badgeColor: "green",
    statusLabel: "Contributor",
    title: "Contributor access enabled",
    description:
      "Your account already has contributor access, so no additional application is needed.",
    showRejectionReason: false,
  };
}

function buildLearnerState(
  latestApplication: ContributorApplication,
): ContributorApplicationViewState {
  switch (latestApplication.status) {
    case "PENDING":
      return {
        latestApplication,
        canApply: false,
        badgeColor: "blue",
        statusLabel: "Pending Review",
        title: "Application pending",
        description:
          "Your contributor application is currently under review. You cannot submit another one until it is reviewed.",
        showRejectionReason: false,
      };
    case "APPROVED":
      return {
        latestApplication,
        canApply: false,
        badgeColor: "green",
        statusLabel: "Approved",
        title: "Application approved",
        description:
          "Your contributor application was approved. Contributor access should already be available on your account.",
        showRejectionReason: false,
      };
    case "REJECTED":
      return {
        latestApplication,
        canApply: true,
        badgeColor: "red",
        statusLabel: "Rejected",
        title: "Application rejected",
        description:
          "Your last contributor application was rejected. You can review the feedback below and submit a new application when you are ready.",
        showRejectionReason: Boolean(latestApplication.rejectionReason),
      };
    default: {
      const exhaustiveStatus: never = latestApplication.status;
      throw new Error(`Unsupported contributor application status: ${exhaustiveStatus}`);
    }
  }
}

export function getContributorApplicationViewState(
  applications: ContributorApplication[],
  role: ContributorApplicationRole,
): ContributorApplicationViewState {
  const latestApplication = getLatestContributorApplication(applications);

  if (role === "CONTRIBUTOR") {
    return buildContributorState(latestApplication);
  }

  if (!latestApplication) {
    return buildNoApplicationState();
  }

  return buildLearnerState(latestApplication);
}

export function isConflictMessage(message: string) {
  return message.toLowerCase().includes("already");
}

export function getApplicationTimelineLabel(
  status: ContributorApplicationStatus,
) {
  if (status === "PENDING") {
    return "Awaiting review";
  }

  if (status === "APPROVED") {
    return "Reviewed and approved";
  }

  return "Reviewed and rejected";
}
