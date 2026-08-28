interface SourceBadgeProps {
  source: "live" | "degraded" | null;
  reasons: string[];
}

export function SourceBadge({ source, reasons }: SourceBadgeProps) {
  if (source === null) {
    return (
      <span className="source-badge source-badge--unknown" title="No snapshot received yet">
        NO DATA
      </span>
    );
  }
  if (source === "live") {
    return (
      <span className="source-badge source-badge--live" title="Guard is answering; values are live">
        LIVE
      </span>
    );
  }
  const title = reasons.length
    ? reasons.join("\n")
    : "The guard is unreachable; live values are withheld";
  return (
    <span className="source-badge source-badge--degraded" title={title}>
      DEGRADED
    </span>
  );
}

export function Withheld({ label = "withheld" }: { label?: string }) {
  return (
    <span className="withheld" title="The guard is unreachable, so this value is withheld rather than shown stale">
      —<small>{label}</small>
    </span>
  );
}
