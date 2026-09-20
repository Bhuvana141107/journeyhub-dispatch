import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Settings, MapPin, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RIDE-X — Smart Dispatch For Every Journey" },
      {
        name: "description",
        content:
          "RIDE-X matches riders with nearby drivers in real time using a live dispatch queue, dynamic pricing and instant cancellation.",
      },
      { property: "og:title", content: "RIDE-X — Smart Dispatch For Every Journey" },
      {
        property: "og:description",
        content:
          "Find your ride. Get matched. Move smarter. RIDE-X is a real-time smart mobility dispatch platform.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const a = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    a.hydrate();
  }, [a]);

  const start = () => {
    if (a.session?.role === "rider") navigate({ to: "/ride" });
    else navigate({ to: "/auth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            color: "var(--color-border)",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center px-5">
        <span className="text-lg font-bold tracking-[0.3em]">RIDE-X</span>
        <Link
          to="/control"
          className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs tracking-wide text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" />
          Operations
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-10 lg:pt-20">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Network live
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            RIDE-X
          </h1>
          <p className="mt-4 text-xl font-semibold uppercase tracking-[0.18em] text-primary sm:text-2xl">
            Smart dispatch for every journey
          </p>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Find your ride. Get matched. Move smarter.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" className="h-12 px-7 text-sm tracking-wide" onClick={start}>
              START A JOURNEY <ArrowRight className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Bikes · Autos · Cabs · Premium · Parcel
            </span>
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "Matched near you",
              body: "The closest free captain of your chosen class takes the trip.",
            },
            {
              icon: Zap,
              title: "Live dispatch",
              body: "Requests join a real-time queue and move in strict order.",
            },
            {
              icon: ShieldCheck,
              title: "Fair, upfront fares",
              body: "Distance and live demand shape the price before you confirm.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/50"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
