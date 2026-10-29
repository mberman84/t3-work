import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useDeveloperToolsEnabled } from "~/hooks/useDeveloperTools";

export function DeveloperToolsGate({ children }: { children: ReactNode }) {
  const enabled = useDeveloperToolsEnabled();
  if (enabled) return children;
  return (
    <div className="p-6 text-sm text-muted-foreground">
      <p>Developer tools are turned off.</p>
      <Link to="/settings/general" hash="developer-tools" className="underline">
        Enable Developer tools in Settings → General
      </Link>
    </div>
  );
}
