import { mapAuthError } from "@/lib/authErrors";
import { appPath } from "@/lib/appUrl";
import { updateCustomerProfile } from "@/lib/customerApi";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

/** Rotas / hash onde sessão tem de existir logo — sem esperar idle. */
function shouldHydrateAuthEagerly(): boolean {
  if (typeof window === "undefined") return false;

  const path = window.location.pathname;
  if (
    path.startsWith("/entrar") ||
    path.startsWith("/cadastro") ||
    path.startsWith("/conta") ||
    path.startsWith("/recuperar-senha") ||
    path.startsWith("/redefinir-senha") ||
    path.startsWith("/verificar-email") ||
    path.startsWith("/checkout")
  ) {
    return true;
  }

  const hash = window.location.hash;
  return (
    hash.includes("access_token") ||
    hash.includes("refresh_token") ||
    hash.includes("type=recovery") ||
    hash.includes("type=signup") ||
    hash.includes("type=email") ||
    hash.includes("error_code") ||
    hash.includes("error=")
  );
}

/**
 * Adia o bootstrap do SDK até idle, primeira interação, ou timeout.
 * Evita parse/exec do Supabase no caminho crítico da PDP.
 */
function scheduleAuthHydration(start: () => void, timeoutMs = 2000): () => void {
  let finished = false;
  let idleId: number | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const onInteract = () => run();

  const detach = () => {
    if (typeof cancelIdleCallback === "function" && idleId != null) {
      cancelIdleCallback(idleId);
    }
    if (timeoutId != null) clearTimeout(timeoutId);
    window.removeEventListener("pointerdown", onInteract);
    window.removeEventListener("keydown", onInteract);
  };

  const run = () => {
    if (finished) return;
    finished = true;
    detach();
    start();
  };

  if (typeof requestIdleCallback === "function") {
    idleId = requestIdleCallback(() => run(), { timeout: timeoutMs });
  } else {
    timeoutId = setTimeout(run, Math.min(timeoutMs, 1200));
  }

  window.addEventListener("pointerdown", onInteract, { once: true, passive: true });
  window.addEventListener("keydown", onInteract, { once: true });

  return () => {
    finished = true;
    detach();
  };
}

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
  const hydratePromiseRef = useRef<Promise<void> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const hydrateAuth = useCallback(() => {
    if (!hydratePromiseRef.current) {
      hydratePromiseRef.current = (async () => {
        try {
          const supabase = await getSupabaseClient();
          const { data } = await supabase.auth.getSession();
          setSession(data.session ?? null);
          setUser(data.session?.user ?? null);

          const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setIsLoading(false);
          });
          unsubscribeRef.current = () => sub.subscription.unsubscribe();
        } catch {
          // Sem client (env) ou falha de rede — loja continua como visitante.
        } finally {
          setIsLoading(false);
        }
      })();
    }
    return hydratePromiseRef.current;
  }, []);

  useEffect(() => {
    let cancelSchedule: (() => void) | undefined;

    if (shouldHydrateAuthEagerly()) {
      void hydrateAuth();
    } else {
      cancelSchedule = scheduleAuthHydration(() => {
        void hydrateAuth();
      });
    }

    return () => {
      cancelSchedule?.();
      unsubscribeRef.current?.();
    };
  }, [hydrateAuth]);

  async function signUp(input: {
    fullName: string;
    phone?: string;
    email: string;
    password: string;
  }): Promise<SignUpResult> {
    await hydrateAuth();
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
    await hydrateAuth();
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
    await hydrateAuth();
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function resetPassword(email: string) {
    await hydrateAuth();
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: appPath("/redefinir-senha"),
    });

    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function updatePassword(password: string) {
    await hydrateAuth();
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(mapAuthError(error));
    }
  }

  async function resendSignupConfirmation(email: string) {
    await hydrateAuth();
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
