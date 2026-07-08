import { supabaseClient } from "@/lib/supabaseClient";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

interface CustomerAuthContextType {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  signUp: (input: { fullName: string; phone?: string; email: string; password: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signUp(input: { fullName: string; phone?: string; email: string; password: string }) {
    const { error } = await supabaseClient.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          phone: input.phone ?? null,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Atualiza perfil via API para garantir consistência com a tabela `customer_profiles`
    // (mesmo se o trigger criar a linha vazia).
    const nextSession = (await supabaseClient.auth.getSession()).data.session;
    const token = nextSession?.access_token;
    if (token) {
      await fetch("/api/customers/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: input.fullName, phone: input.phone ?? "" }),
      });
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  }

  const value = useMemo(
    () => ({
      isLoading,
      session,
      user,
      signUp,
      signIn,
      signOut,
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

