import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardOverview from "./DashboardOverview";

function InvestorDashboard() {
  return (
    <DashboardLayout role="investor">
      <DashboardOverview role="investor" />
    </DashboardLayout>
  );
}

export default InvestorDashboard;