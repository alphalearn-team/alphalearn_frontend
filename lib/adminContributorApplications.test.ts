import assert from "node:assert/strict";
import test from "node:test";
import type { AdminContributorApplication } from "@/interfaces/interfaces";
import {
  getApplicantLabel,
  sortPendingContributorApplications,
  toFriendlyAdminContributorApplicationError,
  validateRejectionReason,
} from "./adminContributorApplications";

function makePending(
  overrides: Partial<AdminContributorApplication> = {},
): AdminContributorApplication {
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

test("pending contributor applications are sorted newest first", () => {
  const sorted = sortPendingContributorApplications([
    makePending({ publicId: "older", submittedAt: "2026-01-01T00:00:00.000Z" }),
    makePending({ publicId: "newer", submittedAt: "2026-01-03T00:00:00.000Z" }),
  ]);

  assert.equal(sorted[0]?.publicId, "newer");
  assert.equal(sorted[1]?.publicId, "older");
});

test("applicant label uses learner username with fallback when null", () => {
  assert.equal(getApplicantLabel(makePending({ learnerUsername: "alpha" })), "alpha");
  assert.equal(getApplicantLabel(makePending({ learnerUsername: null })), "Unknown learner");
});

test("reject reason validation requires non-empty input", () => {
  assert.equal(validateRejectionReason("   "), "A rejection reason is required.");
  assert.equal(validateRejectionReason("Needs more lesson quality"), null);
});

test("friendly moderation errors map common 400/403/404/409 responses", () => {
  assert.match(
    toFriendlyAdminContributorApplicationError("Request failed (400 Bad Request)"),
    /Invalid request/,
  );
  assert.match(
    toFriendlyAdminContributorApplicationError("Request failed (403 Forbidden)"),
    /not allowed/,
  );
  assert.match(
    toFriendlyAdminContributorApplicationError("Request failed (404 Not Found)"),
    /not found/,
  );
  assert.match(
    toFriendlyAdminContributorApplicationError("Request failed (409 Conflict)"),
    /already reviewed/,
  );
});
