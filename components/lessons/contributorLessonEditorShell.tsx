import { Container, Stack, Text, Title } from "@mantine/core";

interface ContributorLessonEditorShellProps {
  breadcrumbs?: React.ReactNode;
  headerMeta?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  titleMeta?: React.ReactNode;
  children: React.ReactNode;
}

export default function ContributorLessonEditorShell({
  breadcrumbs,
  headerMeta,
  title,
  description,
  titleMeta,
  children,
}: ContributorLessonEditorShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Container size="md" className="py-10">
          <Stack gap="md">
            {breadcrumbs}
            {headerMeta}

            <Stack gap={4}>
              <Title
                order={1}
                className="text-3xl font-black tracking-tight text-[var(--color-text)]"
              >
                {title}
              </Title>

              <Text className="text-[var(--color-text-secondary)] max-w-lg font-light leading-relaxed">
                {description}
              </Text>

              {titleMeta}
            </Stack>
          </Stack>
        </Container>
      </div>

      <Container size="md" className="py-10 pb-32">
        {children}
      </Container>
    </div>
  );
}
