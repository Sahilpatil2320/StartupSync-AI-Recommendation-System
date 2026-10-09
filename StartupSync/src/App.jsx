import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import LandingIntro from "./components/LandingIntro";
import PlatformFeatures from "./components/PlatformFeatures";
import PlatformWorkflow from "./components/PlatformWorkflow";
import StartupEcosystem from "./components/StartupEcosystem";
import AIRecommendationShowcase from "./components/AIRecommendationShowcase";
import GetStartedSection from "./components/GetStartedSection";
import SiteFooter from "./components/SiteFooter";

import LoginRoleSelection from "./pages/auth/LoginRoleSelection";
import FounderLogin from "./pages/auth/FounderLogin";
import InvestorLogin from "./pages/auth/InvestorLogin";
import MentorLogin from "./pages/auth/MentorLogin";
import StudentLogin from "./pages/auth/StudentLogin";
import IncubatorLogin from "./pages/auth/IncubatorLogin";
import AdminLogin from "./pages/auth/AdminLogin";

import SignupRoleSelection from "./pages/auth/SignupRoleSelection";
import FounderSignup from "./pages/auth/FounderSignup";
import InvestorSignup from "./pages/auth/InvestorSignup";
import MentorSignup from "./pages/auth/MentorSignup";
import StudentSignup from "./pages/auth/StudentSignup";
import IncubatorSignup from "./pages/auth/IncubatorSignup";
import AdminSignup from "./pages/auth/AdminSignup";

import FounderDashboard from "./pages/dashboard/FounderDashboard";
import InvestorDashboard from "./pages/dashboard/InvestorDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import IncubatorDashboard from "./pages/dashboard/IncubatorDashboard";
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
import StudentOpportunities from "./pages/dashboard/student/StudentOpportunities";
import StudentApplications from "./pages/dashboard/student/StudentApplications";
import StudentMessages from "./pages/dashboard/student/StudentMessages";
import StudentNotifications from "./pages/dashboard/student/StudentNotifications";

import IncubatorStartups from "./pages/dashboard/incubator/IncubatorStartups";
import IncubatorPrograms from "./pages/dashboard/incubator/IncubatorPrograms";
import IncubatorMentors from "./pages/dashboard/incubator/IncubatorMentors";
import IncubatorMessages from "./pages/dashboard/incubator/IncubatorMessages";
import IncubatorNotifications from "./pages/dashboard/incubator/IncubatorNotifications";

import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminStartups from "./pages/dashboard/admin/AdminStartups";
import AdminReports from "./pages/dashboard/admin/AdminReports";
import AdminNotifications from "./pages/dashboard/admin/AdminNotifications";
import AdminSettings from "./pages/dashboard/admin/AdminSettings";

