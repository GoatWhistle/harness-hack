import { Empty, Panel } from "../../../components/Panel";
import { money } from "../../../lib/format";

interface PositionsPanelProps {
  positions: [string, Record<string, unknown>][];
  pending: Record<string, unknown>[];
  live: boolean;
}

export function PositionsPanel({ positions, pending, live }: PositionsPanelProps) {
  return (
    <Panel title="Positions & orders" count={positions.length} className="broker-panel">
      {positions.length ? (
        <div className="positions">
          {positions.map(([symbol, item]) => (
            <div key={symbol}>
              <b>{symbol}</b>
              <span>{String(item.qty ?? "0")} shares</span>
              <strong>{live ? money(item.market_value) : "—"}</strong>
              <small>@ {live ? money(item.market_price) : "—"}</small>
            </div>
          ))}
        </div>
      ) : (
        <Empty>
          No open positions. The agent holds nothing on the paper account right now.
        </Empty>
      )}

      <div className="subsection-title">
        <span>Pending orders</span>
        <b>{pending.length}</b>
      </div>

      {pending.length ? (
        <div className="pending-list">
          {pending.map((order, index) => (
            <div key={`${String(order.symbol)}-${index}`}>
              <b>{String(order.symbol ?? "—")}</b>
              <span>
                {String(order.side ?? "")} {String(order.remaining_qty ?? "")}
              </span>
              <small>@ {live ? money(order.reference_price) : "—"}</small>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No orders are waiting at the broker.</p>
      )}
    </Panel>
  );
}
