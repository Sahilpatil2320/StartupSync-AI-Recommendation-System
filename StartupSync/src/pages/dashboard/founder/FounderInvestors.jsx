import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Filter,
    MapPin,
    Search,
    TrendingUp,
    UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./FounderInvestors.css";

const formatInvestorType = (type = "") => {
    const types = {
        angel_investor: "Angel Investor",
        venture_capital: "Venture Capital",
        corporate_investor: "Corporate Investor",
        private_equity: "Private Equity",
        family_office: "Family Office",
        individual_investor: "Individual Investor"
    };

    return types[type] || type || "Investor";
};

const formatInvestmentRange = (minimum, maximum) => {
    const formatAmount = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, "")} Crore`;
        }

        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, "")} Lakhs`;
        }

        return `₹${amount.toLocaleString("en-IN")}`;
    };

    if (!minimum && !maximum) return "Not specified";
    if (!minimum) return `Up to ${formatAmount(maximum)}`;
    if (!maximum) return `${formatAmount(minimum)}+`;

    return `${formatAmount(minimum)} – ${formatAmount(maximum)}`;
};

const getRangeCategory = (minimum = 0, maximum = 0) => {
    if (!minimum && !maximum) return "Not specified";
    if (maximum > 0 && maximum <= 2500000) return "Up to ₹25 Lakhs";
    if (maximum > 2500000 && maximum <= 5000000) return "₹25–50 Lakhs";
    if (maximum > 5000000 && maximum <= 10000000) return "₹50 Lakhs–₹1 Crore";
    if (maximum > 10000000 || minimum > 10000000) return "₹1 Crore+";

    return "Other";
};

