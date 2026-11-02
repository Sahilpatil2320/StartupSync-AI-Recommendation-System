import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Users,
  Rocket,
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  Network,
  Search,
  ArrowRight,
  MapPin,
  Building2,
  X,
} from "lucide-react";

import api from "../../../services/api";
import "./StudentEcosystem.css";

const ROLE_CONFIG = {
  student: {
    label: "Students",
    color: "#2563eb",
    icon: GraduationCap,
  },
  founder: {
    label: "Founders",
    color: "#7c3aed",
    icon: Rocket,
  },
  investor: {
    label: "Investors",
    color: "#059669",
    icon: BriefcaseBusiness,
  },
  mentor: {
    label: "Mentors",
    color: "#d97706",
    icon: Handshake,
  },
  industry: {
    label: "Industries",
    color: "#64748b",
    icon: Building2,
  },
};

const FILTERS = [
  { value: "all", label: "All Members" },
  { value: "student", label: "Students" },
  { value: "founder", label: "Founders" },
  { value: "investor", label: "Investors" },
  { value: "mentor", label: "Mentors" },
  { value: "industry", label: "Industries" },
];

const getNodeRole = (node) =>
  String(node?.role || node?.type || "").toLowerCase();

const getNodeId = (node) => String(node?._id || node?.id || "");

const getNodeName = (node) =>
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

