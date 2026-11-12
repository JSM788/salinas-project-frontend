"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, errorText } from "@/shared/api/client";
import { authApi } from "@/shared/api/services";
import { LoadingIndicator } from "@/shared/components/ui/loading-indicator";
import { APP_CONSTANTS } from "@/config/constants";
import { APP_ROUTES } from "@/config/routes";
import {
  canAccessRoute,
  canAccessWeb,
  isPlatformOwner,
  landingRoute,
} from "@/shared/api/platform";
import {
  roleLabels,
  Session,
} from "@/shared/api/contracts";

export interface UserProfile {
  username: string;
  name: string;
  role:
    | "Comercial"
    | "Mercaderista"
    | "Gerencia"
    | "Propietario"
    | "Finanzas"
    | "Operaciones Comerciales";
  email: string;
  initials: string;
  defaultRoute: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pathname = usePathname(),
    router = useRouter();
  const restore = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const identity = await authApi.me();
      setSession(canAccessWeb(identity) ? identity : null);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.code === "web_access_denied")) setSession(null);
      else setError(errorText(error));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void restore();
  }, [restore]);
  useEffect(() => {
    const expire = () => {
      setSession(null);
      setError("");
    };
    window.addEventListener(APP_CONSTANTS.HTTP.SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(APP_CONSTANTS.HTTP.SESSION_EXPIRED_EVENT, expire);
  }, []);
  const normalized = pathname?.replace(/\/$/, "") || "/";
  const publicPage = normalized.startsWith(APP_ROUTES.INVITATION_PREFIX);
  useEffect(() => {
    if (isLoading || error || publicPage) return;
    if (!session && normalized !== APP_ROUTES.LOGIN) router.replace(`${APP_ROUTES.LOGIN}/`);
    if (session && (normalized === APP_ROUTES.ROOT || normalized === APP_ROUTES.LOGIN))
      router.replace(landingRoute(session));
  }, [isLoading, error, session, normalized, router, publicPage]);
  const login = async (email: string, password: string) => {
    const identity = await authApi.login(email, password);
    setSession(identity);
    setError("");
    router.replace(landingRoute(identity));
  };
  const logout = async () => {
    setError("");
    try {
      await authApi.logout();
      setSession(null);
      router.replace(`${APP_ROUTES.LOGIN}/`);
    } catch (error) {
      setError(errorText(error));
    }
  };
  const user: UserProfile | null = session
    ? {
        username: session.email,
        name: isPlatformOwner(session)
          ? "Propietario global"
          : roleLabels[session.role],
        role: isPlatformOwner(session)
          ? "Propietario"
          : roleLabels[session.role],
        email: session.email,
        initials: isPlatformOwner(session)
          ? "PG"
          : session.role === "manager"
            ? "GE"
            : session.role === "commercial"
              ? "CO"
              : "ME",
        defaultRoute: landingRoute(session),
      }
    : null;
  let content = children;
  if (isLoading)
    content = <LoadingIndicator fullScreen label="Verificando sesión…" />;
  else if (error)
    content = (
      <div className="p-8 space-y-3">
        <p role="alert">{error}</p>
        <button onClick={() => void restore()} className="underline">
          Reintentar conexión
        </button>
      </div>
    );
  else if (!session && normalized !== "/login")
    content = <LoadingIndicator fullScreen label="Abriendo el acceso…" />;
  else if (session && (normalized === "/" || normalized === "/login"))
    content = <LoadingIndicator fullScreen label="Abriendo tu inicio…" />;
  else if (session && !canAccessRoute(session, normalized))
    content = (
      <div className="p-8 space-y-3">
        <p>Esta sección no está disponible para tu cuenta.</p>
        <button
          onClick={() => router.replace(landingRoute(session))}
          className="underline"
        >
          Ir a mi inicio
        </button>
      </div>
    );
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session),
        user,
        session,
        login,
        logout,
        isLoading,
      }}
    >
      {publicPage ? children : content}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
