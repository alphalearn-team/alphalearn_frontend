"use client";

import { Alert } from "@mantine/core";

interface ContributorApplicationAlertsProps {
  loadError: string | null;
  submitError: string | null;
  successMessage: string | null;
}

export default function ContributorApplicationAlerts({
  loadError,
  submitError,
  successMessage,
}: ContributorApplicationAlertsProps) {
  return (
    <>
      {loadError && (
        <Alert color="yellow" radius="lg" title="Couldn't load your application history">
          {loadError}
        </Alert>
      )}

      {submitError && (
        <Alert color="red" radius="lg" title="Application not submitted">
          {submitError}
        </Alert>
      )}

      {successMessage && (
        <Alert color="green" radius="lg" title="Application submitted">
          {successMessage}
        </Alert>
      )}
    </>
  );
}
