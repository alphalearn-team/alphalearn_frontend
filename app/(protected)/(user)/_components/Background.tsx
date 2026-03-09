export default function Background() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                background: `
          radial-gradient(ellipse 70% 50% at 15% 10%, var(--color-glow-1) 0%, transparent 60%),
          radial-gradient(ellipse 55% 40% at 85% 65%, var(--color-glow-2) 0%, transparent 55%),
          radial-gradient(ellipse 45% 55% at 50% 95%, var(--color-glow-3) 0%, transparent 50%)
        `,
            }}
        />
    );
}
