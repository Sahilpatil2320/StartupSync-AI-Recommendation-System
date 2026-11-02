import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Handshake,
  Network,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import api from "../../../services/api";
import "./MentorEcosystem.css";

const FILTERS = [
  { label: "All Members", value: "all" },
  { label: "Founders", value: "founder" },
  { label: "Investors", value: "investor" },
  { label: "Mentors", value: "mentor" },
  { label: "Students", value: "student" },
  { label: "Industries", value: "industry" },
];

const ROLE_CONFIG = {
  founder: {
    label: "Founder",
    color: "#8b5cf6",
    icon: BriefcaseBusiness,
  },
  investor: {
    label: "Investor",
    color: "#10b981",
    icon: Building2,
  },
  mentor: {
    label: "Mentor",
    color: "#f59e0b",
    icon: GraduationCap,
  },
  student: {
    label: "Student",
    color: "#0ea5e9",
    icon: Users,
  },
  industry: {
    label: "Industry",
    color: "#ec4899",
    icon: Network,
  },
};

const getRole = (node) =>
  String(node?.role || node?.type || "").toLowerCase();

const getId = (node) =>
  String(node?._id || node?.id || node?.userId || "");

const getName = (node) =>
  node?.name ||
  node?.label ||
  node?.startupName ||
  node?.firmName ||
  "Unnamed Member";

const getEndpoint = (endpoint) => {
  if (endpoint && typeof endpoint === "object") {
    return String(endpoint._id || endpoint.id || endpoint.userId || "");
  }

  return String(endpoint || "");
};

const getEdgeSource = (edge) =>
  getEndpoint(
    edge?.source ??
      edge?.from ??
      edge?.sourceId ??
      edge?.sender ??
      edge?.senderId
  );

const getEdgeTarget = (edge) =>
  getEndpoint(
    edge?.target ??
      edge?.to ??
      edge?.targetId ??
      edge?.receiver ??
      edge?.receiverId
  );

const getMetadata = (node) => node?.metadata || {};

