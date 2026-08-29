import { useCallback, useMemo, useState } from "react";
import { TopBar } from "./app/TopBar";
import { WorkspaceTabs, type View } from "./app/WorkspaceTabs";
import { useDecidedItems } from "./app/useDecidedItems";
import { freshnessLabel, isStale, useDocumentTitle, useSnapshot } from "./app/useSnapshot";
import { readExecutionMode } from "./components/ExecutionToggle";
import { respondToApproval, updateTrajectory } from "./lib/api";
import { TrajectoryDrawer } from "./settings/TrajectoryDrawer";
import { AgentWorkspace } from "./views/agent/AgentWorkspace";
import { DashboardView } from "./views/dashboard/DashboardView";
import type { ApprovalAction } from "./views/dashboard/decision/DecisionCard";
import { newsItems } from "./views/dashboard/selectors";
import { DiagnosticsView } from "./views/diagnostics/DiagnosticsView";
import { NewsView } from "./views/news/NewsView";

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
  const decisionItems = useDecidedItems(approvals.items, approvalActions);
  const mandate = (snapshot?.mandate.mandate ?? {}) as Record<string, unknown>;
  const universe = Array.isArray(mandate.universe) ? mandate.universe.map(String) : [];

  const trajectory = snapshot?.autonomy.trajectory ?? {};
  const executionMode = readExecutionMode(trajectory);

  useDocumentTitle(approvals.count);

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
    [refresh],
  );

  return (
    <div className="app-shell">
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
        approvalCount={approvals.count}
        executionMode={executionMode}
        executionBusy={executionBusy}
        showRefreshControls={view !== "agent"}
        onOpenSettings={() => setSettingsOpen(true)}
        onTogglePause={() => state.setPaused((value) => !value)}
        onRefresh={() => void refresh()}
        onFocusApprovals={() => setView("overview")}
        onToggleExecution={() => void toggleExecution()}
      />

      <WorkspaceTabs view={view} newsCount={news.length} onSelect={setView} />

      {view === "overview" && (
        <DashboardView
          snapshot={snapshot}
          error={executionError ?? error}
          news={news}
          decisionItems={decisionItems}
          approvalActions={approvalActions}
          onRespond={(item, approve) => void handleRespond(item, approve)}
          onOpenNews={() => setView("news")}
        />
      )}
      {view === "news" && <NewsView items={news} />}
      {view === "diagnostics" && <DiagnosticsView snapshot={snapshot} />}
      {view === "agent" && <AgentWorkspace />}

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
