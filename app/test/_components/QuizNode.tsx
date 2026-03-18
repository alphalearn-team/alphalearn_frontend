import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Burger, Paper, Text, Group, Box, Badge } from "@mantine/core";

export function QuizNode(props: NodeProps) {
  const onBurgerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Burger clicked on Quiz Node:", props.data.quizPublicId);
  };

  return (
    <Paper 
      shadow="md" 
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
      <Handle type="target" position={Position.Top} style={{ background: 'var(--color-success)' }} id={`quiz-target-${props.id}`}/>
      
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box>
          <Text fw={700} size="lg" style={{ color: "var(--color-success)" }}>Quiz</Text>
          <Text size="xs" c="dimmed" mt={4} mb={8}>
            ID: {String(props.data.quizPublicId).substring(0, 8)}...
          </Text>
          <Badge 
            variant="light" 
            size="sm"
            style={{ 
              backgroundColor: "rgba(16, 185, 129, 0.2)", 
              color: "var(--color-success)" 
            }}
          >
            {props.data.questionsCount as number} Questions
          </Badge>
        </Box>

        <Burger 
          opened={false} 
          onClick={onBurgerClick} 
          size="sm" 
          color="var(--color-text-muted)"
          aria-label="Toggle navigation" 
        />
      </Group>

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--color-success)' }} id={`quiz-source-${props.id}`}/>
    </Paper>
  );
}
