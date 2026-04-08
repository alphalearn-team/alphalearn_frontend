"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import { useQuizState } from "./useQuizState";
import QuestionTypeSidebar from "./sidebar/QuestionTypeSidebar";
import DraggableTileOverlay from "./sidebar/DraggableTileOverlay";
import SaveQuizModal from "./SaveQuizModal";
import MobileDrawer from "./sidebar/MobileDrawer";
import Canvas from "./Canvas";
import GlowButton from "../../../../../../components/GlowButton";
import type { Question } from "./types";

interface QuizBuilderProps {
  initialQuestions?: Question[];
  quizPublicId?: string;
  lessonPublicId?: string;
}

export default function QuizBuilder({ initialQuestions, quizPublicId, lessonPublicId }: QuizBuilderProps) {
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useQuizState(initialQuestions);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <GlowButton
          onClick={() => setSaveModalOpen(true)}
          size="sm"
          icon="save"
        >
          Save Quiz
        </GlowButton>
      </div>

      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <div className="hidden md:block">
            <QuestionTypeSidebar />
          </div>
          <Canvas
            questions={questions}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
          />
        </div>

        <DraggableTileOverlay />
      </DragDropProvider>

      {/* Mobile Add Button (FAB) */}
      <div className="md:hidden" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "var(--color-background)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(46,255,180,0.3)",
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28, fontWeight: "bold" }}>add</span>
        </button>
      </div>

      {/* Mobile Addition Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={(type) => {
          addQuestion(type);
        }}
      />

      {/* Save Quiz Modal */}
      <SaveQuizModal
        opened={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        questions={questions}
        quizPublicId={quizPublicId}
        initialLessonPublicId={lessonPublicId}
      />
    </div>
  );
}
