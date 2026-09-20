import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { auth, DEMO_RIDER } from "@/lib/auth";
import { useAuth } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Welcome back — RIDE-X" },
      {
        name: "description",
        content: "Sign in to RIDE-X to book a ride, track your journey and view your trips.",
      },
      { property: "og:title", content: "Welcome back — RIDE-X" },
      {
        property: "og:description",
        content: "Sign in to RIDE-X to book a ride, track your journey and view your trips.",
      },
    ],
  }),
  component: RiderAuth,
});

function RiderAuth() {
  const a = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "create">("login");

  useEffect(() => {
    auth.hydrate();
  }, []);

  useEffect(() => {
    if (a.ready && a.session) {
      navigate({ to: a.session.role === "ops" ? "/ops" : "/ride", replace: true });
    }
  }, [a.ready, a.session, navigate]);

  const finish = () => {
    toast.success("Welcome to RIDE-X.");
    navigate({ to: "/ride", replace: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") auth.login(identifier, password, "rider");
      else auth.register(identifier, password);
      finish();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in.");
    }
  };

  const demo = () => {
    try {
      auth.login(DEMO_RIDER.identifier, DEMO_RIDER.password, "rider");
      finish();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo login failed.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <Link
        to="/"
        className="absolute left-5 top-6 flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card/80 p-7 shadow-xl backdrop-blur sm:p-9">
        <span className="text-xs font-bold tracking-[0.3em] text-muted-foreground">RIDE-X</span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in and pick up where your journey left off."
            : "A few seconds and your first ride is ready."}
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="identifier">Email / ID</Label>
            <Input
              id="identifier"
              autoComplete="username"
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="submit" className="flex-1">
              {mode === "login" ? "Login" : "Create Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setMode(mode === "login" ? "create" : "login")}
            >
              {mode === "login" ? "Create Account" : "Login instead"}
            </Button>
          </div>
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" className="w-full" onClick={demo}>
          <Sparkles className="h-4 w-4" /> Use Demo Account
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Demo credentials — {DEMO_RIDER.identifier} / {DEMO_RIDER.password}
        </p>
      </div>
    </div>
  );
}
