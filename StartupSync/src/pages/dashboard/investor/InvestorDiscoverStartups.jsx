import {
    Bookmark,
    Check,
    ExternalLink,
    Filter,
    MapPin,
    Rocket,
    Search,
    UsersRound,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { getRecommendations } from "../../../services/aiApi";
import "./InvestorDiscoverStartups.css";
import { useNavigate } from "react-router-dom";

const getProfileId = (profile) =>
    String(
        profile?._id ||
        profile?.id ||
        profile?.userId?._id ||
        profile?.userId?.id ||
        profile?.userId ||
        profile?.user?._id ||
        profile?.user?.id ||
        profile?.startupId ||
        profile?.startup_id ||
        profile?.dataset_id ||
        profile?.datasetId ||
        ""
    );

const getName = (profile) =>
    profile?.startupName ||
    profile?.companyName ||
    profile?.name ||
    profile?.startup_name ||
    profile?.company_name ||
    profile?.userId?.name ||
    profile?.user?.name ||
    profile?.fullName ||
    "Startup";

const getIndustry = (profile) =>
    profile?.industry || profile?.domain || profile?.sector || "";

const getStage = (profile) =>
    profile?.fundingStage ||
    profile?.startupStage ||
    profile?.stage ||
    profile?.businessStage ||
    profile?.funding_stage ||
    "";

const getLocation = (profile) => {
    if (typeof profile?.location === "string") return profile.location;

    if (profile?.location && typeof profile.location === "object") {
        return [
            profile.location.city,
            profile.location.state,
            profile.location.country,
        ]
            .filter(Boolean)
            .join(", ");
    }

    return [profile?.city, profile?.state, profile?.country]
        .filter(Boolean)
        .join(", ");
};

const getDescription = (profile) =>
    profile?.tagline ||
    profile?.description ||
    profile?.startupDescription ||
    profile?.businessDescription ||
    profile?.startup_description ||
    "No startup description provided.";

const getFunding = (profile) =>
    profile?.fundingSought ??
    profile?.fundingRequired ??
    profile?.fundingNeeded ??
    profile?.investmentRequired ??
    profile?.fundingAmount ??
    profile?.funding_required ??
    profile?.funding_amount ??
    "";

const getTeamSize = (profile) =>
    profile?.teamSize ??
    profile?.numberOfEmployees ??
    profile?.employees ??
    profile?.team_size ??
    "";

const getFounded = (profile) =>
    profile?.foundedYear ||
    profile?.founded ||
    profile?.yearFounded ||
    profile?.founded_year ||
    "";

const getRecommendationItems = (response) => {
    const root = response?.data ?? response;
    const candidates = [
        root?.data?.recommendations,
        root?.data?.founders,
        root?.data?.results,
        root?.recommendations,
        root?.founders,
        root?.results,
        root?.data,
    ];

    return candidates.find(Array.isArray) || [];
};

const getRecommendationScore = (item) => {
    const raw =
        item?.score_percentage ??
        item?.scorePercentage ??
        item?.matchPercentage ??
        item?.match_percentage ??
        item?.matchScore ??
        item?.match_score ??
        item?.similarity_score ??
        item?.similarity ??
        item?.score ??
        item?.confidence ??
        item?.match;

    if (raw === undefined || raw === null || raw === "") return null;

    const score = Number(raw);
    if (!Number.isFinite(score)) return null;

    return Math.round(
        Math.max(0, Math.min(100, score >= 0 && score <= 1 ? score * 100 : score))
    );
};

const extractProfiles = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.founders)) return data.founders;
    if (Array.isArray(data?.profiles)) return data.profiles;
    if (Array.isArray(data?.data)) return data.data;

    return [];
};

