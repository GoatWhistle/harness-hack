import { DecisionCard, type ApprovalAction } from "./DecisionCard";

interface DecisionQueueProps {
  items: Record<string, unknown>[];
  headroom: Record<string, unknown>;
  limits: Record<string, unknown>;
  actions: Record<string, ApprovalAction>;
  live: boolean;
  onRespond: (item: Record<string, unknown>, approve: boolean) => void;
}

export function DecisionQueue({
  items,
  headroom,
  limits,
  actions,
  live,
  onRespond,
}: DecisionQueueProps) {
  if (!items.length) return null;

  const awaiting = items.filter(
    (item) => !actions[String(item.tool_call_id ?? "")]?.outcome,
  ).length;

  return (
    <section className="decisions" aria-label="Decisions awaiting approval">
      <div className="decisions-heading">
        <h2>Operator decisions</h2>
        <span>{awaiting} awaiting</span>
      </div>
      <p className="sr-only" role="status">
        {awaiting === 0
          ? "No decisions await your approval"
          : `${awaiting} ${awaiting === 1 ? "decision awaits" : "decisions await"} your approval`}
        {live || awaiting === 0
          ? ""
          : ", but the guard is unreachable and none can be authorized"}
      </p>
      {items.map((item) => {
        const toolCallId = String(item.tool_call_id ?? "");
        return (
          <DecisionCard
            key={toolCallId || String(item.created_at ?? "")}
            item={item}
            headroom={headroom}
            limits={limits}
            action={actions[toolCallId]}
            live={live}
            onRespond={onRespond}
          />
        );
      })}
    </section>
  );
}

export function StandingBy({ marketOpen }: { marketOpen: boolean }) {
  return (
    <section className="standing-by">
      <b>Nothing awaits you</b>
      <p>
        {marketOpen
          ? "The agent is working inside the mandate. It stops here before anything irreversible."
          : "The market is closed. The agent researches but cannot propose an order outside regular hours."}
      </p>
    </section>
  );
}
