import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Users,
  Rocket,
  BriefcaseBusiness,
  Handshake,
  Network,
  Search,
  ArrowRight,
  MapPin,
  Building2,
  X,
  TrendingUp,
  ChartNoAxesCombined,
} from "lucide-react";

import api from "../../../services/api";
import "./InvestorEcosystem.css";

const ROLE_CONFIG = {
  founder: { label: "Founders", color: "#7c3aed" },
  investor: { label: "Investors", color: "#059669" },
  mentor: { label: "Mentors", color: "#d97706" },
  student: { label: "Students", color: "#2563eb" },
  industry: { label: "Industries", color: "#64748b" },
};

const FILTERS = [
  { value: "all", label: "All Members" },
  { value: "founder", label: "Founders" },
  { value: "investor", label: "Investors" },
  { value: "mentor", label: "Mentors" },
  { value: "student", label: "Students" },
  { value: "industry", label: "Industries" },
];

const getRole = (node) =>
  String(node?.role || node?.type || "").toLowerCase();

const getId = (node) => String(node?._id || node?.id || "");

const getName = (node) =>
  node?.name ||
  node?.label ||
  node?.startupName ||
  node?.firmName ||
  "StartupSync Member";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "SS";

function InvestorEcosystem() {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    industriesCount: 0,
  });

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEcosystem = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const response = await api.get("/ecosystem/graph");
      const data = response.data || {};

      if (data.success === false) {
        throw new Error(data.message || "Unable to load ecosystem.");
      }

      const graphNodes = Array.isArray(data.nodes) ? data.nodes : [];
      const graphEdges = Array.isArray(data.edges) ? data.edges : [];

      setNodes(graphNodes);
      setEdges(graphEdges);

      setStats({
        totalNodes: Number(data.stats?.totalNodes ?? graphNodes.length),
        totalEdges: Number(data.stats?.totalEdges ?? graphEdges.length),
        industriesCount: Number(
          data.stats?.industriesCount ??
            graphNodes.filter((node) => getRole(node) === "industry").length
        ),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load the ecosystem."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEcosystem();
  }, [loadEcosystem]);

  const roleCounts = useMemo(() => {
    const counts = {
      founder: 0,
      investor: 0,
      mentor: 0,
      student: 0,
      industry: 0,
    };

    nodes.forEach((node) => {
      const role = getRole(node);
      if (Object.prototype.hasOwnProperty.call(counts, role)) {
        counts[role] += 1;
      }
    });

    return counts;
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return nodes.filter((node) => {
      const role = getRole(node);
      const matchesRole = activeFilter === "all" || role === activeFilter;

      const text = [
        getName(node),
        node?.metadata?.industry,
        node?.metadata?.expertise,
        node?.metadata?.location,
        node?.metadata?.investorType,
        node?.metadata?.startupName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesRole && (!query || text.includes(query));
    });
  }, [nodes, activeFilter, searchTerm]);

  const positions = useMemo(() => {
    const result = {};

    const rolePositions = {
      founder: { x: 220, y: 270 },
      investor: { x: 500, y: 100 },
      mentor: { x: 780, y: 270 },
      student: { x: 350, y: 500 },
      industry: { x: 650, y: 500 },
    };

    const groups = Object.keys(rolePositions).reduce((acc, role) => {
      acc[role] = filteredNodes.filter((node) => getRole(node) === role);
      return acc;
    }, {});

    Object.entries(groups).forEach(([role, group]) => {
      const base = rolePositions[role];
      const radius = role === "industry" ? 85 : 105;

      group.forEach((node, index) => {
        const angle =
          (2 * Math.PI * index) / Math.max(group.length, 1) -
          Math.PI / 2;

        const spread = group.length === 1 ? 0 : radius;

        result[getId(node)] = {
          x: base.x + Math.cos(angle) * spread,
          y: base.y + Math.sin(angle) * spread,
        };
      });
    });

    return result;
  }, [filteredNodes]);

  const visibleIds = useMemo(
    () => new Set(filteredNodes.map(getId)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(
    () =>
      edges.filter((edge) => {
        const source = String(
          edge.source?._id ||
            edge.source?.id ||
            edge.source ||
            edge.from ||
            edge.sourceId ||
            ""
        );

        const target = String(
          edge.target?._id ||
            edge.target?.id ||
            edge.target ||
            edge.to ||
            edge.targetId ||
            ""
        );

        return visibleIds.has(source) && visibleIds.has(target);
      }),
    [edges, visibleIds]
  );

  const getEndpoint = (edge, side) => {
    const value =
      side === "source"
        ? edge.source || edge.from || edge.sourceId
        : edge.target || edge.to || edge.targetId;

    return String(value?._id || value?.id || value || "");
  };

  const goTo = (path) => navigate(path);

  if (loading) {
    return (
      <div className="investor-ecosystem-page">
        <div className="investor-ecosystem-loading">
          <div className="investor-ecosystem-spinner" />
          <h3>Loading Investor Ecosystem</h3>
          <p>Discovering startups and investment connections...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="investor-ecosystem-page">
      {/* Header */}
      <header className="investor-ecosystem-header">
        <div>
          <span className="investor-ecosystem-badge">
            <ChartNoAxesCombined size={15} />
            Investor Network
          </span>

          <h1>Explore the Startup Ecosystem</h1>

          <p>
            Discover promising founders, connect with co-investors,
            explore industries, and expand your investment network.
          </p>
        </div>

        <button
          type="button"
          className="investor-ecosystem-refresh"
          onClick={() => loadEcosystem(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "investor-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="investor-ecosystem-error" role="alert">
          {error}
          <button type="button" onClick={() => loadEcosystem(true)}>
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="investor-ecosystem-stats">
        <div className="investor-ecosystem-stat">
          <div className="investor-stat-icon purple">
            <Rocket size={21} />
          </div>
          <div>
            <span>Startups / Founders</span>
            <strong>{roleCounts.founder}</strong>
          </div>
        </div>

        <div className="investor-ecosystem-stat">
          <div className="investor-stat-icon green">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <span>Investors</span>
            <strong>{roleCounts.investor}</strong>
          </div>
        </div>

        <div className="investor-ecosystem-stat">
          <div className="investor-stat-icon orange">
            <Handshake size={21} />
          </div>
          <div>
            <span>Mentors</span>
            <strong>{roleCounts.mentor}</strong>
          </div>
        </div>

        <div className="investor-ecosystem-stat">
          <div className="investor-stat-icon blue">
            <Network size={21} />
          </div>
          <div>
            <span>Network Relationships</span>
            <strong>{stats.totalEdges}</strong>
          </div>
        </div>
      </div>

      {/* Investor shortcuts */}
      <div className="investor-ecosystem-section-heading">
        <div>
          <h2>Investor Workspace</h2>
          <p>Access your core investment activities.</p>
        </div>
      </div>

      <div className="investor-ecosystem-action-grid">
        <button
          type="button"
          className="investor-ecosystem-action-card"
          onClick={() => goTo("/dashboard/investor/startups")}
        >
          <div className="investor-action-icon purple">
            <Rocket size={22} />
          </div>
          <div>
            <h3>Discover Startups</h3>
            <p>Explore startups and potential investment opportunities.</p>
          </div>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="investor-ecosystem-action-card"
          onClick={() => goTo("/dashboard/investor/investments")}
        >
          <div className="investor-action-icon green">
            <TrendingUp size={22} />
          </div>
          <div>
            <h3>My Investments</h3>
            <p>Review your existing investment activity.</p>
          </div>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="investor-ecosystem-action-card"
          onClick={() => goTo("/dashboard/investor/messages")}
        >
          <div className="investor-action-icon blue">
            <Users size={22} />
          </div>
          <div>
            <h3>Network & Messages</h3>
            <p>Communicate with founders and ecosystem members.</p>
          </div>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="investor-ecosystem-action-card"
          onClick={() => goTo("/dashboard/investor/notifications")}
        >
          <div className="investor-action-icon orange">
            <Handshake size={22} />
          </div>
          <div>
            <h3>Notifications</h3>
            <p>Stay informed about your StartupSync activity.</p>
          </div>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Network map */}
      <div className="investor-ecosystem-graph-card">
        <div className="investor-ecosystem-graph-header">
          <div>
            <h2>Startup & Investment Network</h2>
            <p>
              Explore the relationships between founders, investors,
              mentors, students, and industries.
            </p>
          </div>

          <span>
            <Network size={15} />
            {stats.totalNodes} members
          </span>
        </div>

        <div className="investor-ecosystem-filters">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={
                activeFilter === filter.value ? "active" : ""
              }
              onClick={() => {
                setActiveFilter(filter.value);
                setSelectedNode(null);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="investor-ecosystem-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search startups, investors, industries..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchTerm("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {filteredNodes.length === 0 ? (
          <div className="investor-ecosystem-empty">
            <Network size={35} />
            <h3>No ecosystem members found</h3>
            <p>Try another filter or search term.</p>
          </div>
        ) : (
          <div className="investor-ecosystem-graph-wrapper">
            <svg
              viewBox="0 0 1000 590"
              className="investor-ecosystem-svg"
              role="img"
              aria-label="Startup and investment network map"
            >
              <defs>
                <pattern
                  id="investorGraphGrid"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="#dbe3ef" />
                </pattern>
              </defs>

              <rect
                width="1000"
                height="590"
                fill="url(#investorGraphGrid)"
              />

              {filteredEdges.map((edge, index) => {
                const source = positions[getEndpoint(edge, "source")];
                const target = positions[getEndpoint(edge, "target")];

                if (!source || !target) return null;

                return (
                  <line
                    key={edge._id || index}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    className="investor-ecosystem-edge"
                  />
                );
              })}

              {filteredNodes.map((node) => {
                const id = getId(node);
                const position = positions[id];
                const role = getRole(node);
                const config = ROLE_CONFIG[role];

                if (!position || !config) return null;

                const selected = getId(selectedNode) === id;

                return (
                  <g
                    key={id}
                    className={`investor-ecosystem-node ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedNode(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${getName(node)}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedNode(node);
                      }
                    }}
                  >
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="27"
                      fill={config.color}
                      opacity="0.13"
                    />

                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="21"
                      fill={config.color}
                      stroke="#ffffff"
                      strokeWidth="3"
                    />

                    <text
                      x={position.x}
                      y={position.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {getInitials(getName(node)).slice(0, 2)}
                    </text>

                    <text
                      x={position.x}
                      y={position.y + 42}
                      textAnchor="middle"
                      className="investor-ecosystem-node-label"
                    >
                      {getName(node).length > 17
                        ? `${getName(node).slice(0, 15)}...`
                        : getName(node)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        <div className="investor-ecosystem-legend">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
            <div key={role}>
              <span style={{ background: config.color }} />
              {config.label}
              <strong>{roleCounts[role]}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Discover members */}
      <div className="investor-ecosystem-members">
        <div className="investor-ecosystem-section-heading">
          <div>
            <h2>Discover Ecosystem Members</h2>
            <p>
              Browse founders, investors, mentors, and other members.
            </p>
          </div>
          <span>{filteredNodes.length} members</span>
        </div>

        <div className="investor-ecosystem-member-grid">
          {filteredNodes.slice(0, 12).map((node) => {
            const role = getRole(node);
            const config = ROLE_CONFIG[role];

            if (!config) return null;

            return (
              <button
                type="button"
                className="investor-ecosystem-member-card"
                key={getId(node)}
                onClick={() => setSelectedNode(node)}
              >
                <div
                  className="investor-member-avatar"
                  style={{
                    background: `${config.color}18`,
                    color: config.color,
                  }}
                >
                  {getInitials(getName(node))}
                </div>

                <div className="investor-member-info">
                  <h3>{getName(node)}</h3>
                  <span style={{ color: config.color }}>
                    {config.label}
                  </span>

                  {(node.metadata?.industry ||
                    node.metadata?.investorType ||
                    node.metadata?.expertise) && (
                    <p>
                      {node.metadata.industry ||
                        node.metadata.investorType ||
                        node.metadata.expertise}
                    </p>
                  )}

                  {node.metadata?.location && (
                    <small>
                      <MapPin size={12} />
                      {node.metadata.location}
                    </small>
                  )}
                </div>

                <ArrowRight size={17} />
              </button>
            );
          })}
        </div>

        {filteredNodes.length > 12 && (
          <p className="investor-ecosystem-showing">
            Showing 12 of {filteredNodes.length} members. Use filters
            and search to explore more.
          </p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="investor-ecosystem-cta">
        <div>
          <h2>Discover your next investment opportunity</h2>
          <p>
            Explore startups, evaluate potential opportunities, and
            build meaningful relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={() => goTo("/dashboard/investor/startups")}
        >
          Explore Startups
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Member details */}
      {selectedNode && (
        <div
          className="investor-ecosystem-modal-backdrop"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="investor-ecosystem-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Ecosystem member details"
          >
            <button
              type="button"
              className="investor-ecosystem-modal-close"
              onClick={() => setSelectedNode(null)}
              aria-label="Close details"
            >
              <X size={19} />
            </button>

            <div
              className="investor-member-avatar large"
              style={{
                background: `${
                  ROLE_CONFIG[getRole(selectedNode)]?.color || "#64748b"
                }18`,
                color:
                  ROLE_CONFIG[getRole(selectedNode)]?.color || "#64748b",
              }}
            >
              {getInitials(getName(selectedNode))}
            </div>

            <h2>{getName(selectedNode)}</h2>

            <span
              className="investor-ecosystem-modal-role"
              style={{
                color:
                  ROLE_CONFIG[getRole(selectedNode)]?.color || "#64748b",
              }}
            >
              {ROLE_CONFIG[getRole(selectedNode)]?.label || "Member"}
            </span>

            <div className="investor-ecosystem-modal-details">
              {Object.entries(selectedNode.metadata || {})
                .filter(
                  ([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <span>
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (letter) => letter.toUpperCase())}
                    </span>
                    <strong>
                      {Array.isArray(value)
                        ? value.join(", ")
                        : String(value)}
                    </strong>
                  </div>
                ))}
            </div>

            <p className="investor-ecosystem-modal-note">
              Details shown here are limited to the information returned
              by the ecosystem API.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default InvestorEcosystem;