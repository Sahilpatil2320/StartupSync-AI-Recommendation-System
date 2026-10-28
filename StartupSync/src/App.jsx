import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

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
import AdminLogin from "./pages/auth/AdminLogin";

import SignupRoleSelection from "./pages/auth/SignupRoleSelection";
import FounderSignup from "./pages/auth/FounderSignup";
import InvestorSignup from "./pages/auth/InvestorSignup";
import MentorSignup from "./pages/auth/MentorSignup";
import StudentSignup from "./pages/auth/StudentSignup";
import AdminSignup from "./pages/auth/AdminSignup";

import FounderDashboard from "./pages/dashboard/FounderDashboard";
import InvestorDashboard from "./pages/dashboard/InvestorDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

import DashboardLayout from "./layouts/DashboardLayout";

import FounderStartup from "./pages/dashboard/founder/FounderStartup";
import FounderInvestors from "./pages/dashboard/founder/FounderInvestors";
import InvestorProfile from "./pages/dashboard/founder/InvestorProfile";
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

function Home() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;
        const targetId = location.hash.slice(1);
        const timer = window.setTimeout(() => {
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/ecosystem" element={<Navigate to="/#ecosystem" replace />} />

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
                    path="/dashboard/admin"
                    element={<AdminDashboard />}
                />

                <Route path="/dashboard/founder/profile" element={<DashboardLayout role="founder"><RoleProfile role="founder" /></DashboardLayout>} />
                <Route path="/dashboard/founder/settings" element={<DashboardLayout role="founder"><RoleSettings role="founder" /></DashboardLayout>} />
                <Route path="/dashboard/investor/profile" element={<DashboardLayout role="investor"><RoleProfile role="investor" /></DashboardLayout>} />
                <Route path="/dashboard/investor/settings" element={<DashboardLayout role="investor"><RoleSettings role="investor" /></DashboardLayout>} />
                <Route path="/dashboard/mentor/profile" element={<DashboardLayout role="mentor"><RoleProfile role="mentor" /></DashboardLayout>} />
                <Route path="/dashboard/mentor/settings" element={<DashboardLayout role="mentor"><RoleSettings role="mentor" /></DashboardLayout>} />
                <Route path="/dashboard/student/profile" element={<DashboardLayout role="student"><RoleProfile role="student" /></DashboardLayout>} />
                <Route path="/dashboard/student/settings" element={<DashboardLayout role="student"><RoleSettings role="student" /></DashboardLayout>} />
                <Route path="/dashboard/admin/profile" element={<DashboardLayout role="admin"><RoleProfile role="admin" /></DashboardLayout>} />
                <Route path="/dashboard/admin/settings" element={<DashboardLayout role="admin"><RoleSettings role="admin" /></DashboardLayout>} />

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
                    path="/dashboard/founder/investors/profile/:profileKey"
                    element={
                        <DashboardLayout role="founder">
                            <InvestorProfile />
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
                    path="/dashboard/student/investors"
                    element={
                        <DashboardLayout role="student">
                            <StudentInvestors />
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
                    path="/dashboard/founder/students"
                    element={<DashboardLayout role="founder"><RoleRecommendations role="founder" targetRole="student" /></DashboardLayout>}
                />
                <Route
                    path="/dashboard/investor/mentors"
                    element={<DashboardLayout role="investor"><RoleRecommendations role="investor" targetRole="mentor" /></DashboardLayout>}
                />
                <Route
                    path="/dashboard/mentor/investors"
                    element={<DashboardLayout role="mentor"><RoleRecommendations role="mentor" targetRole="investor" /></DashboardLayout>}
                />
                <Route
                    path="/dashboard/mentor/students"
                    element={<DashboardLayout role="mentor"><RoleRecommendations role="mentor" targetRole="student" /></DashboardLayout>}
                />
                <Route
                    path="/dashboard/student/founders"
                    element={<DashboardLayout role="student"><RoleRecommendations role="student" targetRole="founder" /></DashboardLayout>}
                />
                <Route
                    path="/dashboard/student/mentors"
                    element={<DashboardLayout role="student"><RoleRecommendations role="student" targetRole="mentor" /></DashboardLayout>}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;