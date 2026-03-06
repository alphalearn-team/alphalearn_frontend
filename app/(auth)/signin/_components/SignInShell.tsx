import type { ReactNode } from "react";

interface SignInShellProps {
  isSignUp: boolean;
  children: ReactNode;
}

export default function SignInShell({ isSignUp, children }: SignInShellProps) {
  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-text)] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[var(--color-primary)] selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none" />

      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div
          className={`w-full ${isSignUp ? "lg:max-w-[1100px]" : "lg:max-w-[500px]"} flex flex-col gap-6`}
        >
          <div className="relative w-full overflow-hidden flex flex-col lg:flex-row">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
