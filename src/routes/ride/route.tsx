import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { RiderShell } from "@/components/RiderShell";

export const Route = createFileRoute("/ride")({
  ssr: false,
  component: RiderLayout,
});

function RiderLayout() {
  return (
    <AuthGuard role="rider" redirectTo="/auth">
      <RiderShell>
        <Outlet />
      </RiderShell>
    </AuthGuard>
  );
}
