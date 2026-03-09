"use client";

import AuthFormPanel from "./_components/AuthFormPanel";
import SignInShell from "./_components/SignInShell";
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
    <SignInShell isSignUp={isSignUp}>
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
    </SignInShell>
  );
}
