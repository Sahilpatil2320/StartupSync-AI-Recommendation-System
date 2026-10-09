import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardOverview from "./DashboardOverview";

function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <DashboardOverview role="student" />
    </DashboardLayout>
  );
}

export default StudentDashboard;