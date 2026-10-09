import { useState } from "react";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";

import "./DashboardLayout.css";

function DashboardLayout({
  role,
  children
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="dashboard-layout">

      <DashboardSidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">

        <DashboardTopbar
          role={role}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="dashboard-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;