import { Link } from "react-router-dom";
import startupSyncLogo from "../assets/startupsync-logo.png";
import "./BrandLogo.css";

function BrandLogo({ variant = "light" }) {
  return (
    <Link
      to="/"
      className={`brand-logo brand-logo-${variant}`}
      aria-label="StartupSync Home"
    >
      <img
        src={startupSyncLogo}
        alt="StartupSync Logo"
        className="brand-logo-image"
      />

      <span className="brand-logo-text">
        StartupSync
      </span>
    </Link>
  );
}

export default BrandLogo;