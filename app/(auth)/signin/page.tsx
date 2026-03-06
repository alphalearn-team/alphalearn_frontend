"use client";

import AuthFormPanel from "./_components/AuthFormPanel";
import SignUpBenefitsPanel from "./_components/SignUpBenefitsPanel";
import { useSignInForm } from "./_hooks/useSignInForm";

export default function SignInPage() {
  const {
    email,
    handleSubmit,
    isLoading,
    isSignUp,
    password,
    setEmail,
    setPassword,
    setShowPassword,
    showPassword,
    signInWithGoogle,
    toggleMode,
  } = useSignInForm();

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-text)] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[var(--color-primary)] selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none" />

      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className={`w-full ${isSignUp ? "lg:max-w-[1100px]" : "lg:max-w-[500px]"} flex flex-col gap-6`}>
          <div className="relative w-full overflow-hidden flex flex-col lg:flex-row">
            <AuthFormPanel
              email={email}
              isLoading={isLoading}
              isSignUp={isSignUp}
              onEmailChange={setEmail}
              onGoogleSignIn={signInWithGoogle}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              onToggleMode={toggleMode}
              onTogglePassword={() => setShowPassword(!showPassword)}
              password={password}
              showPassword={showPassword}
            />

            {isSignUp && <SignUpBenefitsPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}
