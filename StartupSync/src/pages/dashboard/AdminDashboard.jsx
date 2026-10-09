import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardOverview from "./DashboardOverview";

function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <DashboardOverview role="admin" />
    </DashboardLayout>
  );
}

export default AdminDashboard;