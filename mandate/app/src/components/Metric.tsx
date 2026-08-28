import type { ReactNode } from "react";
import { decimal } from "../lib/format";

export type MetricTone = "default" | "good" | "bad" | "warn";

interface MetricProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: MetricTone;
  used?: number;
  limit?: number;
  unit?: string;
}

export function Metric({
  label,
  value,
  hint,
  tone = "default",
  used,
  limit,
  unit = "%",
}: MetricProps) {
  const hasBar = limit !== undefined && used !== undefined && limit > 0;
  const ratio = hasBar ? Math.min(Math.max((used / limit) * 100, 0), 100) : 0;
  const barDanger = (hasBar && ratio >= 80) || tone === "bad";

  return (
    <article className={`metric metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hasBar ? (
        <div className="metric-bar">
          <div
            className="bar"
            role="meter"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-label={`${label}: ${decimal(used)} of ${decimal(limit)}${unit}`}
          >
            <i
              className={barDanger ? "danger" : ""}
              style={{ "--fill": ratio / 100 } as React.CSSProperties}
            />
          </div>
          <small>
            {decimal(used)} / {decimal(limit)}
            {unit}
          </small>
        </div>
      ) : (
        <small>{hint}</small>
      )}
    </article>
  );
}
