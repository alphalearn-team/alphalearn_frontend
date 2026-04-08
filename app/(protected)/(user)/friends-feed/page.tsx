import { Container, Stack } from "@mantine/core";
import WeeklyQuestFriendsFeedSection from "../weekly-quest/_components/WeeklyQuestFriendsFeedSection";

export default function FriendsFeedPage() {
  return (
    <div className="min-h-screen">
      <Container size="xl" className="py-6 lg:py-8">
        <Stack gap="xl">
          {/* <Card radius="32px" padding="xl" className="border border-[#2d5c50] bg-[#ffff]"> */}
            <Stack gap="lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  {/* <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#19f0c2]">
                    Friends feed
                  </p>
      */}
        
                </div>
              </div>
            </Stack>
          {/* </Card> */}

          <WeeklyQuestFriendsFeedSection />
        </Stack>
      </Container>
    </div>
  );
}
