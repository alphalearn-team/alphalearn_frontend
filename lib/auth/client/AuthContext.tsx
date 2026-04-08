"use client";

import type React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";
import { fetchMyProfile, type UserProfile } from "@/lib/utils/profile";
import { getUserRoleAction } from "../server/actions";

export type UserRole = "ADMIN" | "CONTRIBUTOR" | "LEARNER" | null;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userRole: UserRole;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<UserRole>;
  refreshProfile: () => Promise<UserProfile | null>;
};

const defaultAuthContextValue: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  userRole: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUserRole: async () => null,
  refreshProfile: async () => null,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user role from backend via Server Action
  const fetchUserRole = async (): Promise<UserRole> => {
    try {
      const result = await getUserRoleAction();

      if (result.success && result.role) {
        setUserRole(result.role);
        return result.role;
      } else {
        setUserRole(null);
        return null;
      }
    } catch {
      setUserRole(null);
      return null;
    }
  };

  const refreshProfile = async (accessToken?: string | null): Promise<UserProfile | null> => {
    const token = accessToken ?? session?.access_token;

    if (!token) {
      setProfile(null);
      return null;
    }

    try {
      const nextProfile = await fetchMyProfile(token);
      setProfile(nextProfile);
      return nextProfile;
    } catch {
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {

    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (!error) {
        setSession(data.session);
        setUser(data.session?.user || null);

        // Fetch role if user is authenticated
        if (data.session?.user) {
          await Promise.all([
            fetchUserRole(),
            refreshProfile(data.session.access_token),
          ]);
        } else {
          setProfile(null);
        }
      }

      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        // Fetch role when auth state changes
        if (session?.user) {
          await Promise.all([
            fetchUserRole(),
            refreshProfile(session.access_token),
          ]);
        } else {
          setUserRole(null);
          setProfile(null);
        }

        setIsLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // refreshProfile is always called with an explicit token here, so no stale closure risk.
    // The effect must only run on mount to avoid registering duplicate auth listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      setSession(data.session);
      await fetchUserRole();

      showSuccess("Logged in successfully!");
      // Layouts handle role-based routing (admin → /admin, etc.)
      router.push("/");
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Failed to log in"));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
      const callbackUrl = configuredSiteUrl
        ? `${configuredSiteUrl.replace(/\/$/, "")}/auth/callback`
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        ...(callbackUrl ? { options: { redirectTo: callbackUrl } } : {}),
      })

      if (error) throw error;
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Failed to sign in with Google"));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      showSuccess("Account created! Please check your email.");
      router.push("/signin");
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Failed to sign up"));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      showSuccess("Logged out successfully!");
      router.push("/signin");
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Failed to log out"));
    }
  };

  const value = {
    user,
    session,
    profile,
    userRole,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUserRole: fetchUserRole,
    refreshProfile: () => refreshProfile(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