function Home() {
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

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route
                    path="/login"
                    element={<LoginRoleSelection />}
                />

                <Route
                    path="/login/founder"
                    element={<FounderLogin />}
                />

                <Route
                    path="/login/investor"
                    element={<InvestorLogin />}
                />

                <Route
                    path="/login/mentor"
                    element={<MentorLogin />}
                />

                <Route
                    path="/login/student"
                    element={<StudentLogin />}
                />

                <Route
                    path="/login/incubator"
                    element={<IncubatorLogin />}
                />

                <Route
                    path="/login/admin"
                    element={<AdminLogin />}
                />

                <Route
                    path="/signup"
                    element={<SignupRoleSelection />}
                />

                <Route
                    path="/register"
                    element={<Navigate to="/signup" replace />}
                />

                <Route
                    path="/signup/founder"
                    element={<FounderSignup />}
                />

                <Route
                    path="/signup/investor"
                    element={<InvestorSignup />}
                />

                <Route
                    path="/signup/mentor"
                    element={<MentorSignup />}
                />

                <Route
                    path="/signup/student"
                    element={<StudentSignup />}
                />

                <Route
                    path="/signup/incubator"
                    element={<IncubatorSignup />}
                />

                <Route
                    path="/signup/admin"
                    element={<AdminSignup />}
                />

                <Route
                    path="/dashboard/founder"
                    element={<FounderDashboard />}
                />

                <Route
                    path="/dashboard/investor"
                    element={<InvestorDashboard />}
                />

                <Route
                    path="/dashboard/mentor"
                    element={<MentorDashboard />}
                />

                <Route
                    path="/dashboard/student"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/dashboard/incubator"
                    element={<IncubatorDashboard />}
                />

                <Route
                    path="/dashboard/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/dashboard/founder/startup"
                    element={
                        <DashboardLayout role="founder">
                            <FounderStartup />
                        </DashboardLayout>
                    }
                />

                <Route
                    path="/dashboard/founder/investors"
                    element={
                        <DashboardLayout role="founder">
                            <FounderInvestors />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/founder/mentors"
                    element={
                        <DashboardLayout role="founder">
                            <FounderMentors />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/founder/team"
                    element={
                        <DashboardLayout role="founder">
                            <FounderTeam />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/founder/messages"
                    element={
                        <DashboardLayout role="founder">
                            <FounderMessages />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/founder/notifications"
                    element={
                        <DashboardLayout role="founder">
                            <FounderNotifications />
                        </DashboardLayout>
                    }
                />

                <Route
                    path="/dashboard/investor/startups"
                    element={
                        <DashboardLayout role="investor">
                            <InvestorDiscoverStartups />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/investor/investments"
                    element={
                        <DashboardLayout role="investor">
                            <InvestorInvestments />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/investor/messages"
                    element={
                        <DashboardLayout role="investor">
                            <InvestorMessages />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/investor/notifications"
                    element={
                        <DashboardLayout role="investor">
                            <InvestorNotifications />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/mentor/startups"
                    element={
                        <DashboardLayout role="mentor">
                            <MentorStartups />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/mentor/mentorships"
                    element={
                        <DashboardLayout role="mentor">
                            <MentorMentorships />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/mentor/messages"
                    element={
                        <DashboardLayout role="mentor">
                            <MentorMessages />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/mentor/notifications"
                    element={
                        <DashboardLayout role="mentor">
                            <MentorNotifications />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/student/internships"
                    element={
                        <DashboardLayout role="student">
                            <StudentInternships />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/student/opportunities"
                    element={
                        <DashboardLayout role="student">
                            <StudentOpportunities />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/student/applications"
                    element={
                        <DashboardLayout role="student">
                            <StudentApplications />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/student/messages"
                    element={
                        <DashboardLayout role="student">
                            <StudentMessages />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/student/notifications"
                    element={
                        <DashboardLayout role="student">
                            <StudentNotifications />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/incubator/startups"
                    element={
                        <DashboardLayout role="incubator">
                            <IncubatorStartups />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/incubator/programs"
                    element={
                        <DashboardLayout role="incubator">
                            <IncubatorPrograms />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/incubator/mentors"
                    element={
                        <DashboardLayout role="incubator">
                            <IncubatorMentors />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/incubator/messages"
                    element={
                        <DashboardLayout role="incubator">
                            <IncubatorMessages />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/incubator/notifications"
                    element={
                        <DashboardLayout role="incubator">
                            <IncubatorNotifications />
                        </DashboardLayout>
                    }
                />

                <Route
                    path="/dashboard/admin/users"
                    element={
                        <DashboardLayout role="admin">
                            <AdminUsers />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/admin/startups"
                    element={
                        <DashboardLayout role="admin">
                            <AdminStartups />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/admin/reports"
                    element={
                        <DashboardLayout role="admin">
                            <AdminReports />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/admin/notifications"
                    element={
                        <DashboardLayout role="admin">
                            <AdminNotifications />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/dashboard/admin/settings"
                    element={
                        <DashboardLayout role="admin">
                            <AdminSettings />
                        </DashboardLayout>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;