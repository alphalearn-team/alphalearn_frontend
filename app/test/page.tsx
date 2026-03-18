"use client";

import {
  ReactFlow,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import "./test.css";
import { data } from "./data";

// Import the newly created custom nodes
import { LessonNode } from "./_components/LessonNode";
import { QuizNode } from "./_components/QuizNode";

const nodeTypes = {
  lesson: LessonNode,
  quiz: QuizNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Dynamically generate from data.ts
const parsedLessonIds = new Set<string>();

data.forEach((quizData) => {
  // Add unique lesson node
  if (!parsedLessonIds.has(quizData.lessonPublicId)) {
    parsedLessonIds.add(quizData.lessonPublicId);
    initialNodes.push({
      id: quizData.lessonPublicId,
      position: { x: 0, y: 0 },
      type: "lesson",
      data: { lessonPublicId: quizData.lessonPublicId },
    });
  }

  // Add the quiz node
  initialNodes.push({
    id: quizData.quizPublicId,
    position: { x: 0, y: 0 },
    type: "quiz",
    data: { 
      quizPublicId: quizData.quizPublicId, 
      questionsCount: quizData.questions.length 
    },
  });

  // Edge from lesson to quiz
  initialEdges.push({
    id: `${quizData.lessonPublicId}-${quizData.quizPublicId}`,
    source: quizData.lessonPublicId,
    target: quizData.quizPublicId,
    type: "step",
    animated: true,
  });
});

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export default function TestPage() {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    []
  );

  const [nodes, setNodes] = useNodesState(layoutedNodes);
  const [edges, setEdges] = useEdgesState(layoutedEdges);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: any) => {
      console.log("Edge created!", params);
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    },
    [setEdges]
  );

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        nodes={nodes}
        colorMode="dark"
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={"white"}
          nodeStrokeColor={"white"}
          pannable
          zoomable
        />
        <Background color="var(--color-primary)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
