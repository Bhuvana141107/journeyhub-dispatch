import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { VEHICLE_BY_TYPE } from "@/lib/dsa";

export const Route = createFileRoute("/ride/rides")({
  head: () => ({
    meta: [
      { title: "My Rides — RIDE-X" },
      {
        name: "description",
        content: "Every RIDE-X trip you have taken, with fare, distance, vehicle and outcome.",
      },
      { property: "og:title", content: "My Rides — RIDE-X" },
      {
        property: "og:description",
        content: "Every RIDE-X trip you have taken, with fare, distance, vehicle and outcome.",
      },
    ],
  }),
  component: MyRides,
});

function MyRides() {
  const sim = useSimulation();
  const waiting = sim.rides;
  const history = sim.history;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">My Rides</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Trips & requests</h1>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 lg:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-warning" /> Waiting in the dispatch queue
        </h2>
        {waiting.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting right now.</p>
        ) : (
          <ul className="space-y-2">
            {waiting.map((r, i) => (
              <li
                key={r.rideId}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                <span className="font-mono font-semibold">{r.rideId}</span>
                <span>
                  {VEHICLE_BY_TYPE[r.vehicleType].emoji} {r.vehicleType}
                </span>
                <span className="text-muted-foreground">{r.riderName}</span>
                <span className="ml-auto font-mono">₹{r.fare.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 lg:p-5">
        <h2 className="mb-3 text-sm font-semibold">Past trips</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed trips yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2">Ride</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={`${h.rideId}-${h.at}`} className="border-t border-border">
                    <td className="py-2 font-mono">{h.rideId}</td>
                    <td>
                      {VEHICLE_BY_TYPE[h.vehicleType].emoji} {h.vehicleType}
                    </td>
                    <td className="text-muted-foreground">{h.driverName}</td>
                    <td className="font-mono">{h.distance}</td>
                    <td className="font-mono">₹{h.fare.toFixed(2)}</td>
                    <td>
                      {h.outcome === "Matched" ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Matched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
