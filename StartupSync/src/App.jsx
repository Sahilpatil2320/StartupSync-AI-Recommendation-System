
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import LandingIntro from "./components/LandingIntro";
import PlatformFeatures from "./components/PlatformFeatures";
import PlatformWorkflow from "./components/PlatformWorkflow";
import StartupEcosystem from "./components/StartupEcosystem";
import AIRecommendationShowcase from "./components/AIRecommendationShowcase";
import GetStartedSection from "./components/GetStartedSection";
import SiteFooter from "./components/SiteFooter";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginRoleSelection from "./pages/auth/LoginRoleSelection";
import FounderLogin from "./pages/auth/FounderLogin";
import InvestorLogin from "./pages/auth/InvestorLogin";
import MentorLogin from "./pages/auth/MentorLogin";
import StudentLogin from "./pages/auth/StudentLogin";
import AdminLogin from "./pages/auth/AdminLogin";

import SignupRoleSelection from "./pages/auth/SignupRoleSelection";
import FounderSignup from "./pages/auth/FounderSignup";
import InvestorSignup from "./pages/auth/InvestorSignup";
import MentorSignup from "./pages/auth/MentorSignup";
import StudentSignup from "./pages/auth/StudentSignup";

import FounderDashboard from "./pages/dashboard/FounderDashboard";
import InvestorDashboard from "./pages/dashboard/InvestorDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

import DashboardLayout from "./layouts/DashboardLayout";

import FounderStartup from "./pages/dashboard/founder/FounderStartup";
import FounderInvestors from "./pages/dashboard/founder/FounderInvestors";
import FounderMentors from "./pages/dashboard/founder/FounderMentors";
import FounderTeam from "./pages/dashboard/founder/FounderTeam";
import FounderMessages from "./pages/dashboard/founder/FounderMessages";
import FounderNotifications from "./pages/dashboard/founder/FounderNotifications";

import InvestorDiscoverStartups from "./pages/dashboard/investor/InvestorDiscoverStartups";
import InvestorInvestments from "./pages/dashboard/investor/InvestorInvestments";
import InvestorMessages from "./pages/dashboard/investor/InvestorMessages";
import InvestorNotifications from "./pages/dashboard/investor/InvestorNotifications";

import MentorStartups from "./pages/dashboard/mentor/MentorStartups";
import MentorMentorships from "./pages/dashboard/mentor/MentorMentorships";
import MentorMessages from "./pages/dashboard/mentor/MentorMessages";
import MentorNotifications from "./pages/dashboard/mentor/MentorNotifications";

import StudentInternships from "./pages/dashboard/student/StudentInternships";
import StudentInvestors from "./pages/dashboard/student/StudentInvestors";
import StudentOpportunities from "./pages/dashboard/student/StudentOpportunities";
import StudentApplications from "./pages/dashboard/student/StudentApplications";
import StudentMessages from "./pages/dashboard/student/StudentMessages";
import StudentNotifications from "./pages/dashboard/student/StudentNotifications";

import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminStartups from "./pages/dashboard/admin/AdminStartups";
import AdminReports from "./pages/dashboard/admin/AdminReports";
import AdminNotifications from "./pages/dashboard/admin/AdminNotifications";

import RoleRecommendations from "./pages/dashboard/shared/RoleRecommendations";
import RoleProfile from "./pages/dashboard/shared/RoleProfile";
import RoleSettings from "./pages/dashboard/shared/RoleSettings";
import PublicProfile from "./pages/dashboard/shared/PublicProfile";
import EcosystemGraph from "./components/EcosystemGraph";

const validRoles = ["founder", "investor", "mentor", "student", "admin"];

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const targetId = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      <Navbar />
      <LandingIntro />
      <PlatformFeatures />
      <PlatformWorkflow />
      <StartupEcosystem />
      <AIRecommendationShowcase />
      <GetStartedSection />
      <SiteFooter />
    </>
  );
}

/* Protects a public-profile URL that lives under /dashboard. */
function ProtectedPublicProfile() {
  const { currentRole } = useParams();

  if (!validRoles.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedRoute role={currentRole}>
      <PublicProfile />
    </ProtectedRoute>
  );
}

