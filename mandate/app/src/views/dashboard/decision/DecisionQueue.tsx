import { DecisionCard, type ApprovalAction } from "./DecisionCard";

interface DecisionQueueProps {
  items: Record<string, unknown>[];
  headroom: Record<string, unknown>;
  limits: Record<string, unknown>;
  actions: Record<string, ApprovalAction>;
  onRespond: (item: Record<string, unknown>, approve: boolean) => void;
}

export function DecisionQueue({
  items,
  headroom,
  limits,
  actions,
  onRespond,
}: DecisionQueueProps) {
  if (!items.length) return null;

  return (
    <section className="decisions" aria-live="polite" aria-label="Decisions awaiting approval">
      <div className="decisions-heading">
        <h2>Operator decisions</h2>
        <span>{items.length} awaiting</span>
      </div>
      {items.map((item) => {
        const toolCallId = String(item.tool_call_id ?? "");
        return (
          <DecisionCard
            key={toolCallId || String(item.created_at ?? "")}
            item={item}
            headroom={headroom}
            limits={limits}
            action={actions[toolCallId]}
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