function InvestorDiscoverStartups() {
    const [founders, setFounders] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [industry, setIndustry] = useState("All Industries");
    const [stage, setStage] = useState("All Stages");
    const [location, setLocation] = useState("All Locations");
    const [sortBy, setSortBy] = useState("name");
    const [savedStartups, setSavedStartups] = useState([]);
    const [connectedStartups, setConnectedStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(true);
    const [error, setError] = useState("");
    const [aiError, setAiError] = useState("");
    const [connectingId, setConnectingId] = useState("");
    const [selectedFounder, setSelectedFounder] = useState(null);
    const [datasetPage, setDatasetPage] = useState(1);
    const navigate = useNavigate();

    const fetchFounders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("startupsync_token");
            if (!token) throw new Error("Please log in again to view founder profiles.");

            const response = await api.get("/profiles/founders", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFounders(extractProfiles(response));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load founder profiles."
            );
            setFounders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecommendations = useCallback(async () => {
        setAiLoading(true);
        setAiError("");

        try {
            const token = localStorage.getItem("startupsync_token");
            if (!token) throw new Error("Please log in again to view AI recommendations.");

            const payload = token.split(".")[1];
            if (!payload) throw new Error("Invalid login token. Please log in again.");

            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = JSON.parse(window.atob(normalized));
            const userId =
                decoded.userId || decoded.id || decoded._id || decoded.sub || "";

            if (!userId) throw new Error("Could not identify your account from the login token.");

            const response = await getRecommendations("investor", "founders", userId);
            setRecommendations(getRecommendationItems(response).slice(0, 650));
        } catch (err) {
            setAiError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load AI recommendations."
            );
            setRecommendations([]);
        } finally {
            setAiLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFounders();
        fetchRecommendations();
    }, [fetchFounders, fetchRecommendations]);

    const allStartups = useMemo(() => {
        const combined = [...recommendations, ...founders];
        const seen = new Set();

        return combined.filter((item) => {
            const id = getProfileId(item);
            const name = getName(item).trim().toLowerCase();
            const key = id ? `id:${id}` : `name:${name}`;

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [recommendations, founders]);

    const recommendedFounders = useMemo(
        () =>
            recommendations.slice(0, 5).map((item) => ({
                ...item,
                _aiScore: getRecommendationScore(item),
                _isDatasetRecommendation: true,
            })),
        [recommendations]
    );

    const recommendedKeys = useMemo(
        () =>
            new Set(
                recommendedFounders.map((item) => {
                    const id = getProfileId(item);
                    return id ? `id:${id}` : `name:${getName(item).trim().toLowerCase()}`;
                })
            ),
        [recommendedFounders]
    );

    const industries = useMemo(
        () => [
            "All Industries",
            ...new Set(allStartups.map(getIndustry).filter(Boolean)),
        ],
        [allStartups]
    );

    const stages = useMemo(
        () => [
            "All Stages",
            ...new Set(allStartups.map(getStage).filter(Boolean)),
        ],
        [allStartups]
    );

    const locations = useMemo(
        () => [
            "All Locations",
            ...new Set(
                allStartups
                    .map(getLocation)
                    .filter(Boolean)
                    .map((value) => value.split(",").pop().trim())
            ),
        ],
        [allStartups]
    );

    useEffect(() => {
        setDatasetPage(1);
    }, [searchTerm, industry, stage, location, sortBy]);

    const remainingFounders = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        const filtered = allStartups.filter((startup) => {
            const id = getProfileId(startup);
            const key = id
                ? `id:${id}`
                : `name:${getName(startup).trim().toLowerCase()}`;

            if (recommendedKeys.has(key)) return false;

            const searchableText = [
                getName(startup),
                getIndustry(startup),
                getStage(startup),
                getLocation(startup),
                getDescription(startup),
            ]
                .join(" ")
                .toLowerCase();

            return (
                (!search || searchableText.includes(search)) &&
                (industry === "All Industries" || getIndustry(startup) === industry) &&
                (stage === "All Stages" || getStage(startup) === stage) &&
                (location === "All Locations" ||
                    getLocation(startup).toLowerCase().includes(location.toLowerCase()))
            );
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === "name") return getName(a).localeCompare(getName(b));
            if (sortBy === "industry") return getIndustry(a).localeCompare(getIndustry(b));
            if (sortBy === "stage") return getStage(a).localeCompare(getStage(b));
            if (sortBy === "location") return getLocation(a).localeCompare(getLocation(b));
            if (sortBy === "newest")
                return Number(getFounded(b) || 0) - Number(getFounded(a) || 0);
            return 0;
        });
    }, [allStartups, recommendedKeys, searchTerm, industry, stage, location, sortBy]);

    const toggleSave = (id) => {
        if (!id) return;

        setSavedStartups((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    const expressInterest = async (founder) => {
        const id = getProfileId(founder);

        if (!id || founder._isDatasetRecommendation || connectedStartups.includes(id) || connectingId) {
            if (founder._isDatasetRecommendation) {
                window.alert("This is a public AI dataset record. Connecting is available when the startup has a registered StartupSync account.");
            }
            return;
        }

        try {
            setConnectingId(id);
            const token = localStorage.getItem("startupsync_token");
            if (!token) throw new Error("Please log in again.");

            await api.post(
                `/connections/founders/${encodeURIComponent(id)}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setConnectedStartups((current) =>
                current.includes(id) ? current : [...current, id]
            );
            window.alert("Your interest has been sent successfully.");
        } catch (err) {
            window.alert(
                err.response?.data?.message ||
                err.message ||
                "Unable to send your interest. Please try again."
            );
        } finally {
            setConnectingId("");
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setIndustry("All Industries");
        setStage("All Stages");
        setLocation("All Locations");
        setSortBy("name");
    };

    const renderFounderCard = (founder, recommended = false) => {
        const id = getProfileId(founder);
        const isDataset = Boolean(founder._isDatasetRecommendation);
        const isSaved = savedStartups.includes(id);
        const isConnected = connectedStartups.includes(id);
        const score = founder._aiScore;

        return (
            <article className="investor-startup-card" key={id || getName(founder)}>
                <div className="startup-card-top">
                    <div className="startup-logo">
                        <Rocket size={23} />
                    </div>

                    <div className="startup-card-title">
                        <h3>{getName(founder)}</h3>
                        <span>{getIndustry(founder) || "Industry not specified"}</span>
                    </div>

                    <button
                        type="button"
                        className={`startup-save-button ${isSaved ? "startup-save-active" : ""}`}
                        onClick={() => toggleSave(id)}
                        aria-label={isSaved ? "Remove saved startup" : "Save startup"}
                        title={isSaved ? "Remove saved startup" : "Save startup"}
                    >
                        <Bookmark size={19} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>

                {recommended && (
                    <div className="startup-match">
                        <span>AI Recommended</span>
                        {score !== null && score !== undefined && <strong>{score}% match</strong>}
                    </div>
                )}

                <p className="startup-tagline">{getDescription(founder)}</p>

                <div className="startup-details">
                    <div className="startup-detail">
                        <MapPin size={16} />
                        <span>{getLocation(founder) || "Location not provided"}</span>
                    </div>

                    <div className="startup-detail">
                        <UsersRound size={16} />
                        <span>
                            {getTeamSize(founder)
                                ? `${getTeamSize(founder)} team members`
                                : "Team size not provided"}
                        </span>
                    </div>

                    <div className="startup-detail">
                        <span className="startup-detail-label">Stage</span>
                        <span>{getStage(founder) || "Not specified"}</span>
                    </div>

                    <div className="startup-detail">
                        <span className="startup-detail-label">Funding</span>
                        <span>{getFunding(founder) || "Not specified"}</span>
                    </div>

                    <div className="startup-detail">
                        <span className="startup-detail-label">Founded</span>
                        <span>{getFounded(founder) || "Not specified"}</span>
                    </div>
                </div>

                <div className="startup-card-actions">
                    <button
                        type="button"
                        className="btn btn-secondary startup-view-button"
                        onClick={() =>
                            navigate(
                                `/dashboard/investor/profile-view/founder/${getProfileId(founder)}`,
                                {
                                    state: {
                                        profile: founder,
                                    },
                                }
                            )
                        }
                    >
                        View Profile
                        <ExternalLink size={16} />
                    </button>

                    <button
                        type="button"
                        className={`btn startup-connect-button ${isConnected ? "startup-connected" : "btn-primary"
                            }`}
                        disabled={isDataset || isConnected || connectingId === id || !id}
                        onClick={() => expressInterest(founder)}
                    >
                        {isConnected ? (
                            <>
                                <Check size={16} />
                                Interest Sent
                            </>
                        ) : isDataset ? (
                            "Dataset Profile"
                        ) : connectingId === id ? (
                            "Sending..."
                        ) : (
                            "Express Interest"
                        )}
                    </button>
                </div>
            </article>
        );
    };

    return (
        <div className="investor-discover-page">
            <section className="investor-discover-header">
                <div>
                    <span className="investor-discover-badge">
                        <Rocket size={15} />
                        Startup Discovery
                    </span>
                    <h2>Discover Startups</h2>
                    <p>
                        Discover AI-recommended startups and explore the StartupSync ecosystem.
                    </p>
                </div>

                <div className="investor-discover-summary">
                    <strong>{allStartups.length}</strong>
                    <span>Available Startups</span>
                </div>
            </section>

            <section style={{ margin: "24px 0 14px" }}>
                <h3>Top 5 AI Recommendations</h3>
                <p>Startups recommended for your investor profile.</p>
            </section>

            {aiLoading ? (
                <p>Loading AI recommendations...</p>
            ) : aiError ? (
                <section className="investor-empty-state">
                    <h3>Recommendations unavailable</h3>
                    <p>{aiError}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={fetchRecommendations}
                    >
                        Retry Recommendations
                    </button>
                </section>
            ) : recommendedFounders.length > 0 ? (
                <section className="investor-startup-grid">
                    {recommendedFounders.map((founder) => renderFounderCard(founder, true))}
                </section>
            ) : (
                <section className="investor-empty-state">
                    <div className="investor-empty-icon">
                        <Rocket size={28} />
                    </div>
                    <h3>No AI recommendations returned</h3>
                    <p>The AI API did not return any recommendation records.</p>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={fetchRecommendations}
                    >
                        Retry
                    </button>
                </section>
            )}

            <section style={{ margin: "32px 0 14px" }}>
                <h3>Explore All Other Startups</h3>
                <p>Search, filter, and sort available dataset records and registered founder profiles.</p>
            </section>

            <section className="investor-search-panel">
                <div className="investor-search-box">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search startups, industries or locations..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="investor-search-clear"
                            onClick={() => setSearchTerm("")}
                            aria-label="Clear search"
                        >
                            <X size={17} />
                        </button>
                    )}
                </div>

                <div className="investor-filter-title">
                    <Filter size={17} />
                    <span>Filters and Sorting</span>
                </div>

                <div className="investor-filter-grid">
                    <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
                        {industries.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select value={stage} onChange={(event) => setStage(event.target.value)}>
                        {stages.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select value={location} onChange={(event) => setLocation(event.target.value)}>
                        {locations.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        aria-label="Sort startups"
                    >
                        <option value="name">Sort: Name A–Z</option>
                        <option value="industry">Sort: Industry</option>
                        <option value="stage">Sort: Stage</option>
                        <option value="location">Sort: Location</option>
                        <option value="newest">Sort: Newest Founded</option>
                    </select>

                    {(searchTerm ||
                        industry !== "All Industries" ||
                        stage !== "All Stages" ||
                        location !== "All Locations" ||
                        sortBy !== "name") && (
                            <button
                                type="button"
                                className="investor-clear-filters"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                </div>
            </section>

            {loading ? (
                <p>Loading founder profiles...</p>
            ) : error ? (
                <section className="investor-empty-state">
                    <h3>Unable to load registered founder profiles</h3>
                    <p>{error}</p>
                    <button type="button" className="btn btn-primary" onClick={fetchFounders}>
                        Retry
                    </button>
                </section>
            ) : remainingFounders.length > 0 ? (
                <>
                    <p style={{ margin: "18px 0" }}>
                        {remainingFounders.length} other startup
                        {remainingFounders.length !== 1 ? "s" : ""} found
                    </p>
                    <section className="investor-startup-grid">
                        {remainingFounders.map((founder) => renderFounderCard(founder))}
                    </section>
                </>
            ) : (
                <section className="investor-empty-state">
                    <div className="investor-empty-icon">
                        <Search size={28} />
                    </div>
                    <h3>No other startups found</h3>
                    <p>Try changing your search or filter criteria.</p>
                    <button type="button" className="btn btn-primary" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </section>
            )}

            {selectedFounder && (
                <div
                    className="investor-notification-modal-overlay"
                    onClick={() => setSelectedFounder(null)}
                >
                    <div
                        className="investor-notification-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="investor-notification-modal-header">
                            <div className="investor-notification-modal-icon investor-notification-icon-startup">
                                <Rocket size={22} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedFounder(null)}
                                aria-label="Close profile"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="investor-notification-modal-body">
                            <h3>{getName(selectedFounder)}</h3>
                            <p>
                                <strong>Industry:</strong> {getIndustry(selectedFounder) || "Not specified"}
                            </p>
                            <p>
                                <strong>Stage:</strong> {getStage(selectedFounder) || "Not specified"}
                            </p>
                            <p>
                                <strong>Location:</strong> {getLocation(selectedFounder) || "Not specified"}
                            </p>
                            <p>
                                <strong>Team size:</strong> {getTeamSize(selectedFounder) || "Not specified"}
                            </p>
                            <p>
                                <strong>Funding sought:</strong> {getFunding(selectedFounder) || "Not specified"}
                            </p>
                            <p>
                                <strong>Description:</strong> {getDescription(selectedFounder)}
                            </p>
                        </div>

                        <div className="investor-notification-modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSelectedFounder(null)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={Boolean(selectedFounder._isDatasetRecommendation)}
                                onClick={() => {
                                    setSelectedFounder(null);
                                    expressInterest(selectedFounder);
                                }}
                            >
                                Express Interest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InvestorDiscoverStartups;