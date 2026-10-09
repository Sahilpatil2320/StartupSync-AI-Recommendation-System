import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardOverview from "./DashboardOverview";

function FounderDashboard() {
  return (
    <DashboardLayout role="founder">
      <DashboardOverview role="founder" />
    </DashboardLayout>
  );
}

export default FounderDashboard;