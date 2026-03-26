import { Container, Stack, Text, Title } from "@mantine/core";
import MySquadClient from "./_components/MySquadClient";

export default function MySquadPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="bg-[var(--color-background)] pb-8 pt-8">
        <Container size="lg">
          <Stack gap="xs">
            <Title
              order={1}
              className="text-4xl font-black tracking-tight text-[var(--color-text)]"
            >
              My <span className="text-[var(--color-primary)]">Squad</span>
            </Title>

            <Text className="max-w-2xl text-[var(--color-text-secondary)]">
              See everyone in your friends list and keep your AlphaLearn crew close.
            </Text>
          </Stack>
        </Container>
      </div>

      <Container size="lg" className="pb-32">
        <MySquadClient />
      </Container>
    </div>
  );
}
