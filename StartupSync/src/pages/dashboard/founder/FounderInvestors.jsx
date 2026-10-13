import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Filter,
    MapPin,
    Search,
    TrendingUp,
    UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./FounderInvestors.css";

const getUserIdFromToken = (token) => {
    try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(window.atob(normalized));
        return decoded.userId || decoded.id || decoded._id || decoded.sub || "";
    } catch {
        return "";
    }
};

const normalize = (value = "") =>
    String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const formatInvestorType = (type = "") => {
    const types = {
        angel_investor: "Angel Investor",
        venture_capital: "Venture Capital",
        corporate_investor: "Corporate Investor",
        private_equity: "Private Equity",
        family_office: "Family Office",
        individual_investor: "Individual Investor",
    };
    return types[type] || type || "Investor";
};

const formatInvestmentRange = (minimum = 0, maximum = 0) => {
    const amount = (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Crore`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, "")} Lakhs`;
        return `₹${Number(value).toLocaleString("en-IN")}`;
    };
    if (!minimum && !maximum) return "Not specified";
    if (!minimum) return `Up to ${amount(maximum)}`;
    if (!maximum) return `${amount(minimum)}+`;
    return `${amount(minimum)} – ${amount(maximum)}`;
};

const getRangeCategory = (minimum = 0, maximum = 0) => {
    if (!minimum && !maximum) return "Not specified";
    if (maximum > 0 && maximum <= 2500000) return "Up to ₹25 Lakhs";
    if (maximum <= 5000000 && maximum > 2500000) return "₹25–50 Lakhs";
    if (maximum <= 10000000 && maximum > 5000000) return "₹50 Lakhs–₹1 Crore";
    if (maximum > 10000000 || minimum > 10000000) return "₹1 Crore+";
    return "Other";
};

const getAiName = (investor) =>
    investor.investor_name || investor.name || "Investor";

const getAiFirm = (investor) =>
    investor.firm_name || investor.company || "Investment firm";

const getAiScore = (investor) => {
    const score = Number(
        investor.score_percentage ?? (Number(investor.score) * 100)
    );
    return Number.isFinite(score) ? score : null;
};

