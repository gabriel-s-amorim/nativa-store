import { mapAuthError } from "@/lib/authErrors";
import { appPath } from "@/lib/appUrl";
import { updateCustomerProfile } from "@/lib/customerApi";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface SignUpResult {
  needsEmailConfirmation: boolean;
}

interface CustomerAuthContextType {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  signUp: (input: {
    fullName: string;
    phone?: string;
    email: string;
    password: string;
  }) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendSignupConfirmation: (email: string) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

async function syncProfileAfterAuth(
  token: string,
  input: { fullName: string; phone?: string },
): Promise<void> {
  try {
    await updateCustomerProfile(token, {
      fullName: input.fullName,
      phone: input.phone ?? "",
    });
  } catch {
    // O GET /me sincroniza metadata depois, se necessário.
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    // Dynamic import do SDK só depois do primeiro paint — não bloqueia LCP.
    void getSupabaseClient()
      .then((supabase) => {
        if (!isMounted) return;

        return supabase.auth.getSession().then(({ data }) => {
          if (!isMounted) return;

          setSession(data.session ?? null);
          setUser(data.session?.user ?? null);

          const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setIsLoading(false);
          });
          unsubscribe = () => sub.subscription.unsubscribe();
        });
      })
      .catch(() => {
        // Sem client (env) ou falha de rede — loja continua como visitante.
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  async function signUp(input: {
    fullName: string;
    phone?: string;
    email: string;
    password: string;
  }): Promise<SignUpResult> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName.trim(),
          phone: input.phone ?? null,
        },
        emailRedirectTo: appPath("/conta"),
      },
    });

    if (error) {
      throw new Error(mapAuthError(error));
    }

    const token = data.session?.access_token;
    if (token) {
      await syncProfileAfterAuth(token, input);
      return { needsEmailConfirmation: false };
    }

    return { needsEmailConfirmation: true };
  }

  async function signIn(email: string, password: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function signOut() {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function resetPassword(email: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: appPath("/redefinir-senha"),
    });

    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function updatePassword(password: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function resendSignupConfirmation(email: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: appPath("/conta"),
      },
    });

    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  const value = useMemo(
    () => ({
      isLoading,
      session,
      user,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      resendSignupConfirmation,
    }),
    [isLoading, session, user],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth deve ser usado dentro de CustomerAuthProvider");
  }
  return context;
}
