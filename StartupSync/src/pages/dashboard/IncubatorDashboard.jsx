import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardOverview from "./DashboardOverview";

function IncubatorDashboard() {
  return (
    <DashboardLayout role="incubator">
      <DashboardOverview role="incubator" />
    </DashboardLayout>
  );
}

export default IncubatorDashboard;