"use client";

import Link from "next/link";
import { Alert, Container, Skeleton, Text } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { useAuth } from "@/lib/auth/client/AuthContext";
import ProfileSquadSection from "./ProfileSquadSection";

function SquadPageSkeleton() {
  return (
    <Container size="lg" className="py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-3 border-b border-white/10 pb-8">
          <Skeleton height={12} width={90} radius="xl" />
          <Skeleton height={42} width={260} radius="xl" />
          <Skeleton height={18} width="60%" radius="xl" />
        </div>

        <div className="mt-10 space-y-6">
          <Skeleton height={180} radius="xl" />
          <Skeleton height={240} radius="xl" />
          <Skeleton height={220} radius="xl" />
        </div>
      </div>
    </Container>
  );
}

export default function ProfileSquadPageClient() {
  const { isLoading, profile, refreshProfile, session } = useAuth();
  const accessToken = session?.access_token ?? null;

  if (isLoading) {
    return <SquadPageSkeleton />;
  }

  if (!accessToken) {
    return (
      <Container size="lg" className="py-8 lg:py-10">
        <div className="mx-auto max-w-4xl border-b border-white/10 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Squad
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Squad unavailable
          </h1>
          <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            Your session could not be loaded. Refresh and try again.
          </Text>
        </div>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container size="lg" className="py-8 lg:py-10">
        <div className="mx-auto max-w-4xl">
          <Alert color="red" radius="lg" variant="light" title="Profile unavailable">
            We could not load your profile details for the squad page.
          </Alert>

          <div className="mt-6 flex flex-wrap gap-3">
            <CommonButton
              onClick={() => {
                void refreshProfile();
              }}
            >
              Retry
            </CommonButton>

            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <section className="border-b border-white/10 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Squad
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-tight text-[var(--color-text)]">
                My Squad
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Manage friends, handle friend requests, and discover more learners to add to your
                learning circle.
              </p>
            </div>

            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-white/10"
            >
              Back to Profile
            </Link>
          </div>
        </section>

        <ProfileSquadSection
          accessToken={accessToken}
          currentUserPublicId={profile.publicId}
          currentUsername={profile.username}
        />
      </div>
    </Container>
  );
}
