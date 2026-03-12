import { Drawer } from "@mantine/core";
import { QuestionType, SIDEBAR_TYPES } from "../types";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (type: QuestionType) => void;
}

export default function MobileDrawer({ isOpen, onClose, onAdd }: MobileDrawerProps) {
    return (
        <Drawer
            opened={isOpen}
            onClose={onClose}
            position="bottom"
            title="Add Question"
            size="auto"
            padding="md"
            styles={{
                content: {
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    background: "var(--color-surface)",
                    borderTop: "1px solid var(--color-border)",
                },
                header: {
                    background: "transparent",
                    marginBottom: 8,
                },
                title: {
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "var(--color-text-muted)",
                },
                close: {
                    color: "var(--color-text-muted)",
                }
            }}
        >
            <div style={{ paddingBottom: "24px" }}>
                {SIDEBAR_TYPES.map((t) => (
                    <button
                        key={t.id}
                        onClick={(e) => {
                            e.preventDefault();
                            onAdd(t.id);
                        }}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 16,
                            padding: 16, marginBottom: 12,
                            background: "rgba(156,163,175,0.05)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 12, cursor: "pointer", textAlign: "left",
                            touchAction: "manipulation",
                        }}
                    >
                        <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: "rgba(46,255,180,0.1)", border: "1px solid rgba(46,255,180,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--color-primary)" }}>{t.icon}</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>{t.label}</div>
                            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>{t.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </Drawer>
    );
}
