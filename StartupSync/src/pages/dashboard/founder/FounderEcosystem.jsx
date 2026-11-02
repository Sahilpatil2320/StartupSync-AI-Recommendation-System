import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Network,
  Users,
  BriefcaseBusiness,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Building2,
  Target,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

import "./FounderEcosystem.css";

const ROLE_COLORS = {
  founder: "#2563eb",
  investor: "#16a34a",
  mentor: "#9333ea",
  student: "#d97706",
  industry: "#64748b",
};

const ROLE_LABELS = {
  founder: "Founders",
  investor: "Investors",
  mentor: "Mentors",
  student: "Students",
  industry: "Industries",
};

const getCurrentUserId = () => {
  try {
    const storedUser = localStorage.getItem("startupsync_user");

    if (!storedUser) return "";

    const user = JSON.parse(storedUser);

    return String(user?._id || user?.id || user?.userId || "");
  } catch {
    return "";
  }
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getNodePosition = (index, total, centerX, centerY, radius) => {
  if (total === 0) {
    return { x: centerX, y: centerY };
  }

  const angle = (2 * Math.PI * index) / total - Math.PI / 2;

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
};

function FounderEcosystem() {
  const navigate = useNavigate();

  const [graph, setGraph] = useState({
    nodes: [],
    edges: [],
    stats: {
      totalNodes: 0,
      totalEdges: 0,
      industriesCount: 0,
    },
  });

  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [graphError, setGraphError] = useState("");
  const [readinessError, setReadinessError] = useState("");

  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const loadEcosystemData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setGraphError("");
    setReadinessError("");

    try {
      const [graphResult, readinessResult] = await Promise.allSettled([
        api.get("/ecosystem/graph", {
          params: { limitPerRole: 50 },
        }),
        api.get("/ecosystem/analytics/funding-readiness"),
      ]);

      if (graphResult.status === "fulfilled") {
        const data = graphResult.value.data;

        setGraph({
          nodes: Array.isArray(data?.nodes) ? data.nodes : [],
          edges: Array.isArray(data?.edges) ? data.edges : [],
          stats: data?.stats || {
            totalNodes: 0,
            totalEdges: 0,
            industriesCount: 0,
          },
        });
      } else {
        console.error("Ecosystem graph error:", graphResult.reason);
        setGraphError(
          graphResult.reason?.response?.data?.message ||
            "Unable to load the ecosystem network."
        );
      }

      if (readinessResult.status === "fulfilled") {
        setReadiness(readinessResult.value.data?.readiness || null);
      } else {
        console.error(
          "Funding readiness error:",
          readinessResult.reason
        );

        setReadinessError(
          readinessResult.reason?.response?.data?.message ||
            "Funding readiness information is currently unavailable."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEcosystemData();
  }, [loadEcosystemData]);

  const roleCounts = useMemo(() => {
    const counts = {
      founder: 0,
      investor: 0,
      mentor: 0,
      student: 0,
      industry: 0,
    };

    graph.nodes.forEach((node) => {
      if (counts[node.type] !== undefined) {
        counts[node.type] += 1;
      }
    });

    return counts;
  }, [graph.nodes]);

  const connectedRelationships = useMemo(
    () =>
      graph.edges.filter(
        (edge) => edge.relationship === "connected"
      ).length,
    [graph.edges]
  );

  const networkLayout = useMemo(() => {
    const width = 900;
    const height = 570;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = graph.nodes.slice(0, 100);

    if (!nodes.length) {
      return {
        width,
        height,
        nodes: [],
        edges: [],
      };
    }

    const founderIndex = nodes.findIndex(
      (node) =>
        node.type === "founder" &&
        String(node.id) === currentUserId
    );

    const fallbackFounderIndex = nodes.findIndex(
      (node) => node.type === "founder"
    );

    const centerIndex =
      founderIndex >= 0 ? founderIndex : fallbackFounderIndex;

    const centerNode =
      centerIndex >= 0 ? nodes[centerIndex] : nodes[0];

    const otherNodes = nodes.filter(
      (node) => String(node.id) !== String(centerNode.id)
    );

    const positions = new Map();

    positions.set(String(centerNode.id), {
      x: centerX,
      y: centerY,
    });

    otherNodes.forEach((node, index) => {
      const position = getNodePosition(
        index,
        otherNodes.length,
        centerX,
        centerY,
        205
      );

      positions.set(String(node.id), position);
    });

    const visibleNodeIds = new Set(
      nodes.map((node) => String(node.id))
    );

    const edges = graph.edges
      .filter(
        (edge) =>
          visibleNodeIds.has(String(edge.source)) &&
          visibleNodeIds.has(String(edge.target))
      )
      .slice(0, 180)
      .map((edge, index) => ({
        ...edge,
        key: `${edge.source}-${edge.target}-${index}`,
        sourcePosition: positions.get(String(edge.source)),
        targetPosition: positions.get(String(edge.target)),
      }))
      .filter(
        (edge) => edge.sourcePosition && edge.targetPosition
      );

    return {
      width,
      height,
      nodes: nodes.map((node) => ({
        ...node,
        position: positions.get(String(node.id)),
        isCenter: String(node.id) === String(centerNode.id),
      })),
      edges,
    };
  }, [graph.nodes, graph.edges, currentUserId]);

  const completenessScore = Math.min(
    100,
    Math.max(0, Number(readiness?.completenessScore || 0))
  );

  const fundingProgress = Math.min(
    100,
    Math.max(
      0,
      Number(readiness?.metrics?.fundingProgressPercentage || 0)
    )
  );

  const readinessStatus = readiness?.readinessLevel || "";

  const readinessColor = readinessStatus.startsWith("High")
    ? "high"
    : readinessStatus.startsWith("Medium")
      ? "medium"
      : "low";

  const handleExplore = (role) => {
    const routes = {
      investor: "/dashboard/founder/investors",
      mentor: "/dashboard/founder/mentors",
      student: "/dashboard/founder/students",
    };

    if (routes[role]) {
      navigate(routes[role]);
    }
  };

  return (
    <div className="founder-ecosystem-page">
      {/* Page Header */}
      <div className="founder-ecosystem-header">
        <div>
          <div className="founder-ecosystem-eyebrow">
            <Network size={15} />
            StartupSync Network
          </div>

          <h1>Startup Ecosystem</h1>

          <p>
            Explore your startup network, discover ecosystem members,
            and understand your funding readiness.
          </p>
        </div>

        <button
          type="button"
          className="founder-ecosystem-refresh"
          onClick={() => loadEcosystemData(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "founder-ecosystem-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Overview Cards */}
      <section className="founder-ecosystem-stats">
        <div className="founder-ecosystem-stat-card">
          <div className="founder-ecosystem-stat-icon blue">
            <Network size={21} />
          </div>

          <div>
            <span>Total Network Members</span>
            <strong>
              {loading ? "—" : graph.stats.totalNodes || 0}
            </strong>
          </div>
        </div>

        <div className="founder-ecosystem-stat-card">
          <div className="founder-ecosystem-stat-icon green">
            <Users size={21} />
          </div>

          <div>
            <span>Connection Relationships</span>
            <strong>
              {loading ? "—" : connectedRelationships}
            </strong>
          </div>
        </div>

        <div className="founder-ecosystem-stat-card">
          <div className="founder-ecosystem-stat-icon purple">
            <Building2 size={21} />
          </div>

          <div>
            <span>Industries</span>
            <strong>
              {loading ? "—" : graph.stats.industriesCount || 0}
            </strong>
          </div>
        </div>

        <div className="founder-ecosystem-stat-card">
          <div className="founder-ecosystem-stat-icon orange">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Network Relationships</span>
            <strong>
              {loading ? "—" : graph.stats.totalEdges || 0}
            </strong>
          </div>
        </div>
      </section>

      {/* Network Members */}
      <section className="founder-ecosystem-section">
        <div className="founder-ecosystem-section-heading">
          <div>
            <h2>Explore the Ecosystem</h2>
            <p>
              Discover the different members of the StartupSync network.
            </p>
          </div>
        </div>

        <div className="founder-ecosystem-role-grid">
          <button
            type="button"
            className="founder-ecosystem-role-card"
            onClick={() => handleExplore("investor")}
          >
            <div className="founder-ecosystem-role-icon investor">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <span>Investors</span>
              <strong>{loading ? "—" : roleCounts.investor}</strong>
              <small>Discover potential investors</small>
            </div>

            <ArrowUpRight size={18} />
          </button>

          <button
            type="button"
            className="founder-ecosystem-role-card"
            onClick={() => handleExplore("mentor")}
          >
            <div className="founder-ecosystem-role-icon mentor">
              <Lightbulb size={22} />
            </div>

            <div>
              <span>Mentors</span>
              <strong>{loading ? "—" : roleCounts.mentor}</strong>
              <small>Find experienced mentors</small>
            </div>

            <ArrowUpRight size={18} />
          </button>

          <button
            type="button"
            className="founder-ecosystem-role-card"
            onClick={() => handleExplore("student")}
          >
            <div className="founder-ecosystem-role-icon student">
              <GraduationCap size={22} />
            </div>

            <div>
              <span>Students</span>
              <strong>{loading ? "—" : roleCounts.student}</strong>
              <small>Discover emerging talent</small>
            </div>

            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      {/* Network Graph */}
      <section className="founder-ecosystem-section">
        <div className="founder-ecosystem-section-heading">
          <div>
            <h2>Network Visualization</h2>
            <p>
              A visual overview of members and relationships in the
              StartupSync ecosystem.
            </p>
          </div>

          <span className="founder-ecosystem-live-label">
            <span />
            Network Data
          </span>
        </div>

        <div className="founder-ecosystem-graph-card">
          <div className="founder-ecosystem-legend">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <span key={role}>
                <i style={{ background: ROLE_COLORS[role] }} />
                {label}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="founder-ecosystem-loading">
              <RefreshCw size={25} className="founder-ecosystem-spin" />
              <p>Building ecosystem network...</p>
            </div>
          ) : graphError ? (
            <div className="founder-ecosystem-error">
              <AlertCircle size={22} />
              <p>{graphError}</p>
            </div>
          ) : !networkLayout.nodes.length ? (
            <div className="founder-ecosystem-empty">
              <Network size={38} />
              <h3>No ecosystem data available</h3>
              <p>
                Network members and relationships will appear here when
                ecosystem data is available.
              </p>
            </div>
          ) : (
            <div className="founder-ecosystem-graph-scroll">
              <svg
                className="founder-ecosystem-svg"
                viewBox={`0 0 ${networkLayout.width} ${networkLayout.height}`}
                role="img"
                aria-label="StartupSync ecosystem network graph"
              >
                {networkLayout.edges.map((edge) => (
                  <line
                    key={edge.key}
                    x1={edge.sourcePosition.x}
                    y1={edge.sourcePosition.y}
                    x2={edge.targetPosition.x}
                    y2={edge.targetPosition.y}
                    className={`founder-ecosystem-edge ${
                      edge.relationship === "connected"
                        ? "connected"
                        : ""
                    }`}
                  />
                ))}

                {networkLayout.nodes.map((node) => {
                  const color =
                    ROLE_COLORS[node.type] || ROLE_COLORS.industry;

                  const radius = node.isCenter ? 29 : 19;

                  return (
                    <g
                      key={node.id}
                      className="founder-ecosystem-node"
                    >
                      {node.isCenter && (
                        <circle
                          cx={node.position.x}
                          cy={node.position.y}
                          r="39"
                          fill={color}
                          opacity="0.12"
                        />
                      )}

                      <circle
                        cx={node.position.x}
                        cy={node.position.y}
                        r={radius}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth="3"
                      />

                      <text
                        x={node.position.x}
                        y={node.position.y + 4}
                        textAnchor="middle"
                        className="founder-ecosystem-node-initial"
                      >
                        {getInitials(node.label).slice(0, 2)}
                      </text>

                      <text
                        x={node.position.x}
                        y={node.position.y + radius + 17}
                        textAnchor="middle"
                        className="founder-ecosystem-node-label"
                      >
                        {node.label?.length > 17
                          ? `${node.label.slice(0, 15)}...`
                          : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          <div className="founder-ecosystem-graph-footer">
            <span>
              <strong>{graph.stats.totalNodes || 0}</strong> members
            </span>
            <span>
              <strong>{graph.stats.totalEdges || 0}</strong> relationships
            </span>
            <span>Showing up to 100 members</span>
          </div>
        </div>
      </section>

      {/* Funding Readiness */}
      <section className="founder-ecosystem-section">
        <div className="founder-ecosystem-section-heading">
          <div>
            <h2>Startup Funding Readiness</h2>
            <p>
              Understand your startup profile completeness and funding
              progress.
            </p>
          </div>
        </div>

        {readinessError ? (
          <div className="founder-ecosystem-error funding-error">
            <AlertCircle size={22} />
            <div>
              <strong>Funding analytics unavailable</strong>
              <p>{readinessError}</p>
            </div>
          </div>
        ) : readiness ? (
          <div className="founder-ecosystem-funding-grid">
            <div className="founder-ecosystem-funding-card readiness-card">
              <div className="founder-ecosystem-funding-title">
                <div>
                  <span>Profile Completeness</span>
                  <h3>{readiness.startupName || "Your Startup"}</h3>
                </div>

                <div className="funding-title-icon">
                  <Target size={21} />
                </div>
              </div>

              <div className="founder-ecosystem-score">
                <strong>{completenessScore}%</strong>
                <span>Complete</span>
              </div>

              <div className="founder-ecosystem-progress-track">
                <div
                  className="founder-ecosystem-progress-fill completeness"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>

              <div className="founder-ecosystem-score-footer">
                <span>
                  {readiness.missingFields?.length || 0} missing fields
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/founder/startup")}
                >
                  Improve startup profile
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>

            <div className="founder-ecosystem-funding-card">
              <div className="founder-ecosystem-funding-title">
                <div>
                  <span>Funding Progress</span>
                  <h3>{readiness.fundingStage || "Not specified"}</h3>
                </div>

                <div className="funding-title-icon">
                  <Wallet size={21} />
                </div>
              </div>

              <div className="founder-ecosystem-funding-amounts">
                <div>
                  <small>Funding Raised</small>
                  <strong>
                    {formatCurrency(
                      readiness.metrics?.fundingRaised
                    )}
                  </strong>
                </div>

                <div>
                  <small>Funding Required</small>
                  <strong>
                    {formatCurrency(
                      readiness.metrics?.fundingRequired
                    )}
                  </strong>
                </div>
              </div>

              <div className="founder-ecosystem-progress-track">
                <div
                  className="founder-ecosystem-progress-fill funding"
                  style={{ width: `${fundingProgress}%` }}
                />
              </div>

              <div className="founder-ecosystem-funding-progress-label">
                {fundingProgress}% of funding target
              </div>
            </div>

            <div className="founder-ecosystem-funding-card readiness-status-card">
              <div className="founder-ecosystem-funding-title">
                <div>
                  <span>Funding Assessment</span>
                  <h3>Readiness Level</h3>
                </div>

                <div className="funding-title-icon">
                  <CheckCircle2 size={21} />
                </div>
              </div>

              <div
                className={`founder-ecosystem-readiness-badge ${readinessColor}`}
              >
                {readinessStatus || "Not evaluated"}
              </div>

              <p className="founder-ecosystem-readiness-description">
                This assessment is based on the startup profile
                completeness and funding information currently available.
              </p>
            </div>

            <div className="founder-ecosystem-funding-card pipeline-card">
              <div className="founder-ecosystem-funding-title">
                <div>
                  <span>Investor Activity</span>
                  <h3>Pipeline Overview</h3>
                </div>

                <div className="funding-title-icon">
                  <TrendingUp size={21} />
                </div>
              </div>

              <div className="founder-ecosystem-pipeline-metrics">
                <div>
                  <strong>
                    {readiness.pipelineActivity?.investorEnquiriesCount || 0}
                  </strong>
                  <span>Connection enquiries</span>
                </div>

                <div>
                  <strong>
                    {readiness.pipelineActivity?.activeDueDiligenceCount || 0}
                  </strong>
                  <span>Due diligence</span>
                </div>

                <div>
                  <strong>
                    {readiness.pipelineActivity?.totalDealsInPipeline || 0}
                  </strong>
                  <span>Total pipeline deals</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="founder-ecosystem-empty funding-empty">
            <CircleHelp size={30} />
            <h3>Funding readiness not available</h3>
            <p>
              Complete your founder startup profile to view funding
              readiness analytics.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard/founder/startup")}
            >
              Complete startup profile
            </button>
          </div>
        )}

        {/* Missing Fields */}
        {readiness?.missingFields?.length > 0 && (
          <div className="founder-ecosystem-missing-fields">
            <div className="founder-ecosystem-missing-heading">
              <AlertCircle size={19} />
              <div>
                <strong>Improve your funding readiness</strong>
                <p>
                  Complete these startup profile fields to improve
                  your profile completeness.
                </p>
              </div>
            </div>

            <div className="founder-ecosystem-missing-list">
              {readiness.missingFields.map((field) => (
                <span key={field}>
                  {field.replace(/([A-Z])/g, " $1")}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default FounderEcosystem;