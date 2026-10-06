function Landing() {
    return (
        <div className="landing-page">

            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="navbar">
                <div className="navbar-container">

                    <div className="logo">
                        <div className="logo-icon">⚡</div>

                        <span>
                            Startup<span>Sync</span>
                        </span>
                    </div>

                    <div className="nav-links">
                        <a href="#home">Home</a>
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#ecosystem">Ecosystem</a>
                    </div>

                    <div className="nav-actions">
                        <button className="login-button">
                            Login
                        </button>

                        <button className="get-started-button">
                            Get Started →
                        </button>
                    </div>

                </div>
            </nav>


            {/* =========================
                HERO
            ========================= */}

            <section id="home" className="hero">

                <div className="hero-content">

                    {/* LEFT SIDE */}

                    <div className="hero-left">

                        <div className="hero-badge">
                            ✦ AI-Powered Startup Ecosystem
                        </div>

                        <h1>
                            Build.
                            <span> Connect.</span>
                            <br />
                            Grow Together.
                        </h1>

                        <p>
                            StartupSync connects founders, investors,
                            mentors, and students through intelligent
                            AI-powered recommendations and meaningful
                            connections.
                        </p>

                        <div className="hero-buttons">

                            <button className="get-started-button hero-button">
                                Get Started →
                            </button>

                            <button className="explore-button">
                                Explore Ecosystem
                            </button>

                        </div>


                        {/* HERO STATS */}

                        <div className="hero-stats">

                            <div className="hero-stat">
                                <strong>4</strong>
                                <span>Roles</span>
                            </div>

                            <div className="hero-stat-divider"></div>

                            <div className="hero-stat">
                                <strong>AI</strong>
                                <span>Recommendations</span>
                            </div>

                            <div className="hero-stat-divider"></div>

                            <div className="hero-stat">
                                <strong>Smart</strong>
                                <span>Discovery</span>
                            </div>

                        </div>

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="hero-right">

                        <div className="hero-dashboard">

                            {/* Dashboard top */}

                            <div className="dashboard-topbar">

                                <div className="dashboard-brand">

                                    <div className="dashboard-logo">
                                        ⚡
                                    </div>

                                    StartupSync

                                </div>

                                <div className="dashboard-user">

                                    <span className="notification-dot"></span>

                                    <div className="dashboard-avatar">
                                        SP
                                    </div>

                                </div>

                            </div>


                            {/* Dashboard body */}

                            <div className="dashboard-content">

                                {/* Sidebar */}

                                <aside className="dashboard-sidebar">

                                    <div className="sidebar-item active">
                                        <span>⌂</span>
                                        Dashboard
                                    </div>

                                    <div className="sidebar-item">
                                        <span>✦</span>
                                        Recommendations
                                    </div>

                                    <div className="sidebar-item">
                                        <span>⌕</span>
                                        Search
                                    </div>

                                    <div className="sidebar-item">
                                        <span>◯</span>
                                        Messages
                                    </div>

                                    <div className="sidebar-item">
                                        <span>♙</span>
                                        Profile
                                    </div>

                                </aside>


                                {/* Main */}

                                <div className="dashboard-main">

                                    <div className="dashboard-heading">

                                        <div>

                                            <small>
                                                FOUNDER WORKSPACE
                                            </small>

                                            <h3>
                                                Welcome back, Sahil 👋
                                            </h3>

                                        </div>

                                        <button>
                                            View Profile
                                        </button>

                                    </div>


                                    {/* Stats */}

                                    <div className="dashboard-stats">

                                        <div className="dashboard-stat-card">

                                            <span>
                                                Investor Matches
                                            </span>

                                            <strong>
                                                12
                                            </strong>

                                            <small>
                                                AI matched
                                            </small>

                                        </div>


                                        <div className="dashboard-stat-card">

                                            <span>
                                                Mentor Matches
                                            </span>

                                            <strong>
                                                08
                                            </strong>

                                            <small>
                                                AI matched
                                            </small>

                                        </div>


                                        <div className="dashboard-stat-card">

                                            <span>
                                                Profile Score
                                            </span>

                                            <strong>
                                                82%
                                            </strong>

                                            <small>
                                                Almost complete
                                            </small>

                                        </div>

                                    </div>


                                    {/* Recommendations */}

                                    <div className="recommendation-card">

                                        <div className="recommendation-heading">

                                            <div>

                                                <small>
                                                    AI RECOMMENDATIONS
                                                </small>

                                                <h4>
                                                    Recommended Investors
                                                </h4>

                                            </div>

                                            <span>
                                                View all →
                                            </span>

                                        </div>


                                        <div className="recommendation-person">

                                            <div className="person-avatar">
                                                AS
                                            </div>

                                            <div className="person-details">

                                                <strong>
                                                    Arjun Sharma
                                                </strong>

                                                <span>
                                                    Technology • SaaS • AI
                                                </span>

                                            </div>

                                            <div className="match">

                                                <strong>
                                                    94%
                                                </strong>

                                                <span>
                                                    Match
                                                </span>

                                            </div>

                                        </div>


                                        <div className="recommendation-person">

                                            <div className="person-avatar second">
                                                RK
                                            </div>

                                            <div className="person-details">

                                                <strong>
                                                    Rohan Kulkarni
                                                </strong>

                                                <span>
                                                    FinTech • Software
                                                </span>

                                            </div>

                                            <div className="match">

                                                <strong>
                                                    89%
                                                </strong>

                                                <span>
                                                    Match
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Landing;