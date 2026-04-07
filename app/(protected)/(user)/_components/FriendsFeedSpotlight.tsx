import Link from "next/link";
import { Card, Stack, Text } from "@mantine/core";

export default function FriendsFeedSpotlight() {
  return (
    <Card
      radius="28px"
      padding="xl"
      className="border border-[#2d5c50] bg-[radial-gradient(circle_at_80%_0%,rgba(25,240,194,0.18),transparent_48%),linear-gradient(165deg,#1a1f1d,#121212)]"
    >
      <Stack gap="md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#19f0c2]">
          Friends feed
        </p>
        <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-tight text-[var(--color-text)]">
          See what your friends are posting this week
        </h2>
        <Text size="sm" className="max-w-3xl leading-relaxed text-[var(--color-text-secondary)]">
          Jump into the social stream to watch submissions, open media in full screen, and pick up ideas before you post your own challenge.
        </Text>

        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/friends-feed"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#19f0c2]/40 bg-[#19f0c2] px-5 text-sm font-semibold text-[#102019] transition-colors hover:bg-[#40f3cf]"
          >
            Open friends feed
          </Link>
          <Link
            href="/weekly-quest"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/20 bg-black/25 px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-black/40"
          >
            Create your post
          </Link>
        </div>
      </Stack>
    </Card>
  );
}
