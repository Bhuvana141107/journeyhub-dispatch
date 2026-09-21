import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Calculator, CheckCircle2, MapPin, Navigation, ArrowDownUp, Activity } from "lucide-react";
import {
  DEMAND_MULTIPLIERS,
  VEHICLES,
  VEHICLE_BY_TYPE,
  calculateFare,
  euclideanDistance,
  loadSurge,
  type VehicleType,
} from "@/lib/dsa";
import { PLACES, type Place } from "@/lib/places";
import { store } from "@/lib/simulation";
import { useSimulation } from "@/hooks/use-simulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityLog } from "@/components/ActivityLog";

export const Route = createFileRoute("/ride/book")({
  head: () => ({
    meta: [
      { title: "Book Ride — Rideshare Dispatch System" },
      {
        name: "description",
        content:
          "Choose your pickup point and destination, compare bikes, autos, cabs and parcels, and let the system price the ride with live demand.",
      },
      { property: "og:title", content: "Book Ride — Rideshare Dispatch System" },
      {
        property: "og:description",
        content:
          "Choose your pickup point and destination, compare bikes, autos, cabs and parcels, and let the system price the ride with live demand.",
      },
    ],
  }),
  component: BookRide,
});

const DEMAND_STYLE: Record<string, string> = {
  Low: "bg-success/12 text-success",
  Normal: "bg-primary/12 text-primary",
  High: "bg-warning/15 text-warning",
  "Very High": "bg-destructive/12 text-destructive",
};

