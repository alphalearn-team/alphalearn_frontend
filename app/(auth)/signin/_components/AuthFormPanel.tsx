"use client";

import type { FormEvent } from "react";

interface AuthFormPanelProps {
  email: string;
  isLoading: boolean;
  isSignUp: boolean;
  onEmailChange: (value: string) => void;
  onGoogleSignIn: () => Promise<void>;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleMode: () => void;
  onTogglePassword: () => void;
  password: string;
  showPassword: boolean;
}

export default function AuthFormPanel({
  email,
  isLoading,
  isSignUp,
  onEmailChange,
  onGoogleSignIn,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onTogglePassword,
  password,
  showPassword,
}: AuthFormPanelProps) {
  return (
    <div className="flex-1 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
      <div className="mb-8">
        <h1 className="text-4xl text-center font-black tracking-tight leading-tight mb-2 text-[var(--color-text)]">
          {isSignUp ? "Level Up Your Lore!" : "Welcome Back!"}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-center text-lg font-normal">
          {isSignUp ? "Master the memes. Decode the slang." : "Ready to continue your streak?"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="Enter your username or email"
              className="w-full rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-transparent transition-all h-12 pl-11 pr-4 text-base"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-[20px]">
              mail
            </span>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:border-transparent transition-all h-12 pl-11 pr-12 text-base"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-[20px]">
              lock
            </span>
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-0 top-0 h-full px-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {!isSignUp && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-none bg-[var(--color-input)] text-[var(--color-primary)] focus:ring-offset-[var(--color-background)] focus:ring-[var(--color-primary)] size-4 group-hover:bg-[var(--color-overlay)] transition-colors"
              />
              <span className="text-[var(--color-text)] text-sm">Stay logged in</span>
            </label>
            <a
              href="#"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-surface)] text-base font-bold tracking-[0.015em] transition-all duration-200 shadow-[0_0_20px_var(--color-shadow)] hover:shadow-[0_0_30px_var(--color-shadow-hover)] transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {isLoading ? "Please wait..." : isSignUp ? "Join the Squad" : "Resume Streak"}
        </button>
      </form>

      <div className="relative flex items-center gap-2 mt-6 mb-6">
        <div className="h-px bg-[var(--color-border)] flex-1" />
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
          {isSignUp ? "Or create account" : "Or continue with"}
        </p>
        <div className="h-px bg-[var(--color-border)] flex-1" />
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <button
          type="button"
          onClick={() => onGoogleSignIn()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text)] font-bold cursor-pointer"
          title="Sign in with Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="hidden sm:inline">Google</span>
        </button>
      </div>

      <div className="text-center mb-2">
        <p className="text-[var(--color-text-secondary)]">
          {isSignUp ? "Already have an account?" : "New here?"}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-[var(--color-primary)] hover:text-[var(--color-text)] font-bold ml-1 transition-colors hover:underline"
          >
            {isSignUp ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>

      {isSignUp && (
        <p className="text-xs text-center text-[var(--color-text-muted)]">
          By joining, you agree to our
          <br />
          Terms of Service (no cap).
        </p>
      )}
    </div>
  );
}
