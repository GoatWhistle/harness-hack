import { useEffect, useRef, useState } from "react";
import type { ApprovalAction } from "../views/dashboard/decision/DecisionCard";

const KEEP_VISIBLE_MS = 12_000;

export function useDecidedItems(
  items: Record<string, unknown>[],
  actions: Record<string, ApprovalAction>,
): Record<string, unknown>[] {
  const [retained, setRetained] = useState<Record<string, unknown>[]>([]);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const decided = Object.entries(actions)
      .filter(([, action]) => action.outcome)
      .map(([id]) => id);

    for (const id of decided) {
      if (timers.current[id]) continue;
      const item = items.find((entry) => String(entry.tool_call_id ?? "") === id);
      if (item) setRetained((previous) => [...previous, item]);
      timers.current[id] = window.setTimeout(() => {
        setRetained((previous) =>
          previous.filter((entry) => String(entry.tool_call_id ?? "") !== id),
        );
      }, KEEP_VISIBLE_MS);
    }
  }, [items, actions]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of Object.values(pending)) window.clearTimeout(timer);
    };
  }, []);

  const liveIds = new Set(items.map((entry) => String(entry.tool_call_id ?? "")));
  return [
    ...items,
    ...retained.filter((entry) => !liveIds.has(String(entry.tool_call_id ?? ""))),
  ];
}