function StudentEcosystem() {
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

  const loadEcosystem = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/ecosystem/graph");
      const data = response.data || {};

      if (data.success === false) {
        throw new Error(
          data.message || "Unable to load the StartupSync ecosystem."
        );
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
            graphNodes.filter((node) => getNodeRole(node) === "industry")
              .length
        ),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load the ecosystem. Please try again."
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
      student: 0,
      founder: 0,
      investor: 0,
      mentor: 0,
      industry: 0,
    };

    nodes.forEach((node) => {
      const role = getNodeRole(node);
      if (Object.prototype.hasOwnProperty.call(counts, role)) {
        counts[role] += 1;
      }
    });

    return counts;
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return nodes.filter((node) => {
      const role = getNodeRole(node);

      const matchesRole =
        activeFilter === "all" || role === activeFilter;

      const searchableText = [
        getNodeName(node),
        node?.metadata?.industry,
        node?.metadata?.branch,
        node?.metadata?.expertise,
        node?.metadata?.location,
        node?.metadata?.startupName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesRole && matchesSearch;
    });
  }, [nodes, activeFilter, searchTerm]);

  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map(getNodeId)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(() => {
    return edges.filter((edge) => {
      const source = String(
        edge.source || edge.from || edge.sourceId || ""
      );
      const target = String(
        edge.target || edge.to || edge.targetId || ""
      );

      return visibleNodeIds.has(source) && visibleNodeIds.has(target);
    });
  }, [edges, visibleNodeIds]);

  const graphPositions = useMemo(() => {
    const positions = {};
    const centerX = 500;
    const centerY = 290;

    const groups = {
      student: [],
      founder: [],
      investor: [],
      mentor: [],
      industry: [],
    };

    filteredNodes.forEach((node) => {
      const role = getNodeRole(node);
      if (groups[role]) groups[role].push(node);
    });

    const rolePositions = {
      student: { x: 500, y: 95 },
      founder: { x: 220, y: 285 },
      investor: { x: 780, y: 285 },
      mentor: { x: 350, y: 500 },
      industry: { x: 650, y: 500 },
    };

    Object.entries(groups).forEach(([role, group]) => {
      const base = rolePositions[role];
      const radius = role === "industry" ? 95 : 115;

      group.forEach((node, index) => {
        const angle =
          (2 * Math.PI * index) / Math.max(group.length, 1) -
          Math.PI / 2;

        const spread = group.length === 1 ? 0 : radius;

        positions[getNodeId(node)] = {
          x: base.x + Math.cos(angle) * spread,
          y: base.y + Math.sin(angle) * spread,
        };
      });
    });

    return { positions, centerX, centerY };
  }, [filteredNodes]);

  const getEdgeEndpoint = (edge, side) => {
    const value =
      side === "source"
        ? edge.source || edge.from || edge.sourceId
        : edge.target || edge.to || edge.targetId;

    return String(value?._id || value?.id || value || "");
  };

  const handleExplore = (path) => {
    navigate(path);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const selectedRole = selectedNode
    ? getNodeRole(selectedNode)
    : "";

  if (loading) {
    return (
      <div className="student-ecosystem-page">
        <div className="student-ecosystem-loading">
          <div className="student-ecosystem-spinner" />
          <h3>Loading StartupSync Ecosystem</h3>
          <p>Connecting you with the startup community...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="student-ecosystem-page">
      {/* Header */}
      <div className="student-ecosystem-header">
        <div>
          <span className="student-ecosystem-badge">
            <Network size={15} />
            StartupSync Network
          </span>

          <h1>Explore the Ecosystem</h1>

          <p>
            Discover founders, investors, mentors, and fellow students.
            Build meaningful connections and explore opportunities.
          </p>
        </div>

        <button
          type="button"
          className="student-ecosystem-refresh"
          onClick={() => loadEcosystem(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "is-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="student-ecosystem-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadEcosystem(true)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="student-ecosystem-stats">
        <div className="student-ecosystem-stat-card">
          <div className="student-ecosystem-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total Members</span>
            <strong>{stats.totalNodes}</strong>
          </div>
        </div>

        <div className="student-ecosystem-stat-card">
          <div className="student-ecosystem-stat-icon purple">
            <GraduationCap size={21} />
          </div>
          <div>
            <span>Students</span>
            <strong>{roleCounts.student}</strong>
          </div>
        </div>

        <div className="student-ecosystem-stat-card">
          <div className="student-ecosystem-stat-icon green">
            <Rocket size={21} />
          </div>
          <div>
            <span>Startups / Founders</span>
            <strong>{roleCounts.founder}</strong>
          </div>
        </div>

        <div className="student-ecosystem-stat-card">
          <div className="student-ecosystem-stat-icon orange">
            <Handshake size={21} />
          </div>
          <div>
            <span>Mentors & Investors</span>
            <strong>{roleCounts.mentor + roleCounts.investor}</strong>
          </div>
        </div>
      </div>

      {/* Role cards */}
      <div className="student-ecosystem-section-heading">
        <div>
          <h2>Explore Community</h2>
          <p>Find people who can help you grow professionally.</p>
        </div>
      </div>

      <div className="student-ecosystem-role-grid">
        <button
          type="button"
          className="student-ecosystem-role-card"
          onClick={() => handleExplore("/dashboard/student/investors")}
        >
          <div className="student-role-icon purple">
            <Rocket size={22} />
          </div>
          <div>
            <h3>Founders & Startups</h3>
            <p>Discover startups and explore collaboration opportunities.</p>
          </div>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="student-ecosystem-role-card"
          onClick={() => handleExplore("/dashboard/student/investors")}
        >
          <div className="student-role-icon green">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h3>Investors</h3>
            <p>Explore the people and organizations supporting startups.</p>
          </div>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="student-ecosystem-role-card"
          onClick={() => handleExplore("/dashboard/student/opportunities")}
        >
          <div className="student-role-icon orange">
            <Handshake size={22} />
          </div>
          <div>
            <h3>Mentors</h3>
            <p>Connect with experienced professionals and advisors.</p>
          </div>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="student-ecosystem-role-card"
          onClick={() => handleExplore("/dashboard/student/internships")}
        >
          <div className="student-role-icon blue">
            <GraduationCap size={22} />
          </div>
          <div>
            <h3>Internships & Jobs</h3>
            <p>Find opportunities to develop your skills and experience.</p>
          </div>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Network graph */}
      <div className="student-ecosystem-graph-card">
        <div className="student-ecosystem-graph-header">
          <div>
            <h2>StartupSync Network Map</h2>
            <p>
              Explore the different members and relationships in the
              ecosystem. Select a node to view its available details.
            </p>
          </div>

          <span className="student-ecosystem-connection-count">
            <Network size={15} />
            {stats.totalEdges} relationships
          </span>
        </div>

        <div className="student-ecosystem-filters">
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

        <div className="student-ecosystem-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search by name, industry, branch or expertise..."
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
          <div className="student-ecosystem-empty">
            <Network size={35} />
            <h3>No members found</h3>
            <p>
              Try changing the selected role or search term.
            </p>
          </div>
        ) : (
          <div className="student-ecosystem-graph-wrapper">
            <svg
              className="student-ecosystem-svg"
              viewBox="0 0 1000 590"
              role="img"
              aria-label="StartupSync ecosystem network map"
            >
              <defs>
                <pattern
                  id="studentGraphGrid"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="2"
                    cy="2"
                    r="1"
                    fill="#dbe3ef"
                  />
                </pattern>
              </defs>

              <rect
                width="1000"
                height="590"
                fill="url(#studentGraphGrid)"
              />

              {/* Edges */}
              {filteredEdges.map((edge, index) => {
                const sourceId = getEdgeEndpoint(edge, "source");
                const targetId = getEdgeEndpoint(edge, "target");

                const source =
                  graphPositions.positions[sourceId];
                const target =
                  graphPositions.positions[targetId];

                if (!source || !target) return null;

                return (
                  <line
                    key={edge._id || `${sourceId}-${targetId}-${index}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    className="student-ecosystem-edge"
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const id = getNodeId(node);
                const position = graphPositions.positions[id];
                const role = getNodeRole(node);
                const config = ROLE_CONFIG[role];

                if (!position || !config) return null;

                const isSelected =
                  getNodeId(selectedNode) === id;

                return (
                  <g
                    key={id}
                    className={`student-ecosystem-node ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${getNodeName(node)}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={role === "industry" ? 23 : 27}
                      fill={config.color}
                      opacity="0.13"
                    />

                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={role === "industry" ? 17 : 21}
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
                      {getInitials(getNodeName(node)).slice(0, 2)}
                    </text>

                    <text
                      x={position.x}
                      y={position.y + 42}
                      textAnchor="middle"
                      className="student-ecosystem-node-label"
                    >
                      {getNodeName(node).length > 17
                        ? `${getNodeName(node).slice(0, 15)}...`
                        : getNodeName(node)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        <div className="student-ecosystem-legend">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const Icon = config.icon;

            return (
              <div key={role}>
                <span style={{ background: config.color }} />
                <Icon size={15} />
                {config.label}
                <strong>{roleCounts[role]}</strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member list */}
      <div className="student-ecosystem-members">
        <div className="student-ecosystem-section-heading">
          <div>
            <h2>Discover Members</h2>
            <p>
              Browse members currently represented in the ecosystem.
            </p>
          </div>

          <span>{filteredNodes.length} members</span>
        </div>

        <div className="student-ecosystem-member-grid">
          {filteredNodes.slice(0, 12).map((node) => {
            const role = getNodeRole(node);
            const config = ROLE_CONFIG[role];

            if (!config) return null;

            return (
              <button
                type="button"
                className="student-ecosystem-member-card"
                key={getNodeId(node)}
                onClick={() => handleNodeClick(node)}
              >
                <div
                  className="student-member-avatar"
                  style={{
                    background: `${config.color}18`,
                    color: config.color,
                  }}
                >
                  {getInitials(getNodeName(node))}
                </div>

                <div className="student-member-info">
                  <h3>{getNodeName(node)}</h3>
                  <span style={{ color: config.color }}>
                    {config.label.slice(0, -1) || config.label}
                  </span>

                  {(node.metadata?.industry ||
                    node.metadata?.branch ||
                    node.metadata?.expertise) && (
                    <p>
                      {node.metadata.industry ||
                        node.metadata.branch ||
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
          <p className="student-ecosystem-showing">
            Showing 12 of {filteredNodes.length} members. Use the
            filters and search to find specific members.
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="student-ecosystem-cta">
        <div>
          <h2>Ready to take the next step?</h2>
          <p>
            Explore startup opportunities and build your professional
            network.
          </p>
        </div>

        <div className="student-ecosystem-cta-actions">
          <button
            type="button"
            onClick={() =>
              handleExplore("/dashboard/student/opportunities")
            }
          >
            Explore Opportunities
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              handleExplore("/dashboard/student/internships")
            }
          >
            Find Internships
          </button>
        </div>
      </div>

      {/* Selected member details */}
      {selectedNode && (
        <div
          className="student-ecosystem-modal-backdrop"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="student-ecosystem-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Member details"
          >
            <button
              type="button"
              className="student-ecosystem-modal-close"
              onClick={() => setSelectedNode(null)}
              aria-label="Close details"
            >
              <X size={19} />
            </button>

            <div
              className="student-member-avatar large"
              style={{
                background: `${
                  ROLE_CONFIG[selectedRole]?.color || "#64748b"
                }18`,
                color:
                  ROLE_CONFIG[selectedRole]?.color || "#64748b",
              }}
            >
              {getInitials(getNodeName(selectedNode))}
            </div>

            <h2>{getNodeName(selectedNode)}</h2>

            <span
              className="student-ecosystem-modal-role"
              style={{
                color:
                  ROLE_CONFIG[selectedRole]?.color || "#64748b",
              }}
            >
              {ROLE_CONFIG[selectedRole]?.label || "Member"}
            </span>

            <div className="student-ecosystem-modal-details">
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
                        .replace(/^./, (letter) =>
                          letter.toUpperCase()
                        )}
                    </span>
                    <strong>
                      {Array.isArray(value)
                        ? value.join(", ")
                        : String(value)}
                    </strong>
                  </div>
                ))}
            </div>

            <p className="student-ecosystem-modal-note">
              This information is based on the details returned by the
              StartupSync ecosystem API.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentEcosystem;