import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Radar, Terminal } from "lucide-react";
import { auth, DEMO_OPS } from "@/lib/auth";
import { useAuth } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/control")({
  head: () => ({
    meta: [
      { title: "Dispatch Control — RIDE-X Operations" },
      {
        name: "description",
        content:
          "Authorized access to the RIDE-X operations center: live queue, fleet control and dispatch tooling.",
      },
      { property: "og:title", content: "Dispatch Control — RIDE-X Operations" },
      {
        property: "og:description",
        content: "Authorized access to the RIDE-X network operations center.",
      },
    ],
  }),
  component: OpsAuth,
});

function OpsAuth() {
  const a = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    auth.hydrate();
  }, []);

  useEffect(() => {
    if (a.ready && a.session) {
      navigate({ to: a.session.role === "ops" ? "/ops" : "/ride", replace: true });
    }
  }, [a.ready, a.session, navigate]);

  const enter = (id: string, pw: string) => {
    try {
      auth.login(id, pw, "ops");
      toast.success("Control center unlocked.");
      navigate({ to: "/ops", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Access denied.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            color: "var(--color-border)",
          }}
        />
        <div className="absolute bottom-0 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <Link
        to="/"
        className="absolute left-5 top-6 flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface/90 p-7 shadow-2xl backdrop-blur sm:p-9">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <Radar className="h-4 w-4 text-primary" /> RIDE-X · Network Operations
        </div>
        <h1 className="mt-5 font-mono text-3xl font-bold tracking-tight">Dispatch Control</h1>
        <p className="mt-2 text-sm text-muted-foreground">Authorized operations access</p>

        <form
          className="mt-7 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            enter(identifier, password);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="ops-id" className="font-mono text-xs uppercase tracking-wider">
              Operations ID
            </Label>
            <Input
              id="ops-id"
              className="font-mono"
              autoComplete="username"
              placeholder="OPS-000"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-pw" className="font-mono text-xs uppercase tracking-wider">
              Password
            </Label>
            <Input
              id="ops-pw"
              className="font-mono"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            <Terminal className="h-4 w-4" /> Enter Control Center
          </Button>
        </form>

        <div className="my-6 h-px bg-border" />

        <Button
          variant="secondary"
          className="w-full font-mono text-xs"
          onClick={() => enter(DEMO_OPS.identifier, DEMO_OPS.password)}
        >
          Demo Login
        </Button>
        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          {DEMO_OPS.identifier} / {DEMO_OPS.password}
        </p>
      </div>
    </div>
  );
}
