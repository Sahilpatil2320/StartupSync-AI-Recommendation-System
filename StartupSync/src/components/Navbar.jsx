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
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#ecosystem">Ecosystem</a>
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

                    <a href="#features" onClick={() => setMenuOpen(false)}>
                        Features
                    </a>

                    <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                        How It Works
                    </a>

                    <a href="#ecosystem" onClick={() => setMenuOpen(false)}>
                        Ecosystem
                    </a>

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