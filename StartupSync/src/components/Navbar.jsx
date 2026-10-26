import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import "./Navbar.css";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const goToHomeTop = () => {
        setMenuOpen(false);

        if (location.pathname === "/") {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } else {
            navigate("/");
            window.setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }, 100);
        }
    };


    const goToSection = (sectionId) => {
        setMenuOpen(false);
        if (location.pathname !== "/") {
            navigate(`/#${sectionId}`);
            window.setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 180);
            return;
        }
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <button
                    type="button"
                    className="navbar-brand-button"
                    onClick={goToHomeTop}
                    aria-label="StartupSync home"
                >
                    <BrandLogo />
                </button>

                <div className="nav-links">
                    <button type="button" onClick={goToHomeTop}>
                        Home
                    </button>
                    <button type="button" onClick={() => goToSection("features")}>Features</button>
                    <button type="button" onClick={() => goToSection("how-it-works")}>How It Works</button>
                    <button type="button" onClick={() => goToSection("ecosystem")}>Ecosystem</button>
                </div>

                <div className="nav-actions">
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>

                    <Link to="/signup" className="get-started-btn">
                        Get Started
                    </Link>
                </div>

                <button
                    type="button"
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {menuOpen && (
                <div className="mobile-menu">
                    <button type="button" onClick={goToHomeTop}>
                        Home
                    </button>

                    <button type="button" onClick={() => goToSection("features")}>
                        Features
                    </button>

                    <button type="button" onClick={() => goToSection("how-it-works")}>
                        How It Works
                    </button>

                    <button type="button" onClick={() => goToSection("ecosystem")}>
                        Ecosystem
                    </button>

                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Login
                    </Link>

                    <Link
                        to="/signup"
                        className="mobile-get-started"
                        onClick={() => setMenuOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;