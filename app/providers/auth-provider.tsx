"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type RememberedAccount = {
  email: string;
  displayName?: string;
  provider?: "google" | "apple" | "password";
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signInWithProvider: (
    provider: string,
    forceAccountSelect?: boolean,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getRememberedAccounts(): RememberedAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("landlord_known_accounts");
    return raw ? (JSON.parse(raw) as RememberedAccount[]) : [];
  } catch {
    return [];
  }
}

function saveRememberedAccount(account: RememberedAccount) {
  if (typeof window === "undefined") return;
  try {
    const current = getRememberedAccounts();
    const normalized = current.filter((item) => item.email !== account.email);
    const next = [account, ...normalized].slice(0, 5);
    window.localStorage.setItem(
      "landlord_known_accounts",
      JSON.stringify(next),
    );
  } catch {
    return;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.email) {
        saveRememberedAccount({
          email: session.user.email,
          displayName: session.user.user_metadata?.display_name as
            | string
            | undefined,
          provider: undefined,
        });
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        saveRememberedAccount({
          email: session.user.email,
          displayName: session.user.user_metadata?.display_name as
            | string
            | undefined,
          provider: undefined,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }, // stored in user_metadata
      },
    });

    if (!error) {
      saveRememberedAccount({
        email,
        displayName,
        provider: "password",
      });
    }

    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      saveRememberedAccount({
        email,
        provider: "password",
      });
    }

    return { error: error?.message ?? null };
  };

  const signInWithProvider = async (
    provider: string,
    forceAccountSelect: boolean = false,
  ) => {
    // Build OAuth options
    const options: any = {};

    // For Google, add prompt=select_account to force account chooser
    if (provider === "google" && forceAccountSelect) {
      options.queryParams = {
        prompt: "select_account",
      };
    }

    // For Apple, you might want to add similar parameters if needed
    // Apple uses 'prompt=login' to force re-authentication
    if (provider === "apple" && forceAccountSelect) {
      options.queryParams = {
        prompt: "login",
      };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options,
    });

    // If the client SDK returns a URL, navigate to it (some runtimes do this)
    if (data?.url) {
      window.location.href = data.url;
      return { error: null };
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
