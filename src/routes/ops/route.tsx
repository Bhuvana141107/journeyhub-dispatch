import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { OpsShell } from "@/components/OpsShell";

export const Route = createFileRoute("/ops")({
  ssr: false,
  component: OpsLayout,
});

function OpsLayout() {
  return (
    <AuthGuard role="ops" redirectTo="/control">
      <OpsShell>
        <Outlet />
      </OpsShell>
    </AuthGuard>
  );
}
