import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardOverview from "./DashboardOverview";

function MentorDashboard() {
  return (
    <DashboardLayout role="mentor">
      <DashboardOverview role="mentor" />
    </DashboardLayout>
  );
}

export default MentorDashboard;