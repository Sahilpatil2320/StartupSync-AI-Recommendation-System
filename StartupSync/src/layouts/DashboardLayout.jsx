
import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import "./DashboardLayout.css";

function DashboardLayout({ role, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const normalizedRole = String(role || "founder").toLowerCase();

  const toggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div
      className={`dashboard-layout ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <DashboardSidebar
        role={normalizedRole}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={toggleSidebar}
      />

      <div className="dashboard-main">
        <DashboardTopbar
          role={normalizedRole}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;