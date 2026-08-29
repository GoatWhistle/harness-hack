import { hasValue, money } from "../../../lib/format";

const ORDER_TOOLS = new Set(["submit_order_under_mandate"]);

export function isOrderTool(toolName: string): boolean {
  return ORDER_TOOLS.has(toolName);
}

export function decisionSummary(
  toolName: string,
  args: Record<string, unknown>,
): string {
  if (!isOrderTool(toolName)) {
    return toolName.replaceAll("_", " ");
  }
  const side = String(args.side ?? "?").toUpperCase();
  const qty = String(args.qty ?? "?");
  const symbol = String(args.symbol ?? "?");
  const limit = args.limit_price ? ` · LIMIT ${money(args.limit_price)}` : "";
  return `${side} ${qty} ${symbol}${limit}`;
}

function notional(args: Record<string, unknown>): string {
  if (!hasValue(args.qty) || !hasValue(args.limit_price)) return "—";
  return money(Number(args.qty) * Number(args.limit_price));
}

export function OrderTerms({ args }: { args: Record<string, unknown> }) {
  const terms = [
    { label: "Symbol", value: String(args.symbol ?? "—") },
    { label: "Side", value: String(args.side ?? "—").toUpperCase() },
    { label: "Quantity", value: String(args.qty ?? "—") },
    { label: "Type", value: String(args.order_type ?? "—").toUpperCase() },
    {
      label: "Limit",
      value: args.limit_price ? money(args.limit_price) : "—",
    },
    { label: "Notional", value: notional(args) },
  ];

  return (
    <dl className="order-terms">
      {terms.map((term) => (
        <div key={term.label}>
          <dt>{term.label}</dt>
          <dd>{term.value}</dd>
        </div>
      ))}
    </dl>
  );
}