function BookRide() {
  const sim = useSimulation();
  const [riderName, setRiderName] = useState(store.profile.name);
  const [pickupId, setPickupId] = useState<string>("central");
  const [dropId, setDropId] = useState<string>("techpark");
  const [vehicleType, setVehicleType] = useState<VehicleType>("Cab Mini");
  const [showBreakdown, setShowBreakdown] = useState(false);

  /** saved profile locations shown alongside the city places */
  const savedPlaces: Place[] = [
    { id: "saved-home", name: "Home (saved)", area: "Your profile", point: sim.profile.home },
    { id: "saved-work", name: "Work (saved)", area: "Your profile", point: sim.profile.work },
  ];
  const allPlaces = [...savedPlaces, ...PLACES];
  const byId = (id: string) => allPlaces.find((p) => p.id === id) ?? allPlaces[0]!;

  const pickup = byId(pickupId);
  const drop = byId(dropId);
  const sameSpot = pickup.point.x === drop.point.x && pickup.point.y === drop.point.y;

  const availability = sim.availabilityByVehicle();
  const load = loadSurge(sim.queue.size, sim.availableCount);
  const demand = sim.demandLevel; // system-computed, never rider-selected
  const effectiveName = riderName.trim() || sim.profile.name;

  const { distance, fares } = useMemo(() => {
    const d = euclideanDistance(pickup.point, drop.point);
    const map: Record<string, number> = {};
    for (const v of VEHICLES) {
      map[v.type] = calculateFare(
        d,
        demand,
        sim.pricing.baseFare,
        sim.pricing.ratePerUnit,
        v.multiplier,
        load,
      );
    }
    return { distance: d, fares: map };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickup.point.x,
    pickup.point.y,
    drop.point.x,
    drop.point.y,
    demand,
    sim.pricing.baseFare,
    sim.pricing.ratePerUnit,
    load,
  ]);

  const vehicle = VEHICLE_BY_TYPE[vehicleType];
  const surge = DEMAND_MULTIPLIERS[demand] * load;
  const fare = fares[vehicleType] ?? 0;

  const swap = () => {
    setPickupId(dropId);
    setDropId(pickupId);
  };

  const handleCalculate = () => {
    if (sameSpot) {
      toast.error("Pickup and destination cannot be the same place.");
      return;
    }
    setShowBreakdown(true);
    store.log(
      `Fare estimated for ${effectiveName} (${vehicleType}, demand ${demand}): ₹${fare.toFixed(2)}`,
      "PRICE",
      "O(1)",
    );
    toast.success("Fare calculated from live network state.");
  };

  const handleConfirm = () => {
    if (sameSpot) {
      toast.error("Pickup and destination cannot be the same place.");
      return;
    }
    try {
      const node = store.addRide({
        riderName: effectiveName,
        pickup: pickup.point,
        drop: drop.point,
        demandLevel: demand,
        vehicleType,
      });
      toast.success(`${node.rideId} · ${vehicleType} enqueued at tail — O(1)`);
      setShowBreakdown(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create ride.");
    }
  };

  const placeOptions = (excludeId: string) =>
    allPlaces.map((p) => (
      <SelectItem key={p.id} value={p.id} disabled={p.id === excludeId}>
        {p.name} · {p.area}
      </SelectItem>
    ));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <div className="space-y-5 card-elevated rounded-2xl p-5">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">Book a Ride</h2>
          <p className="text-xs text-muted-foreground">
            Next ride ID: <span className="font-mono text-primary">{sim.nextRideId()}</span> ·
            booking as <span className="font-medium">{effectiveName}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rider">Rider Name</Label>
          <Input
            id="rider"
            value={riderName}
            onChange={(e) => setRiderName(e.target.value)}
            placeholder={sim.profile.name}
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-success" /> Pickup Location
            </Label>
            <Select value={pickupId} onValueChange={setPickupId}>
              <SelectTrigger>
                <SelectValue placeholder="Where should we pick you up?" />
              </SelectTrigger>
              <SelectContent className="max-h-72">{placeOptions(dropId)}</SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={swap}>
              <ArrowDownUp className="h-3.5 w-3.5" /> Swap
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5 text-primary" /> Destination
            </Label>
            <Select value={dropId} onValueChange={setDropId}>
              <SelectTrigger>
                <SelectValue placeholder="Where are you going?" />
              </SelectTrigger>
              <SelectContent className="max-h-72">{placeOptions(pickupId)}</SelectContent>
            </Select>
          </div>

          <p className="rounded-lg bg-muted/70 p-2 font-mono text-[11px] text-muted-foreground">
            {pickup.name} ({pickup.point.x}, {pickup.point.y}) → {drop.name} ({drop.point.x},{" "}
            {drop.point.y})
          </p>
        </div>

        <div className="space-y-2">
          <Label>Choose a Vehicle</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {VEHICLES.map((v) => {
              const free = availability[v.type] ?? 0;
              const active = vehicleType === v.type;
              return (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => setVehicleType(v.type)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{v.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                      {v.type}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          free > 0
                            ? "bg-success/12 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {free > 0 ? `${free} nearby` : "none free"}
                      </span>
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {v.tagline} · {v.capacity ? `${v.capacity} seats` : "parcel"} ·{" "}
                      {v.etaBias + 2} min
                    </span>
                  </span>
                  <span className="text-sm font-bold text-primary">
                    ₹{(fares[v.type] ?? 0).toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Activity className="h-4 w-4 text-primary" /> Live Demand
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                DEMAND_STYLE[demand] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {demand} ×{DEMAND_MULTIPLIERS[demand].toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Set automatically by the network — {sim.demandReason}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="base">Base Fare (₹)</Label>
            <Input
              id="base"
              type="number"
              value={sim.pricing.baseFare}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 0) store.setPricing({ baseFare: v });
                else toast.error("Base fare must be a non-negative number.");
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate per Distance Unit (₹)</Label>
            <Input
              id="rate"
              type="number"
              value={sim.pricing.ratePerUnit}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 0) store.setPricing({ ratePerUnit: v });
                else toast.error("Rate must be a non-negative number.");
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleCalculate}>
            <Calculator className="h-4 w-4" /> Calculate Fare
          </Button>
          <Button onClick={handleConfirm} disabled={sameSpot}>
            <CheckCircle2 className="h-4 w-4" /> Confirm &amp; Add to Dispatch Queue
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card-elevated rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-card-foreground">
            Live Estimate · {vehicle.emoji} {vehicleType}
          </h3>
          <div className="mt-3 space-y-2 font-mono text-xs text-muted-foreground">
            <p>
              distance = sqrt(({drop.point.x} - {pickup.point.x})² + ({drop.point.y} -{" "}
              {pickup.point.y})²)
            </p>
            <p className="text-card-foreground">
              = <span className="text-primary">{distance.toFixed(3)}</span> units · O(1)
            </p>
            <p className="pt-2">
              demand = system({sim.queue.size} waiting, {sim.availableCount} free) → {demand} ×
              {DEMAND_MULTIPLIERS[demand].toFixed(2)}
            </p>
            <p>
              loadSurge = queueSize / availableDrivers = {sim.queue.size} / {sim.availableCount} → ×
              {load.toFixed(2)}
            </p>
            <p className="pt-2">fare = (base + distance × rate) × vehicle × surge</p>
            <p className="text-card-foreground">
              = ({sim.pricing.baseFare} + {distance.toFixed(2)} × {sim.pricing.ratePerUnit}) ×{" "}
              {vehicle.multiplier} × {surge.toFixed(2)}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Distance</dt>
              <dd className="font-semibold">{distance.toFixed(2)} u</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Base Fare</dt>
              <dd className="font-semibold">₹{sim.pricing.baseFare}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Rate / Unit</dt>
              <dd className="font-semibold">₹{sim.pricing.ratePerUnit}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Vehicle Multiplier</dt>
              <dd className="font-semibold">×{vehicle.multiplier.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total Surge</dt>
              <dd className="font-semibold text-warning">×{surge.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Final Estimated Fare</dt>
              <dd className="text-lg font-bold text-success">₹{fare.toFixed(2)}</dd>
            </div>
          </dl>
          {showBreakdown && (
            <p className="mt-3 rounded-lg bg-muted/70 p-2 text-xs text-muted-foreground">
              Estimate locked in from current inputs. Changing any field recalculates instantly.
            </p>
          )}
        </div>
        <ActivityLog limit={6} />
      </div>
    </div>
  );
}
