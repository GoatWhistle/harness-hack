export type View = "overview" | "news" | "diagnostics" | "agent";

interface WorkspaceTabsProps {
  view: View;
  newsCount: number;
  onSelect: (view: View) => void;
}

const tabs: { key: View; label: string }[] = [
  { key: "overview", label: "Dashboard" },
  { key: "news", label: "News" },
  { key: "diagnostics", label: "Diagnostics" },
  { key: "agent", label: "Agent chat" },
];

export function WorkspaceTabs({ view, newsCount, onSelect }: WorkspaceTabsProps) {
  return (
    <div className="mandate-chrome workspace-nav-shell">
      <nav className="workspace-tabs" aria-label="MANDATE workspace">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={view === tab.key ? "active" : ""}
            aria-current={view === tab.key ? "page" : undefined}
            onClick={() => onSelect(tab.key)}
          >
            {tab.label}
            {tab.key === "news" && newsCount > 0 && <em className="tab-badge">{newsCount}</em>}
          </button>
        ))}
      </nav>
    </div>
  );
}