function FounderInvestors() {
    const [investors, setInvestors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [stageFilter, setStageFilter] = useState("All");
    const [rangeFilter, setRangeFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [connectedInvestors, setConnectedInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [aiRecommendations, setAiRecommendations] = useState([]);
    const [aiLoading, setAiLoading] = useState(true);
    const [aiError, setAiError] = useState("");

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                setLoading(true);
                setError("");
                const token = localStorage.getItem("startupsync_token");
                const response = await api.get("/profiles/investors", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const records = response.data.investors || [];
                setInvestors(
                    records.map((investor) => ({
                        ...investor,
                        id: investor.id || investor._id,
                        name: investor.name || investor.firmName || "Unnamed Investor",
                        type: formatInvestorType(investor.type),
                        location: investor.location || "Location not provided",
                        stages: Array.isArray(investor.stages) ? investor.stages : [],
                        industries: [...new Set(investor.industries || [])],
                        range: formatInvestmentRange(
                            investor.minimumInvestment || 0,
                            investor.maximumInvestment || 0
                        ),
                        rangeCategory: getRangeCategory(
                            investor.minimumInvestment || 0,
                            investor.maximumInvestment || 0
                        ),
                    }))
                );
            } catch (err) {
                console.error("Unable to fetch investors:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load investors. Please check your login and backend."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchInvestors();
    }, []);

    useEffect(() => {
        const fetchAIRecommendations = async () => {
            try {
                setAiLoading(true);
                setAiError("");
                const token = localStorage.getItem("startupsync_token");
                if (!token) throw new Error("Please log in again to view AI recommendations.");
                const userId = getUserIdFromToken(token);
                if (!userId) throw new Error("Could not identify your account from the login token.");

                const response = await api.get(
                    `/recommendations/founder/${encodeURIComponent(userId)}/investors`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const recommendations =
                    response.data?.data?.recommendations ||
                    response.data?.recommendations ||
                    [];
                setAiRecommendations(Array.isArray(recommendations) ? recommendations : []);
            } catch (err) {
                console.error("Unable to fetch AI recommendations:", err);
                setAiError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load AI recommendations."
                );
            } finally {
                setAiLoading(false);
            }
        };
        fetchAIRecommendations();
    }, []);

    // Only match an AI dataset recommendation to a registered MongoDB account
    // when name or firm matches. Dataset IDs are not valid account IDs.
    const findMongoInvestor = (recommendation) => {
        const recName = normalize(getAiName(recommendation));
        const recFirm = normalize(getAiFirm(recommendation));
        return investors.find((investor) => {
            const mongoName = normalize(investor.name);
            const mongoFirm = normalize(investor.firmName || investor.firm_name || "");
            return (
                (recName && mongoName === recName) ||
                (recFirm && mongoFirm && recFirm === mongoFirm)
            );
        });
    };

    const recommendedMongoIds = useMemo(() => {
        return new Set(
            aiRecommendations
                .map((rec) => {
                    const recName = normalize(getAiName(rec));
                    const recFirm = normalize(getAiFirm(rec));
                    const match = investors.find((investor) => {
                        const nameMatch = recName && normalize(investor.name) === recName;
                        const firmMatch =
                            recFirm &&
                            normalize(investor.firmName || investor.firm_name || "") === recFirm;
                        return nameMatch || firmMatch;
                    });
                    return match?.id;
                })
                .filter(Boolean)
        );
    }, [aiRecommendations, investors]);

    const filteredInvestors = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();
        const remaining = investors.filter((investor) => !recommendedMongoIds.has(investor.id));
        const filtered = remaining.filter((investor) => {
            const matchesSearch =
                !search ||
                investor.name.toLowerCase().includes(search) ||
                investor.type.toLowerCase().includes(search) ||
                investor.location.toLowerCase().includes(search) ||
                (investor.firmName || investor.firm_name || "").toLowerCase().includes(search) ||
                investor.industries.some((industry) => industry.toLowerCase().includes(search));
            const matchesType = typeFilter === "All" || investor.type === typeFilter;
            const matchesStage =
                stageFilter === "All" ||
                investor.stages.some((stage) => normalize(stage) === normalize(stageFilter));
            const matchesRange =
                rangeFilter === "All" || investor.rangeCategory === rangeFilter;
            return matchesSearch && matchesType && matchesStage && matchesRange;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "oldest") {
                return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            }
            if (sortBy === "score") {
                // Non-AI accounts have no score, so keep them below scored recommendations.
                return (Number(b.score) || 0) - (Number(a.score) || 0);
            }
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    }, [investors, searchTerm, typeFilter, stageFilter, rangeFilter, sortBy, recommendedMongoIds]);

    const handleConnect = async (investorId) => {
        try {
            const token = localStorage.getItem("startupsync_token");
            if (!token) {
                window.alert("Please log in again.");
                return;
            }
            const response = await api.post(
                `/connections/investors/${investorId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setConnectedInvestors((current) =>
                    current.includes(investorId) ? current : [...current, investorId]
                );
                window.alert("Connection request sent successfully!");
            }
        } catch (err) {
            window.alert(
                err.response?.data?.message ||
                "Unable to send connection request. Please try again."
            );
        }
    };

    const renderInvestorActions = (mongoInvestor) => {
        if (!mongoInvestor?.id) {
            return (
                <div className="founder-investor-actions">
                    <button
                        type="button"
                        className="founder-investor-view-button"
                        onClick={() =>
                            window.alert(
                                "This recommendation comes from the AI dataset and does not have a registered StartupSync investor account yet."
                            )
                        }
                    >
                        Dataset Profile <ArrowRight size={15} />
                    </button>
                    <button type="button" className="founder-investor-connect-button" disabled>
                        Account unavailable
                    </button>
                </div>
            );
        }

        const isConnected = connectedInvestors.includes(mongoInvestor.id);
        return (
            <div className="founder-investor-actions">
                <button
                    type="button"
                    className="founder-investor-view-button"
                    onClick={() =>
                        window.alert(
                            `${mongoInvestor.name}\n\n${mongoInvestor.bio ||
                            mongoInvestor.investmentThesis ||
                            "No additional profile description provided."
                            }`
                        )
                    }
                >
                    View Profile <ArrowRight size={15} />
                </button>
                <button
                    type="button"
                    className={`founder-investor-connect-button ${isConnected ? "founder-investor-connected" : ""
                        }`}
                    onClick={() => handleConnect(mongoInvestor.id)}
                    disabled={isConnected}
                >
                    {isConnected ? <><CheckCircle2 size={15} /> Request Sent</> : "Connect"}
                </button>
            </div>
        );
    };

    const stages = ["Idea", "Pre-Seed", "Seed", "Series A", "Growth"];
    const ranges = [
        "Up to ₹25 Lakhs",
        "₹25–50 Lakhs",
        "₹50 Lakhs–₹1 Crore",
        "₹1 Crore+",
        "Other",
        "Not specified",
    ];

    return (
        <div className="founder-investors-page">
            <section className="founder-investors-header">
                <div>
                    <span className="founder-investors-badge">Investor Discovery</span>
                    <h2>Find Investors</h2>
                    <p>Discover investors who match your startup&apos;s industry, stage and funding requirements.</p>
                </div>
            </section>

            <section className="founder-investors-ai-section" style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 6 }}>Top 5 AI Recommendations</h3>
                    <p style={{ color: "#64748b", margin: 0 }}>
                        Suggested by the StartupSync AI recommendation engine
                    </p>
                </div>

                {aiLoading ? (
                    <section className="founder-investors-empty"><p>Finding investors for your startup...</p></section>
                ) : aiError ? (
                    <section className="founder-investors-empty"><p>{aiError}</p></section>
                ) : aiRecommendations.length ? (
                    <section className="founder-investors-grid">
                        {aiRecommendations.slice(0, 5).map((investor, index) => {
                            const score = getAiScore(investor);
                            const mongoInvestor = findMongoInvestor(investor);
                            const name = getAiName(investor);
                            const firm = getAiFirm(investor);
                            const stagesText = investor.funding_stage || investor.investment_stages || "Not specified";
                            return (
                                <article
                                    className="founder-investor-card"
                                    key={`${investor.investor_id || investor.id || firm}-${index}`}
                                >
                                    <div className="founder-investor-card-top">
                                        <div className="founder-investor-avatar">{name.charAt(0).toUpperCase()}</div>
                                        <div className="founder-investor-heading">
                                            <h4>{name}</h4>
                                            <span>{firm}</span>
                                        </div>
                                        <div className="founder-investor-match">
                                            <strong>{score !== null ? `${score.toFixed(1)}%` : "—"}</strong>
                                            <span>Relative match</span>
                                        </div>
                                    </div>
                                    <div className="founder-investor-details">
                                        <div>
                                            <span>Investment Stages</span>
                                            <strong>{stagesText}</strong>
                                        </div>
                                        <div>
                                            <span>Investor Status</span>
                                            <strong>{investor.active === true ? "Active" : "Status unverified"}</strong>
                                        </div>
                                    </div>
                                    <div className="founder-investor-network">
                                        <TrendingUp size={15} />
                                        <span>Recommended by StartupSync AI</span>
                                    </div>
                                    {mongoInvestor && (
                                        <div className="founder-investor-location">
                                            <MapPin size={14} /> {mongoInvestor.location}
                                        </div>
                                    )}
                                    {renderInvestorActions(mongoInvestor)}
                                </article>
                            );
                        })}
                    </section>
                ) : (
                    <section className="founder-investors-empty"><p>No AI recommendations were returned for this profile.</p></section>
                )}
                <p style={{ color: "#64748b", fontSize: 12, marginTop: 10 }}>
                    Match percentages are ranking scores, not probabilities of receiving funding.
                </p>
            </section>

            <section className="founder-investors-filters">
                <div className="founder-investors-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search investors, firms, industries or locations..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <div className="founder-investors-filter-row">
                    <div className="founder-investors-filter">
                        <Filter size={15} />
                        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                            <option value="All">All Investor Types</option>
                            <option value="Angel Investor">Angel Investor</option>
                            <option value="Venture Capital">Venture Capital</option>
                            <option value="Corporate Investor">Corporate Investor</option>
                            <option value="Private Equity">Private Equity</option>
                            <option value="Family Office">Family Office</option>
                            <option value="Individual Investor">Individual Investor</option>
                        </select>
                    </div>
                    <div className="founder-investors-filter">
                        <TrendingUp size={15} />
                        <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
                            <option value="All">All Stages</option>
                            {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                    </div>
                    <div className="founder-investors-filter">
                        <Building2 size={15} />
                        <select value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value)}>
                            <option value="All">All Investment Ranges</option>
                            {ranges.map((range) => <option key={range} value={range}>{range}</option>)}
                        </select>
                    </div>
                    <div className="founder-investors-filter">
                        <TrendingUp size={15} />
                        <select aria-label="Sort investors" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                            <option value="newest">Sort: Newest</option>
                            <option value="oldest">Sort: Oldest</option>
                            <option value="name">Sort: Name A–Z</option>
                            <option value="score">Sort: Match score</option>
                        </select>
                    </div>
                </div>
            </section>

            <div className="founder-investors-results-header">
                <div>
                    <h3>More Investors</h3>
                    <p>{loading ? "Loading investor profiles..." : `${filteredInvestors.length} investor${filteredInvestors.length !== 1 ? "s" : ""} found`}</p>
                </div>
            </div>

            {loading ? (
                <section className="founder-investors-empty"><p>Loading investor profiles from the database...</p></section>
            ) : error ? (
                <section className="founder-investors-empty">
                    <h3>Could not load investors</h3>
                    <p>{error}</p>
                    <button type="button" className="founder-investor-view-button" onClick={() => window.location.reload()}>Try Again</button>
                </section>
            ) : filteredInvestors.length ? (
                <section className="founder-investors-grid">
                    {filteredInvestors.map((investor) => {
                        const isConnected = connectedInvestors.includes(investor.id);
                        return (
                            <article className="founder-investor-card" key={investor.id}>
                                <div className="founder-investor-card-top">
                                    <div className="founder-investor-avatar">{investor.name.charAt(0).toUpperCase()}</div>
                                    <div className="founder-investor-heading">
                                        <h4>{investor.name}</h4>
                                        <span>{investor.type}</span>
                                    </div>
                                    <div className="founder-investor-match"><strong>—</strong><span>Match</span></div>
                                </div>
                                <div className="founder-investor-location"><MapPin size={14} /> {investor.location}</div>
                                <div className="founder-investor-details">
                                    <div><span>Investment Range</span><strong>{investor.range}</strong></div>
                                    <div><span>Startup Stages</span><strong>{investor.stages.length ? investor.stages.join(" • ") : "Not specified"}</strong></div>
                                </div>
                                <div className="founder-investor-industries">
                                    {investor.industries.length
                                        ? investor.industries.map((industry) => <span key={industry}>{industry}</span>)
                                        : <span>Industries not specified</span>}
                                </div>
                                <div className="founder-investor-network"><UsersRound size={15} /><span>Investor profile from MongoDB</span></div>
                                <div className="founder-investor-actions">
                                    <button
                                        type="button"
                                        className="founder-investor-view-button"
                                        onClick={() => window.alert(`${investor.name}\n\n${investor.bio || investor.investmentThesis || "No additional profile description provided."}`)}
                                    >View Profile <ArrowRight size={15} /></button>
                                    <button
                                        type="button"
                                        className={`founder-investor-connect-button ${isConnected ? "founder-investor-connected" : ""}`}
                                        onClick={() => handleConnect(investor.id)}
                                        disabled={isConnected}
                                    >
                                        {isConnected ? <><CheckCircle2 size={15} /> Request Sent</> : "Connect"}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : (
                <section className="founder-investors-empty">
                    <div className="founder-investors-empty-icon"><Search size={25} /></div>
                    <h3>No other investors found</h3>
                    <p>{investors.length === 0 ? "No completed investor profiles are currently available." : "Try changing your search or filter criteria."}</p>
                </section>
            )}
        </div>
    );
}

export default FounderInvestors;
