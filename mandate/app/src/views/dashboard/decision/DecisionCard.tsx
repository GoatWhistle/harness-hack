import { isoDate, timestamp } from "../../../lib/format";
import { OrderTerms, decisionSummary, isOrderTool } from "./decisionTerms";
import { ApprovalControl } from "./ApprovalControl";
import { MandateAuthority } from "./MandateAuthority";

export interface ApprovalAction {
  busy: boolean;
  outcome?: "approved" | "denied";
  error?: string;
}

interface DecisionCardProps {
  item: Record<string, unknown>;
  headroom: Record<string, unknown>;
  limits: Record<string, unknown>;
  action: ApprovalAction | undefined;
  live: boolean;
  index: number;
  onRespond: (item: Record<string, unknown>, approve: boolean) => void;
}

export function DecisionCard({
  item,
  headroom,
  limits,
  action,
  live,
  index,
  onRespond,
}: DecisionCardProps) {
  const args = (item.arguments && typeof item.arguments === "object"
    ? item.arguments
    : {}) as Record<string, unknown>;
  const toolName = String(item.tool_name ?? "tool");
  const isOrder = isOrderTool(toolName);
  return (
    <article
      className={`decision-card${action?.outcome ? " decided" : ""}`}
      style={{ "--card-index": index } as React.CSSProperties}
    >
      <div className="decision-actions">
        <ApprovalControl
          action={action}
          live={live}
          isOrder={isOrder}
          onRespond={(approve) => onRespond(item, approve)}
        />
        {action?.error ? <p className="decision-error" role="alert">{action.error}</p> : null}
      </div>

      <div className="decision-main">
        <div className="decision-topline">
          <b>{decisionSummary(toolName, args)}</b>
          <time dateTime={isoDate(item.created_at)}>{timestamp(item.created_at)}</time>
        </div>

        {isOrder && (
          <p className="decision-warning">
            An executed paper order cannot be recalled. The guard re-checks every mandate
            limit against fresh broker state before it submits.
          </p>
        )}

        {isOrder && <OrderTerms args={args} />}
        {isOrder && <MandateAuthority headroom={headroom} limits={limits} />}

        {args.rationale ? (
          <p className="decision-rationale">{String(args.rationale)}</p>
        ) : null}

        <div className="decision-meta">
          <span>{String(item.session_title ?? "") || String(item.session_id ?? "")}</span>
          {args.intent_id ? <span>intent {String(args.intent_id)}</span> : null}
        </div>

        <details>
          <summary>Raw tool request</summary>
          <pre>{JSON.stringify({ tool: toolName, arguments: item.arguments ?? {} }, null, 2)}</pre>
        </details>
      </div>

    </article>
  );
}
