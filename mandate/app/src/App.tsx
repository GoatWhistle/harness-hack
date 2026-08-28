import { useCallback, useMemo, useState } from "react";
import { TopBar } from "./app/TopBar";
import { WorkspaceTabs, type View } from "./app/WorkspaceTabs";
import { freshnessLabel, isStale, useDocumentTitle, useSnapshot } from "./app/useSnapshot";
import { respondToApproval } from "./lib/api";
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
  const state = useSnapshot();
  const { snapshot, error, refresh } = state;

  const news = useMemo(() => newsItems(snapshot), [snapshot]);
  const approvals = snapshot?.approvals ?? { count: 0, items: [] };
  const mandate = (snapshot?.mandate.mandate ?? {}) as Record<string, unknown>;
  const universe = Array.isArray(mandate.universe) ? mandate.universe.map(String) : [];

  useDocumentTitle(approvals.count);

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
        source={snapshot?.source ?? null}
        sourceReasons={snapshot?.errors ?? []}
        stale={isStale(snapshot, state.nowMs)}
        services={snapshot?.services ?? []}
        freshness={freshnessLabel(snapshot, state.nowMs, state.paused)}
        hidden={state.hidden}
        paused={state.paused}
        refreshing={state.refreshing}
        approvalCount={approvals.count}
        showRefreshControls={view !== "agent"}
        onOpenSettings={() => setSettingsOpen(true)}
        onTogglePause={() => state.setPaused((value) => !value)}
        onRefresh={() => void refresh()}
        onFocusApprovals={() => setView("overview")}
      />

      <WorkspaceTabs view={view} newsCount={news.length} onSelect={setView} />

      {view === "overview" && (
        <DashboardView
          snapshot={snapshot}
          error={error}
          news={news}
          approvalActions={approvalActions}
          onRespond={(item, approve) => void handleRespond(item, approve)}
          onOpenNews={() => setView("news")}
        />
      )}
      {view === "news" && <NewsView items={news} />}
      {view === "diagnostics" && <DiagnosticsView snapshot={snapshot} />}
      {view === "agent" && <AgentWorkspace />}

      <TrajectoryDrawer
        key={String(snapshot?.autonomy.trajectory.version ?? "new")}
        trajectory={snapshot?.autonomy.trajectory ?? {}}
        universe={universe}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
