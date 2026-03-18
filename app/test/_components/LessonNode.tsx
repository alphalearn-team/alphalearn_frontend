import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Burger, Paper, Text, Group, Box } from "@mantine/core";

export function LessonNode(props: NodeProps) {
  const onBurgerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Burger clicked on Lesson Node:", props.data.lessonPublicId);
  };

  return (
    <Paper 
      p="sm" 
      radius="md" 
      withBorder 
      style={{ 
        width: 250, 
        borderColor: "var(--color-primary)", 
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)" 
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--color-primary)' }} id={`lesson-target-${props.id}`}/>
      
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box>
          <Text fw={700} size="lg" style={{ color: "var(--color-primary)" }}>Lesson</Text>
          <Text size="xs" c="dimmed" mt={4}>
            ID: {String(props.data.lessonPublicId).substring(0, 8)}...
          </Text>
        </Box>

        <Burger 
          opened={false} 
          onClick={onBurgerClick} 
          size="sm" 
          color="var(--color-text-muted)"
          aria-label="Toggle navigation" 
        />
      </Group>

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--color-primary)' }} id={`lesson-source-${props.id}`}/>
    </Paper>
  );
}
