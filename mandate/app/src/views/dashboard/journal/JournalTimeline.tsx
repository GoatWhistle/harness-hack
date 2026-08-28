import { Empty } from "../../../components/Panel";
import { SkeletonTimeline } from "../../../components/Skeleton";
import { timestamp } from "../../../lib/format";
import { emptyMessage, outcomeLabel, type TimelineFilter } from "../../../lib/outcomes";
import type { Journal } from "../../../lib/api";
import { BreachTable } from "./BreachTable";
import { groupByDay } from "./groupByDay";

function entryTitle(entry: Journal): string {
  const order = entry.details.order as Record<string, unknown> | undefined;
  if (entry.action === "submit_order" && order) {
    return `${String(order.side ?? "").toUpperCase()} ${order.qty ?? ""} ${order.symbol ?? ""}`;
  }
  return entry.action.replaceAll("_", " ");
}

function TimelineItem({ entry, last }: { entry: Journal; last: boolean }) {
  const chips = [
    entry.details.intent_id && `intent ${String(entry.details.intent_id)}`,
    entry.details.order_id && `order ${String(entry.details.order_id).slice(0, 14)}`,
    entry.details.intended_action && String(entry.details.intended_action),
  ].filter(Boolean) as string[];

  return (
    <article className={`timeline-item outcome--${entry.outcome}`}>
      <div className="timeline-marker">
        <i aria-hidden="true" />
        {!last && <span aria-hidden="true" />}
      </div>
      <div className="timeline-content">
        <div className="timeline-topline">
          <div>
            <b>{entryTitle(entry)}</b>
            <em>{outcomeLabel(entry.outcome)}</em>
          </div>
          <time>{timestamp(entry.at)}</time>
        </div>
        <p>{entry.rationale}</p>
        <BreachTable details={entry.details} />
        {chips.length > 0 && (
          <div className="detail-chips">
            {chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        )}
        <details>
          <summary>Raw evidence</summary>
          <pre>{JSON.stringify(entry.details, null, 2)}</pre>
        </details>
      </div>
    </article>
  );
}

interface JournalTimelineProps {
  entries: Journal[];
  filter: TimelineFilter;
  loading?: boolean;
}

export function JournalTimeline({ entries, filter, loading = false }: JournalTimelineProps) {
  if (loading) return <SkeletonTimeline />;
  if (!entries.length) return <Empty>{emptyMessage(filter)}</Empty>;

  const days = groupByDay(entries);

  return (
    <div className="timeline">
      {days.map((day) => (
        <section className="timeline-day" key={day.key}>
          <h3 className="timeline-day-heading">
            <span>{day.label}</span>
            <em>{day.entries.length}</em>
          </h3>
          {day.entries.map((entry, index) => (
            <TimelineItem
              key={`${entry.at}-${index}`}
              entry={entry}
              last={index === day.entries.length - 1}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