function FounderInvestors() {
    const [investors, setInvestors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [stageFilter, setStageFilter] = useState("All");
    const [rangeFilter, setRangeFilter] = useState("All");
    const [connectedInvestors, setConnectedInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("startupsync_token");

                const response = await api.get("/profiles/investors", {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {}
                });

                const records = response.data.investors || [];

                const formattedInvestors = records.map((investor) => ({
                    ...investor,
                    id: investor.id,
                    name: investor.name || "Unnamed Investor",
                    type: formatInvestorType(investor.type),
                    location: investor.location || "Location not provided",
                    stages: investor.stages || [],
                    industries: [
                        ...new Set(investor.industries || [])
                    ],
                    range: formatInvestmentRange(
                        investor.minimumInvestment || 0,
                        investor.maximumInvestment || 0
                    ),
                    rangeCategory: getRangeCategory(
                        investor.minimumInvestment || 0,
                        investor.maximumInvestment || 0
                    )
                }));

                setInvestors(formattedInvestors);
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

    const filteredInvestors = useMemo(() => {
        return investors.filter((investor) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                investor.name.toLowerCase().includes(search) ||
                investor.type.toLowerCase().includes(search) ||
                investor.location.toLowerCase().includes(search) ||
                investor.industries.some((industry) =>
                    industry.toLowerCase().includes(search)
                );

            const matchesType =
                typeFilter === "All" || investor.type === typeFilter;

            const matchesStage =
                stageFilter === "All" || investor.stages.includes(stageFilter);

            const matchesRange =
                rangeFilter === "All" ||
                investor.rangeCategory === rangeFilter;

            return matchesSearch && matchesType && matchesStage && matchesRange;
        });
    }, [investors, searchTerm, typeFilter, stageFilter, rangeFilter]);


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
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setConnectedInvestors((current) =>
                    current.includes(investorId)
                        ? current
                        : [...current, investorId]
                );

                window.alert("Connection request sent successfully!");
            }
        } catch (error) {
            window.alert(
                error.response?.data?.message ||
                "Unable to send connection request. Please try again."
            );
        }
    };


    return (
        <div className="founder-investors-page">
            <section className="founder-investors-header">
                <div>
                    <span className="founder-investors-badge">
                        Investor Discovery
                    </span>

                    <h2>Find Investors</h2>

                    <p>
                        Discover investors who match your startup's
                        industry, stage and funding requirements.
                    </p>
                </div>
            </section>

            <section className="founder-investors-filters">
                <div className="founder-investors-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search investors, industries or locations..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>

                <div className="founder-investors-filter-row">
                    <div className="founder-investors-filter">
                        <Filter size={15} />

                        <select
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                        >
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

                        <select
                            value={stageFilter}
                            onChange={(event) => setStageFilter(event.target.value)}
                        >
                            <option value="All">All Stages</option>
                            <option value="Idea">Idea</option>
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                            <option value="Growth">Growth</option>
                        </select>
                    </div>

                    <div className="founder-investors-filter">
                        <Building2 size={15} />

                        <select
                            value={rangeFilter}
                            onChange={(event) => setRangeFilter(event.target.value)}
                        >
                            <option value="All">All Investment Ranges</option>
                            <option value="Up to ₹25 Lakhs">Up to ₹25 Lakhs</option>
                            <option value="₹25–50 Lakhs">₹25–50 Lakhs</option>
                            <option value="₹50 Lakhs–₹1 Crore">
                                ₹50 Lakhs–₹1 Crore
                            </option>
                            <option value="₹1 Crore+">₹1 Crore+</option>
                            <option value="Other">Other</option>
                            <option value="Not specified">Not specified</option>
                        </select>
                    </div>
                </div>
            </section>

            <div className="founder-investors-results-header">
                <div>
                    <h3>Recommended Investors</h3>
                    <p>
                        {loading
                            ? "Loading investor profiles..."
                            : `${filteredInvestors.length} investor${filteredInvestors.length !== 1 ? "s" : ""
                            } found`}
                    </p>
                </div>
            </div>

            {loading ? (
                <section className="founder-investors-empty">
                    <p>Loading investor profiles from the database...</p>
                </section>
            ) : error ? (
                <section className="founder-investors-empty">
                    <h3>Could not load investors</h3>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="founder-investor-view-button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </section>
            ) : filteredInvestors.length > 0 ? (
                <section className="founder-investors-grid">
                    {filteredInvestors.map((investor) => {
                        const isConnected = connectedInvestors.includes(investor.id);

                        return (
                            <article
                                className="founder-investor-card"
                                key={investor.id}
                            >
                                <div className="founder-investor-card-top">
                                    <div className="founder-investor-avatar">
                                        {investor.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="founder-investor-heading">
                                        <h4>{investor.name}</h4>
                                        <span>{investor.type}</span>
                                    </div>

                                    <div className="founder-investor-match">
                                        <strong>—</strong>
                                        <span>Match</span>
                                    </div>
                                </div>

                                <div className="founder-investor-location">
                                    <MapPin size={14} />
                                    {investor.location}
                                </div>

                                <div className="founder-investor-details">
                                    <div>
                                        <span>Investment Range</span>
                                        <strong>{investor.range}</strong>
                                    </div>

                                    <div>
                                        <span>Startup Stages</span>
                                        <strong>
                                            {investor.stages.length
                                                ? investor.stages.join(" • ")
                                                : "Not specified"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="founder-investor-industries">
                                    {investor.industries.length ? (
                                        investor.industries.map((industry) => (
                                            <span key={industry}>{industry}</span>
                                        ))
                                    ) : (
                                        <span>Industries not specified</span>
                                    )}
                                </div>

                                <div className="founder-investor-network">
                                    <UsersRound size={15} />
                                    <span>Investor profile from MongoDB</span>
                                </div>

                                <div className="founder-investor-actions">
                                    <button
                                        type="button"
                                        className="founder-investor-view-button"
                                        onClick={() =>
                                            window.alert(
                                                `${investor.name}\n\n${investor.bio || investor.investmentThesis || "No additional profile description provided."}`
                                            )
                                        }
                                    >
                                        View Profile
                                        <ArrowRight size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        className={`founder-investor-connect-button ${isConnected ? "founder-investor-connected" : ""
                                            }`}
                                        onClick={() => handleConnect(investor.id)}
                                        disabled={isConnected}
                                    >
                                        {isConnected ? (
                                            <>
                                                <CheckCircle2 size={15} />
                                                Request Sent
                                            </>
                                        ) : (
                                            "Connect"
                                        )}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : (
                <section className="founder-investors-empty">
                    <div className="founder-investors-empty-icon">
                        <Search size={25} />
                    </div>

                    <h3>No investors found</h3>
                    <p>
                        {investors.length === 0
                            ? "No completed investor profiles are currently available."
                            : "Try changing your search or filter criteria."}
                    </p>
                </section>
            )}
        </div>
    );
}

export default FounderInvestors;