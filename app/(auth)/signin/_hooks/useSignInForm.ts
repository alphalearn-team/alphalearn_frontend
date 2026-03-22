"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/lib/auth/client/AuthContext";

export function useSignInForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, signIn, signInWithGoogle, signUp } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSignUp) {
      await signUp(email, password);
      return;
    }

    await signIn(email, password);
  };

  return {
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
    toggleMode: () => setIsSignUp((value) => !value),
  };
}