function MentorEcosystem() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchEcosystem = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/ecosystem/graph");
      const data = response?.data?.data || response?.data || {};

      setNodes(Array.isArray(data.nodes) ? data.nodes : []);
      setEdges(Array.isArray(data.edges) ? data.edges : []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Failed to load ecosystem graph:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load the ecosystem. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEcosystem();
  }, [fetchEcosystem]);

  const roleCounts = useMemo(() => {
    return nodes.reduce(
      (counts, node) => {
        const role = getRole(node);

        if (Object.prototype.hasOwnProperty.call(counts, role)) {
          counts[role] += 1;
        }

        return counts;
      },
      {
        founder: 0,
        investor: 0,
        mentor: 0,
        student: 0,
        industry: 0,
      }
    );
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return nodes.filter((node) => {
      const role = getRole(node);
      const metadata = getMetadata(node);

      const matchesFilter =
        activeFilter === "all" || role === activeFilter;

      const searchableText = [
        getName(node),
        role,
        metadata.industry,
        metadata.expertise,
        metadata.location,
        metadata.startupName,
        metadata.firmName,
        metadata.branch,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [nodes, activeFilter, searchTerm]);

  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map(getId)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(() => {
    return edges.filter((edge) => {
      const source = getEdgeSource(edge);
      const target = getEdgeTarget(edge);

      return visibleNodeIds.has(source) && visibleNodeIds.has(target);
    });
  }, [edges, visibleNodeIds]);

  const graphNodes = useMemo(() => {
    const centerX = 450;
    const centerY = 285;
    const radiusX = 350;
    const radiusY = 205;

    return filteredNodes.map((node, index) => {
      const angle =
        (2 * Math.PI * index) / Math.max(filteredNodes.length, 1) -
        Math.PI / 2;

      return {
        ...node,
        graphX: centerX + radiusX * Math.cos(angle),
        graphY: centerY + radiusY * Math.sin(angle),
      };
    });
  }, [filteredNodes]);

  const graphPositions = useMemo(() => {
    return new Map(
      graphNodes.map((node) => [
        getId(node),
        { x: node.graphX, y: node.graphY },
      ])
    );
  }, [graphNodes]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const getNodeColor = (node) =>
    ROLE_CONFIG[getRole(node)]?.color || "#64748b";

  const getNodeIcon = (role) => {
    const Icon = ROLE_CONFIG[role]?.icon || Users;
    return <Icon size={16} />;
  };

  const connectionCount = (node) => {
    const id = getId(node);

    return edges.filter(
      (edge) =>
        getEdgeSource(edge) === id || getEdgeTarget(edge) === id
    ).length;
  };

  return (
    <div className="mentor-ecosystem">
      <div className="mentor-ecosystem-header">
        <div>
          <div className="mentor-ecosystem-eyebrow">
            <Network size={15} />
            STARTUPSYNC NETWORK
          </div>

          <h1>Mentor Ecosystem</h1>

          <p>
            Explore founders, investors, mentors, students, and industry
            connections across the StartupSync ecosystem.
          </p>
        </div>

        <button
          className="mentor-ecosystem-refresh"
          onClick={fetchEcosystem}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      <div className="mentor-ecosystem-notice">
        <Activity size={17} />
        <span>
          This visualization represents the overall StartupSync ecosystem,
          not only your personal connections.
        </span>
      </div>

      <div className="mentor-ecosystem-stats">
        <div className="mentor-ecosystem-stat-card">
          <div className="mentor-stat-icon purple">
            <Users size={21} />
          </div>
          <div>
            <span>Total Members</span>
            <strong>{nodes.length}</strong>
          </div>
        </div>

        <div className="mentor-ecosystem-stat-card">
          <div className="mentor-stat-icon violet">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <span>Founders</span>
            <strong>{roleCounts.founder}</strong>
          </div>
        </div>

        <div className="mentor-ecosystem-stat-card">
          <div className="mentor-stat-icon green">
            <Building2 size={21} />
          </div>
          <div>
            <span>Investors</span>
            <strong>{roleCounts.investor}</strong>
          </div>
        </div>

        <div className="mentor-ecosystem-stat-card">
          <div className="mentor-stat-icon orange">
            <GraduationCap size={21} />
          </div>
          <div>
            <span>Mentors</span>
            <strong>{roleCounts.mentor}</strong>
          </div>
        </div>

        <div className="mentor-ecosystem-stat-card">
          <div className="mentor-stat-icon blue">
            <Handshake size={21} />
          </div>
          <div>
            <span>Relationships</span>
            <strong>{edges.length}</strong>
          </div>
        </div>
      </div>

      <section className="mentor-ecosystem-panel">
        <div className="mentor-ecosystem-panel-header">
          <div>
            <h2>Explore Network</h2>
            <p>
              Discover people and relationships throughout the ecosystem.
            </p>
          </div>

          <div className="mentor-ecosystem-total">
            {filteredNodes.length} members
          </div>
        </div>

        <div className="mentor-ecosystem-toolbar">
          <div className="mentor-ecosystem-filters">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={
                  activeFilter === filter.value ? "active" : ""
                }
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mentor-ecosystem-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search members, industries..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mentor-ecosystem-error">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={fetchEcosystem}>Try again</button>
          </div>
        )}

        {loading ? (
          <div className="mentor-ecosystem-loading">
            <div className="mentor-ecosystem-spinner" />
            <span>Loading ecosystem network...</span>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="mentor-ecosystem-empty">
            <Network size={38} />
            <h3>No members found</h3>
            <p>
              Try changing the selected role or search with another keyword.
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearchTerm("");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mentor-ecosystem-graph-wrapper">
            <div className="mentor-ecosystem-graph">
              <svg
                viewBox="0 0 900 570"
                role="img"
                aria-label="Interactive StartupSync ecosystem network graph"
              >
                <defs>
                  <radialGradient id="mentorGraphGlow">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".12" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <circle
                  cx="450"
                  cy="285"
                  r="235"
                  fill="url(#mentorGraphGlow)"
                />

                {filteredEdges.map((edge, index) => {
                  const source = graphPositions.get(getEdgeSource(edge));
                  const target = graphPositions.get(getEdgeTarget(edge));

                  if (!source || !target) return null;

                  return (
                    <line
                      key={edge._id || edge.id || index}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className="mentor-ecosystem-edge"
                    />
                  );
                })}

                {graphNodes.map((node) => {
                  const role = getRole(node);
                  const color = getNodeColor(node);
                  const selected =
                    selectedNode && getId(selectedNode) === getId(node);

                  return (
                    <g
                      key={getId(node)}
                      className="mentor-ecosystem-graph-node"
                      transform={`translate(${node.graphX}, ${node.graphY})`}
                      onClick={() => handleNodeClick(node)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${getName(node)}, ${role}`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleNodeClick(node);
                        }
                      }}
                    >
                      <circle
                        r={selected ? 25 : 21}
                        fill={color}
                        fillOpacity=".14"
                        stroke={color}
                        strokeWidth={selected ? 3 : 1.7}
                      />

                      <circle
                        r="5"
                        fill={color}
                      />

                      <text
                        y="38"
                        textAnchor="middle"
                        className="mentor-ecosystem-node-label"
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

            <div className="mentor-ecosystem-legend">
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <div key={role}>
                  <span style={{ background: config.color }} />
                  {config.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mentor-ecosystem-members">
        <div className="mentor-ecosystem-members-header">
          <div>
            <h2>Ecosystem Members</h2>
            <p>Browse the members available in the network.</p>
          </div>
          <span>{filteredNodes.length} results</span>
        </div>

        {!loading && filteredNodes.length > 0 && (
          <div className="mentor-ecosystem-member-grid">
            {filteredNodes.map((node) => {
              const role = getRole(node);
              const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
              const metadata = getMetadata(node);

              return (
                <button
                  type="button"
                  className="mentor-ecosystem-member-card"
                  key={getId(node)}
                  onClick={() => handleNodeClick(node)}
                >
                  <div
                    className="mentor-member-avatar"
                    style={{
                      color: config.color,
                      background: `${config.color}18`,
                    }}
                  >
                    {getNodeIcon(role)}
                  </div>

                  <div className="mentor-member-info">
                    <h3>{getName(node)}</h3>
                    <span style={{ color: config.color }}>
                      {config.label}
                    </span>

                    <p>
                      {metadata.industry ||
                        metadata.expertise ||
                        metadata.location ||
                        metadata.branch ||
                        "StartupSync ecosystem member"}
                    </p>
                  </div>

                  <div className="mentor-member-connections">
                    <Users size={14} />
                    {connectionCount(node)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedNode && (
        <div
          className="mentor-ecosystem-modal-backdrop"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="mentor-ecosystem-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-member-modal-title"
          >
            <button
              className="mentor-ecosystem-modal-close"
              onClick={() => setSelectedNode(null)}
              aria-label="Close member details"
            >
              <X size={20} />
            </button>

            <div
              className="mentor-ecosystem-modal-avatar"
              style={{
                color: getNodeColor(selectedNode),
                background: `${getNodeColor(selectedNode)}18`,
              }}
            >
              {getNodeIcon(getRole(selectedNode))}
            </div>

            <span
              className="mentor-ecosystem-modal-role"
              style={{ color: getNodeColor(selectedNode) }}
            >
              {ROLE_CONFIG[getRole(selectedNode)]?.label || "Member"}
            </span>

            <h2 id="mentor-member-modal-title">
              {getName(selectedNode)}
            </h2>

            <div className="mentor-ecosystem-modal-details">
              {Object.entries(getMetadata(selectedNode))
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
                        : typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                    </strong>
                  </div>
                ))}

              <div>
                <span>Network relationships</span>
                <strong>{connectionCount(selectedNode)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorEcosystem;