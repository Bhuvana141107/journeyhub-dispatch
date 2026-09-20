import { useEffect, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth, type AccountRole } from "@/lib/auth";

/** Re-renders whenever the demo session changes. */
export function useAuth() {
  useSyncExternalStore(auth.subscribe, auth.getVersion, () => 0);
  return auth;
}

/**
 * Client-side route protection. Renders children only when the current
 * session matches the required account type.
 */
export function AuthGuard({
  role,
  redirectTo,
  children,
}: {
  role: AccountRole;
  redirectTo: string;
  children: React.ReactNode;
}) {
  const a = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    auth.hydrate();
  }, []);

  const allowed = a.ready && a.session?.role === role;

  useEffect(() => {
    if (!a.ready) return;
    if (!a.session) {
      navigate({ to: a.justLoggedOut ? "/" : redirectTo, replace: true });
    } else if (a.session.role !== role) {
      navigate({ to: a.session.role === "ops" ? "/ops" : "/ride", replace: true });
    }
  }, [a.ready, a.session, a.justLoggedOut, role, redirectTo, navigate]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Checking access…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
