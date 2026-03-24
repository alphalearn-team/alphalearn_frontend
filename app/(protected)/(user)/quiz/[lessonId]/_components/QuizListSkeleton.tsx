import { SimpleGrid, Skeleton, Card, Stack, Group } from "@mantine/core";

export default function QuizListSkeleton({ quizzesCount = 3 }: { quizzesCount?: number }) {
  const skeletons = Array.from({ length: quizzesCount });

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {skeletons.map((_, idx) => (
        <Card
          key={idx}
          padding="xl"
          className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative"
          style={{ borderRadius: "0.75rem" }}
        >
          <Stack gap="lg">
            <div>
               <Skeleton height={24} width="30%" mb={8} />
               <Skeleton height={16} width="60%" />
            </div>
            
            <Group justify="flex-end" mt="md">
              <Skeleton height={36} width={100} radius="xl" />
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
