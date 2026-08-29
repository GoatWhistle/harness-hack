import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { TopBar } from "./app/TopBar";
import { WorkspaceTabs, type View } from "./app/WorkspaceTabs";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { useBrowserIdentity } from "./app/useBrowserIdentity";
import { useDecidedItems } from "./app/useDecidedItems";
import { freshnessLabel, isStale, useSnapshot } from "./app/useSnapshot";
import { readExecutionMode } from "./components/ExecutionToggle";
import { respondToApproval, updateTrajectory } from "./lib/api";
import { TrajectoryDrawer } from "./settings/TrajectoryDrawer";
import { DashboardView } from "./views/dashboard/DashboardView";
import type { ApprovalAction } from "./views/dashboard/decision/DecisionCard";
import { newsItems } from "./views/dashboard/selectors";
import { DiagnosticsView } from "./views/diagnostics/DiagnosticsView";
import { NewsView } from "./views/news/NewsView";

const AgentWorkspace = lazy(() =>
  import("./views/agent/AgentWorkspace").then((module) => ({ default: module.AgentWorkspace })),
);

const VIEW_AREAS: Record<View, string> = {
  overview: "The dashboard",
  news: "The news feed",
  diagnostics: "Diagnostics",
  agent: "The agent chat",
};

export function App() {
  const [view, setView] = useState<View>("overview");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [approvalActions, setApprovalActions] = useState<Record<string, ApprovalAction>>({});
  const [executionBusy, setExecutionBusy] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const state = useSnapshot();
  const { snapshot, error, refresh } = state;

  const news = useMemo(() => newsItems(snapshot), [snapshot]);
  const approvals = snapshot?.approvals ?? { count: 0, items: [] };
  const decided = useDecidedItems();
  const decisionItems = decided.merge(approvals.items);
  const mandate = (snapshot?.mandate.mandate ?? {}) as Record<string, unknown>;
  const universe = Array.isArray(mandate.universe) ? mandate.universe.map(String) : [];

  const trajectory = snapshot?.autonomy.trajectory ?? {};
  const executionMode = readExecutionMode(trajectory);

  const degraded = Boolean(error) || (snapshot !== null && snapshot.source !== "live");
  useBrowserIdentity(view, approvals.count, degraded);

  const toggleExecution = useCallback(async () => {
    const target = executionMode === "auto_paper" ? "approval" : "auto_paper";
    if (target === "auto_paper" && !window.confirm(
      "Enable automatic PAPER order submission? Every order still passes the mandate checks "
      + "and cannot exceed a limit, but it will no longer wait for your approval.",
    )) return;
    setExecutionBusy(true);
    setExecutionError(null);
    try {
      await updateTrajectory({
        execution_mode: target,
        rationale: `operator switched execution mode to ${target}`,
      });
      await refresh();
    } catch (reason) {
      setExecutionError(
        reason instanceof Error ? reason.message : "Could not change execution mode",
      );
    } finally {
      setExecutionBusy(false);
    }
  }, [executionMode, refresh]);

  const selectView = useCallback(
    (next: View) => {
      if (next === view) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !document.startViewTransition) {
        setView(next);
        return;
      }
      document.startViewTransition(() => flushSync(() => setView(next)));
    },
    [view],
  );

  const handleRespond = useCallback(
    async (item: Record<string, unknown>, approve: boolean) => {
      const toolCallId = String(item.tool_call_id ?? "");
      if (!toolCallId) return;
      setApprovalActions((previous) => ({ ...previous, [toolCallId]: { busy: true } }));
      try {
        await respondToApproval({
          sessionId: String(item.session_id ?? ""),
          toolCallId,
          threadId: String(item.thread_id ?? ""),
          approve,
        });
        setApprovalActions((previous) => ({
          ...previous,
          [toolCallId]: { busy: false, outcome: approve ? "approved" : "denied" },
        }));
        decided.retain(item);
        await refresh();
      } catch (reason) {
        setApprovalActions((previous) => ({
          ...previous,
          [toolCallId]: {
            busy: false,
            error: reason instanceof Error ? reason.message : "Could not deliver the decision",
          },
        }));
      }
    },
    [decided, refresh],
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <TopBar
        marketOpen={snapshot?.mandate.market_is_open ?? false}
        source={error ? "degraded" : snapshot?.source ?? null}
        sourceReasons={error ? [error, ...(snapshot?.errors ?? [])] : snapshot?.errors ?? []}
        stale={isStale(snapshot, state.nowMs)}
        services={snapshot?.services ?? []}
        freshness={freshnessLabel(snapshot, state.nowMs, state.paused)}
        hidden={state.hidden}
        paused={state.paused}
        refreshing={state.refreshing}
        manualRefresh={state.manualRefresh}
        approvalCount={approvals.count}
        executionMode={executionMode}
        executionBusy={executionBusy}
        showRefreshControls={view !== "agent"}
        onOpenSettings={() => setSettingsOpen(true)}
        onTogglePause={() => state.setPaused((value) => !value)}
        onRefresh={() => void refresh(true)}
        onFocusApprovals={() => selectView("overview")}
        onToggleExecution={() => void toggleExecution()}
      />

      <WorkspaceTabs view={view} newsCount={news.length} onSelect={selectView} />

      <div className="workspace-body">
        <ErrorBoundary key={view} area={VIEW_AREAS[view]}>
          {view === "overview" && (
            <DashboardView
              snapshot={snapshot}
              error={executionError ?? error}
              news={news}
              decisionItems={decisionItems}
              hidden={state.hidden}
              approvalActions={approvalActions}
              onRespond={(item, approve) => void handleRespond(item, approve)}
              onOpenNews={() => selectView("news")}
            />
          )}
          {view === "news" && <NewsView items={news} />}
          {view === "diagnostics" && <DiagnosticsView snapshot={snapshot} />}
          {view === "agent" && (
            <Suspense fallback={<p className="muted">Loading the agent workspace…</p>}>
              <AgentWorkspace />
            </Suspense>
          )}
        </ErrorBoundary>
      </div>

      <TrajectoryDrawer
        key={String(trajectory.version ?? "new")}
        trajectory={trajectory}
        universe={universe}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