/* Apply authentication and role validation to every dashboard page. */
function protectedPage(role, component) {
  return (
    <ProtectedRoute role={role}>
      {component}
    </ProtectedRoute>
  );
}

function dashboardPage(role, component) {
  return protectedPage(
    role,
    <DashboardLayout role={role}>{component}</DashboardLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public website */}
        <Route path="/" element={<Home />} />
        <Route
          path="/ecosystem"
          element={<Navigate to="/#ecosystem" replace />}
        />

        {/* Login */}
        <Route path="/login" element={<LoginRoleSelection />} />
        <Route path="/login/founder" element={<FounderLogin />} />
        <Route path="/login/investor" element={<InvestorLogin />} />
        <Route path="/login/mentor" element={<MentorLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />

        {/* Signup */}
        <Route path="/signup" element={<SignupRoleSelection />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/signup/founder" element={<FounderSignup />} />
        <Route path="/signup/investor" element={<InvestorSignup />} />
        <Route path="/signup/mentor" element={<MentorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/admin" element={<Navigate to="/login/admin" replace />} />

        {/* Main dashboards */}
        <Route
          path="/dashboard/founder"
          element={protectedPage("founder", <FounderDashboard />)}
        />
        <Route
          path="/dashboard/investor"
          element={protectedPage("investor", <InvestorDashboard />)}
        />
        <Route
          path="/dashboard/mentor"
          element={protectedPage("mentor", <MentorDashboard />)}
        />
        <Route
          path="/dashboard/student"
          element={protectedPage("student", <StudentDashboard />)}
        />
        <Route
          path="/dashboard/admin"
          element={protectedPage("admin", <AdminDashboard />)}
        />

        {/* Profile and settings */}
        <Route
          path="/dashboard/founder/profile"
          element={dashboardPage("founder", <RoleProfile role="founder" />)}
        />
        <Route
          path="/dashboard/founder/settings"
          element={dashboardPage("founder", <RoleSettings role="founder" />)}
        />
        <Route
          path="/dashboard/investor/profile"
          element={dashboardPage("investor", <RoleProfile role="investor" />)}
        />
        <Route
          path="/dashboard/investor/settings"
          element={dashboardPage("investor", <RoleSettings role="investor" />)}
        />
        <Route
          path="/dashboard/mentor/profile"
          element={dashboardPage("mentor", <RoleProfile role="mentor" />)}
        />
        <Route
          path="/dashboard/mentor/settings"
          element={dashboardPage("mentor", <RoleSettings role="mentor" />)}
        />
        <Route
          path="/dashboard/student/profile"
          element={dashboardPage("student", <RoleProfile role="student" />)}
        />
        <Route
          path="/dashboard/student/settings"
          element={dashboardPage("student", <RoleSettings role="student" />)}
        />
        <Route
          path="/dashboard/admin/profile"
          element={dashboardPage("admin", <RoleProfile role="admin" />)}
        />
        <Route
          path="/dashboard/admin/settings"
          element={dashboardPage("admin", <RoleSettings role="admin" />)}
        />

        {/* Shared public profile: login and matching role required */}
        <Route
          path="/dashboard/:currentRole/profile-view/:targetRole/:id"
          element={<ProtectedPublicProfile />}
        />

        {/* Founder pages */}
        <Route
          path="/dashboard/founder/startup"
          element={dashboardPage("founder", <FounderStartup />)}
        />
        <Route
          path="/dashboard/founder/investors"
          element={dashboardPage("founder", <FounderInvestors />)}
        />
        <Route
          path="/dashboard/founder/mentors"
          element={dashboardPage("founder", <FounderMentors />)}
        />
        <Route
          path="/dashboard/founder/team"
          element={dashboardPage("founder", <FounderTeam />)}
        />
        <Route
          path="/dashboard/founder/messages"
          element={dashboardPage("founder", <FounderMessages />)}
        />
        <Route
          path="/dashboard/founder/notifications"
          element={dashboardPage("founder", <FounderNotifications />)}
        />
        <Route
          path="/dashboard/founder/students"
          element={dashboardPage(
            "founder",
            <RoleRecommendations role="founder" targetRole="student" />
          )}
        />

        {/* Investor pages */}
        <Route
          path="/dashboard/investor/startups"
          element={dashboardPage("investor", <InvestorDiscoverStartups />)}
        />
        <Route
          path="/dashboard/investor/investments"
          element={dashboardPage("investor", <InvestorInvestments />)}
        />
        <Route
          path="/dashboard/investor/messages"
          element={dashboardPage("investor", <InvestorMessages />)}
        />
        <Route
          path="/dashboard/investor/notifications"
          element={dashboardPage("investor", <InvestorNotifications />)}
        />
        <Route
          path="/dashboard/investor/mentors"
          element={dashboardPage(
            "investor",
            <RoleRecommendations role="investor" targetRole="mentor" />
          )}
        />

        {/* Mentor pages */}
        <Route
          path="/dashboard/mentor/startups"
          element={dashboardPage("mentor", <MentorStartups />)}
        />
        <Route
          path="/dashboard/mentor/mentorships"
          element={dashboardPage("mentor", <MentorMentorships />)}
        />
        <Route
          path="/dashboard/mentor/messages"
          element={dashboardPage("mentor", <MentorMessages />)}
        />
        <Route
          path="/dashboard/mentor/notifications"
          element={dashboardPage("mentor", <MentorNotifications />)}
        />
        <Route
          path="/dashboard/mentor/investors"
          element={dashboardPage(
            "mentor",
            <RoleRecommendations role="mentor" targetRole="investor" />
          )}
        />
        <Route
          path="/dashboard/mentor/students"
          element={dashboardPage(
            "mentor",
            <RoleRecommendations role="mentor" targetRole="student" />
          )}
        />

        {/* Student pages */}
        <Route
          path="/dashboard/student/internships"
          element={dashboardPage("student", <StudentInternships />)}
        />
        <Route
          path="/dashboard/student/investors"
          element={dashboardPage("student", <StudentInvestors />)}
        />
        <Route
          path="/dashboard/student/opportunities"
          element={dashboardPage("student", <StudentOpportunities />)}
        />
        <Route
          path="/dashboard/student/applications"
          element={dashboardPage("student", <StudentApplications />)}
        />
        <Route
          path="/dashboard/student/messages"
          element={dashboardPage("student", <StudentMessages />)}
        />
        <Route
          path="/dashboard/student/notifications"
          element={dashboardPage("student", <StudentNotifications />)}
        />
        <Route
          path="/dashboard/student/founders"
          element={dashboardPage(
            "student",
            <RoleRecommendations role="student" targetRole="founder" />
          )}
        />
        <Route
          path="/dashboard/student/mentors"
          element={dashboardPage(
            "student",
            <RoleRecommendations role="student" targetRole="mentor" />
          )}
        />

        {/* Admin pages */}
        <Route
          path="/dashboard/admin/users"
          element={dashboardPage("admin", <AdminUsers />)}
        />
        <Route
          path="/dashboard/admin/startups"
          element={dashboardPage("admin", <AdminStartups />)}
        />
        <Route
          path="/dashboard/admin/reports"
          element={dashboardPage("admin", <AdminReports />)}
        />
        <Route
          path="/dashboard/admin/notifications"
          element={dashboardPage("admin", <AdminNotifications />)}
        />

        {/* Authenticated ecosystem network views */}
        <Route path="/dashboard/founder/ecosystem" element={dashboardPage("founder", <EcosystemGraph />)} />
        <Route path="/dashboard/investor/ecosystem" element={dashboardPage("investor", <EcosystemGraph />)} />
        <Route path="/dashboard/mentor/ecosystem" element={dashboardPage("mentor", <EcosystemGraph />)} />
        <Route path="/dashboard/student/ecosystem" element={dashboardPage("student", <EcosystemGraph />)} />
        <Route path="/dashboard/admin/ecosystem" element={dashboardPage("admin", <EcosystemGraph />)} />

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;