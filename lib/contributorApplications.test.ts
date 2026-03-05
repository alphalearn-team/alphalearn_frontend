import assert from "node:assert/strict";
import test from "node:test";
import type { ContributorApplication } from "@/interfaces/interfaces";
import {
  getContributorApplicationViewState,
  mergeContributorApplication,
  resolveContributorApplicationsAfterConflict,
  shouldRefreshRoleAfterApproval,
} from "./contributorApplications";

function makeApplication(
  overrides: Partial<ContributorApplication> = {},
): ContributorApplication {
  return {
    publicId: "app-1",
    learnerPublicId: "learner-1",
    learnerUsername: "learner-one",
    status: "PENDING",
    submittedAt: "2026-01-01T00:00:00.000Z",
    reviewedAt: null,
    rejectionReason: null,
    ...overrides,
  };
}

test("no application state allows learner to apply", () => {
  const state = getContributorApplicationViewState([], "LEARNER");

  assert.equal(state.latestApplication, null);
  assert.equal(state.canApply, true);
  assert.equal(state.statusLabel, "Not Submitted");
});

test("pending state disables submit action", () => {
  const applications = [
    makeApplication({
      status: "PENDING",
      publicId: "pending-1",
      submittedAt: "2026-01-02T00:00:00.000Z",
    }),
  ];

  const state = getContributorApplicationViewState(applications, "LEARNER");

  assert.equal(state.latestApplication?.publicId, "pending-1");
  assert.equal(state.canApply, false);
  assert.equal(state.statusLabel, "Application under review");
});

test("approved state for learner is treated as historical and allows re-application", () => {
  const applications = [
    makeApplication({
      status: "APPROVED",
      publicId: "approved-1",
      reviewedAt: "2026-01-03T00:00:00.000Z",
    }),
  ];

  const state = getContributorApplicationViewState(applications, "LEARNER");

  assert.equal(state.latestApplication?.publicId, "approved-1");
  assert.equal(state.canApply, true);
  assert.equal(state.statusLabel, "Approved (History)");
});

test("rejected state shows rejection reason and allows re-application", () => {
  const applications = [
    makeApplication({
      status: "REJECTED",
      publicId: "rejected-1",
      reviewedAt: "2026-01-03T00:00:00.000Z",
      rejectionReason: "Please complete more lessons before applying again.",
    }),
  ];

  const state = getContributorApplicationViewState(applications, "LEARNER");

  assert.equal(state.latestApplication?.status, "REJECTED");
  assert.equal(state.showRejectionReason, true);
  assert.equal(state.canApply, true);
});

test("successful submit flow puts new pending application first", () => {
  const olderRejected = makeApplication({
    publicId: "rejected-older",
    status: "REJECTED",
    submittedAt: "2026-01-01T00:00:00.000Z",
    reviewedAt: "2026-01-02T00:00:00.000Z",
    rejectionReason: "Try again later.",
  });

  const newlySubmitted = makeApplication({
    publicId: "pending-new",
    status: "PENDING",
    submittedAt: "2026-02-01T00:00:00.000Z",
  });

  const nextApplications = mergeContributorApplication(
    [olderRejected],
    newlySubmitted,
  );
  const state = getContributorApplicationViewState(nextApplications, "LEARNER");

  assert.equal(nextApplications[0]?.publicId, "pending-new");
  assert.equal(state.latestApplication?.status, "PENDING");
  assert.equal(state.canApply, false);
});

test("conflict/error flow preserves known state when refreshed data is unavailable", () => {
  const knownPending = makeApplication({
    publicId: "pending-locked",
    status: "PENDING",
    submittedAt: "2026-02-02T00:00:00.000Z",
  });

  const resolved = resolveContributorApplicationsAfterConflict(
    [knownPending],
    [],
  );

  assert.equal(resolved.length, 1);
  assert.equal(resolved[0]?.publicId, "pending-locked");
  assert.equal(resolved[0]?.status, "PENDING");
});

test("role refresh helper only requests refresh for newly approved learners", () => {
  const approved = makeApplication({
    status: "APPROVED",
    publicId: "approved-refresh",
  });

  assert.equal(shouldRefreshRoleAfterApproval("LEARNER", approved, false), true);
  assert.equal(shouldRefreshRoleAfterApproval("LEARNER", approved, true), false);
  assert.equal(shouldRefreshRoleAfterApproval("CONTRIBUTOR", approved, false), false);
  assert.equal(shouldRefreshRoleAfterApproval("LEARNER", null, false), false);
});
