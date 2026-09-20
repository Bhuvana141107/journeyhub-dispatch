import { createFileRoute, Link } from "@tanstack/react-router";
import { CarFront, Clock, MapPin, Wallet, ArrowRight } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { useAuth } from "@/components/AuthGuard";
import { VEHICLE_BY_TYPE } from "@/lib/dsa";
import { LiveMap } from "@/components/LiveMap";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ride/")({
  head: () => ({
    meta: [
      { title: "My Journey — RIDE-X" },
      {
        name: "description",
        content:
          "Track your live RIDE-X request, queue position, fare and matched driver in real time.",
      },
      { property: "og:title", content: "My Journey — RIDE-X" },
      {
        property: "og:description",
        content: "Track your live RIDE-X request, queue position, fare and matched driver.",
      },
    ],
  }),
  component: MyJourney,
});

function MyJourney() {
  const sim = useSimulation();
  const a = useAuth();

  /** Reads the REAL doubly linked list — same nodes Operations dispatches. */
  const waiting = sim.rides;
  const mine = waiting.filter((r) => r.riderName === sim.profile.name);
  const active = mine[0] ?? null;
  const position = active ? waiting.findIndex((r) => r.rideId === active.rideId) + 1 : 0;
  const lastCompleted = sim.history[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">My Journey</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Hi {a.session?.name ?? sim.profile.name} 👋
          </h1>
        </div>
        <Button asChild className="ml-auto">
          <Link to="/ride/book">
            Book a ride <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {active ? (
        <section className="rounded-2xl border border-primary/40 bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
              {active.status}
            </span>
            <span className="font-mono text-sm font-semibold">{active.rideId}</span>
            <span className="text-sm text-muted-foreground">
              {VEHICLE_BY_TYPE[active.vehicleType].emoji} {active.vehicleType}
            </span>
            <span className="ml-auto flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Queue position <strong>#{position}</strong> of {waiting.length}
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-sm">
                <MapPin className="h-3.5 w-3.5 text-success" />({active.pickup.x},{" "}
                {active.pickup.y})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-sm">
                <MapPin className="h-3.5 w-3.5 text-destructive" />({active.drop.x},{" "}
                {active.drop.y})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fare · {active.distance} units</p>
              <p className="mt-1 font-mono text-sm font-semibold">₹{active.fare.toFixed(2)}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <CarFront className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No ride in progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set a pickup and destination to join the live dispatch queue.
          </p>
          <Button asChild className="mt-5">
            <Link to="/ride/book">Book a ride</Link>
          </Button>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Rides in queue now" value={waiting.length} />
        <StatTile label="Drivers available" value={sim.availableCount} />
        <StatTile
          label="Last trip"
          value={lastCompleted ? `₹${lastCompleted.fare.toFixed(2)}` : "—"}
          icon={Wallet}
        />
      </div>

      <section className="card-elevated rounded-2xl p-4 lg:p-5">
        <h2 className="mb-4 text-sm font-semibold">Drivers near you</h2>
        <LiveMap drivers={sim.drivers} rides={sim.rides} height="aspect-[16/7]" />
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon = CarFront,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
