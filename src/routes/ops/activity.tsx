import { createFileRoute } from "@tanstack/react-router";
import { ActivityLog } from "@/components/ActivityLog";
import { DataStructureState } from "@/components/DataStructureState";

export const Route = createFileRoute("/ops/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log — RIDE-X Dispatch Control" },
      {
        name: "description",
        content:
          "Chronological log of every enqueue, dequeue, cancellation and hash map lookup performed by the dispatch engine.",
      },
      { property: "og:title", content: "Activity Log — RIDE-X Dispatch Control" },
      {
        property: "og:description",
        content: "Every enqueue, dequeue, cancellation and lookup performed by the engine.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Network Operations
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Activity Log</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityLog />
        <DataStructureState />
      </div>
    </div>
  );
}
