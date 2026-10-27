import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    MapPin,
    Users,
    BriefcaseBusiness,
    Globe,
    GraduationCap,
    UserRound,
    Wallet,
} from "lucide-react";

import "./PublicProfile.css";

const PRIVATE_FIELDS =
    /password|token|secret|credential|otp|resetcode|privatekey|__v/i;

function formatLabel(value) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (Array.isArray(value)) {
        return value.map(formatValue).filter(Boolean).join(", ");
    }

    if (typeof value === "object") {
        if (value.name) return String(value.name);
        if (value.title) return String(value.title);
        if (value._id) return "";
        return Object.entries(value)
            .filter(([key]) => !PRIVATE_FIELDS.test(key))
            .map(([key, item]) => `${formatLabel(key)}: ${formatValue(item)}`)
            .filter((item) => !item.endsWith(": "))
            .join(" · ");
    }

    return String(value);
}

function getFirstValue(profile, keys, fallback = "Not specified") {
    for (const key of keys) {
        const value = profile?.[key];

        if (
            value !== undefined &&
            value !== null &&
            String(formatValue(value)).trim() !== ""
        ) {
            return formatValue(value);
        }
    }

    return fallback;
}

function getPublicFields(profile) {
    if (!profile || typeof profile !== "object") return [];

    return Object.entries(profile)
        .filter(([key, value]) => {
            if (PRIVATE_FIELDS.test(key)) return false;
            if (["_id", "id", "__v", "userId", "createdAt", "updatedAt"].includes(key)) {
                return false;
            }
            if (value === null || value === undefined || value === "") return false;
            if (typeof value === "function") return false;

            return true;
        })
        .map(([key, value]) => ({
            key,
            label: formatLabel(key),
            value: formatValue(value),
        }))
        .filter((item) => item.value);
}

export default function PublicProfile() {
    const { targetRole } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    // The discovery page passes the selected record through navigation state.
    const profile = state?.profile ?? null;

    if (!profile) {
        return (
            <main className="public-profile-page">
                <button
                    type="button"
                    className="public-profile-back"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} />
                    Back to discovery
                </button>

                <section className="public-profile-card">
                    <h2>Profile unavailable</h2>
                    <p>
                        Return to discovery and select the profile again.
                        This page needs the selected record to display its information.
                    </p>
                </section>
            </main>
        );
    }

    const name = getFirstValue(
        profile,
        [
            "startupName",
            "companyName",
            "founderName",
            "fullName",
            "mentorName",
            "studentName",
            "firmName",
            "name",
            "title",
        ],
        "Profile"
    );

    const industry = getFirstValue(
        profile,
        [
            "industry",
            "industries",
            "sector",
            "expertise",
            "domain",
            "investmentIndustries",
        ]
    );

    const description = getFirstValue(
        profile,
        [
            "description",
            "startupDescription",
            "companyDescription",
            "about",
            "bio",
            "summary",
            "investmentThesis",
            "problemStatement",
        ],
        "No description is available in this record."
    );

    const location = getFirstValue(
        profile,
        ["location", "city", "country", "headquarters", "preferredLocation"]
    );

    const teamSize = getFirstValue(
        profile,
        ["teamSize", "employees", "numberOfEmployees", "team_size"]
    );

    const funding = getFirstValue(
        profile,
        [
            "fundingRequired",
            "fundingSought",
            "funding",
            "fundingAmount",
            "amountSeeking",
            "funding_required",
        ]
    );

    const stage = getFirstValue(
        profile,
        ["startupStage", "fundingStage", "stage", "startup_stage"]
    );

    const website = getFirstValue(
        profile,
        ["website", "websiteUrl", "url"],
        ""
    );

    const publicFields = getPublicFields(profile);

    const roleName = targetRole
        ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1)
        : "Member";

    return (
        <main className="public-profile-page">
            <button
                type="button"
                className="public-profile-back"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18} />
                Back to discovery
            </button>

            <section className="public-profile-card">
                <header className="public-profile-header">
                    <div className="public-profile-avatar">
                        {targetRole === "student" ? (
                            <GraduationCap size={32} />
                        ) : targetRole === "investor" ? (
                            <BriefcaseBusiness size={32} />
                        ) : targetRole === "mentor" ? (
                            <UserRound size={32} />
                        ) : (
                            <Building2 size={32} />
                        )}
                    </div>

                    <div>
                        <span className="public-profile-role">{roleName}</span>
                        <h1>{name}</h1>
                        <p>{industry}</p>
                    </div>
                </header>

                <section className="public-profile-section">
                    <h2>About</h2>
                    <p>{description}</p>
                </section>

                <section className="public-profile-section">
                    <h2>Key Information</h2>

                    <div className="public-profile-details">
                        <div className="public-profile-detail">
                            <MapPin size={18} />
                            <div>
                                <span>Location</span>
                                <strong>{location}</strong>
                            </div>
                        </div>

                        <div className="public-profile-detail">
                            <Users size={18} />
                            <div>
                                <span>Team Size</span>
                                <strong>{teamSize}</strong>
                            </div>
                        </div>

                        <div className="public-profile-detail">
                            <Building2 size={18} />
                            <div>
                                <span>Stage</span>
                                <strong>{stage}</strong>
                            </div>
                        </div>

                        <div className="public-profile-detail">
                            <Wallet size={18} />
                            <div>
                                <span>Funding</span>
                                <strong>{funding}</strong>
                            </div>
                        </div>

                        {website && (
                            <div className="public-profile-detail">
                                <Globe size={18} />
                                <div>
                                    <span>Website</span>
                                    <a
                                        href={website.startsWith("http")
                                            ? website
                                            : `https://${website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="public-profile-section">
                    <h2>All Available Profile Details</h2>

                    {publicFields.length > 0 ? (
                        <div className="public-profile-details">
                            {publicFields.map((item) => (
                                <div
                                    className="public-profile-detail"
                                    key={item.key}
                                >
                                    <div>
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No additional public details are available.</p>
                    )}
                </section>
            </section>
        </main>
    );
}