import { useCallback, useEffect, useState } from "react";
import { getSnapshot, type Snapshot } from "../lib/api";

const REFRESH_MS = 5_000;

export interface SnapshotState {
  snapshot: Snapshot | null;
  error: string | null;
  refreshing: boolean;
  paused: boolean;
  hidden: boolean;
  nowMs: number;
  setPaused: (update: (value: boolean) => boolean) => void;
  refresh: () => Promise<void>;
}

export function useSnapshot(): SnapshotState {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.visibilityState === "hidden");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setSnapshot(await getSnapshot());
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dashboard data is unavailable");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (paused || hidden) return;
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [paused, hidden, refresh]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return { snapshot, error, refreshing, paused, hidden, nowMs, setPaused, refresh };
}

export function useDocumentTitle(pendingCount: number): void {
  useEffect(() => {
    document.title = pendingCount > 0
      ? `(${pendingCount}) MANDATE · Operator Console`
      : "MANDATE · Operator Console";
  }, [pendingCount]);
}

const STALE_AFTER_S = 20;

export function snapshotAgeSeconds(snapshot: Snapshot | null, nowMs: number): number | null {
  if (!snapshot) return null;
  const parsed = Date.parse(snapshot.generated_at);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.round((nowMs - parsed) / 1000));
}

export function freshnessLabel(
  snapshot: Snapshot | null,
  nowMs: number,
  paused: boolean,
): string {
  if (paused) return "paused";
  const ageS = snapshotAgeSeconds(snapshot, nowMs);
  if (ageS === null) return "no data";
  return `${ageS}s ago`;
}

export function isStale(snapshot: Snapshot | null, nowMs: number): boolean {
  const ageS = snapshotAgeSeconds(snapshot, nowMs);
  return ageS !== null && ageS > STALE_AFTER_S;
}
