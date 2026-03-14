"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import { useQuizState } from "./hooks/useQuizState";
import QuestionTypeSidebar from "./sidebar/QuestionTypeSidebar";
import DraggableTileOverlay from "./sidebar/DraggableTileOverlay";
import SaveQuizModal from "./modals/SaveQuizModal";
import Canvas from "./canvas/Canvas";
import GradientButton from "../common/GradientButton";

export default function QuizBuilder() {
    const {
        questions,
        updateQuestion,
        deleteQuestion,
        handleDragStart,
        handleDragMove,
        handleDragEnd
    } = useQuizState();

    const [saveModalOpen, setSaveModalOpen] = useState(false);

    return (
        <div style={{ position: "relative", height: "100vh" }}>
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
                <GradientButton
                    onClick={() => setSaveModalOpen(true)}
                    size="sm"
                    icon="save"
                >
                    Save Quiz
                </GradientButton>
            </div>

            <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragMove} onDragEnd={handleDragEnd}>
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

            {/* Save Quiz Modal */}
            <SaveQuizModal
                opened={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                questions={questions}
            />
        </div>
    );
}
