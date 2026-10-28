import {
  AlertCircle,
  Building2,
  GraduationCap,
  Layers,
  Lightbulb,
  Maximize2,
  Minimize2,
  RefreshCw,
  Rocket,
  Search,
  Share2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import "./EcosystemGraph.css";

const typeColors = {
  founder: { bg: "#eff6ff", stroke: "#2563eb", fill: "#3b82f6", text: "#1e40af", label: "Startup" },
  investor: { bg: "#ecfdf5", stroke: "#059669", fill: "#10b981", text: "#065f46", label: "Investor" },
  mentor: { bg: "#f5f3ff", stroke: "#7c3aed", fill: "#8b5cf6", text: "#5b21b6", label: "Mentor" },
  student: { bg: "#fffbeb", stroke: "#d97706", fill: "#f59e0b", text: "#92400e", label: "Student" },
  industry: { bg: "#f1f5f9", stroke: "#475569", fill: "#64748b", text: "#1e293b", label: "Industry" },
};

function EcosystemGraph({ onNodeSelect = null }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);

  const svgRef = useRef(null);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/ecosystem/graph");
      setGraphData(response.data?.graph || { nodes: [], edges: [], summary: {} });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load ecosystem graph.");
      setGraphData({ nodes: [], edges: [], summary: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Compute 2D Positions for nodes using a deterministic circle/cluster layout
  const positionedNodes = useMemo(() => {
    const nodes = graphData.nodes || [];
    if (nodes.length === 0) return [];

    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes by type
    const byType = {
      industry: [],
      founder: [],
      investor: [],
      mentor: [],
      student: [],
    };

    nodes.forEach((n) => {
      if (byType[n.type]) byType[n.type].push(n);
      else byType.founder.push(n);
    });

    const positioned = [];

    // 1. Industries in the innermost ring
    const indCount = byType.industry.length || 1;
    byType.industry.forEach((n, i) => {
      const angle = (i / indCount) * 2 * Math.PI;
      const r = 90;
      positioned.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        radius: 24,
      });
    });

    // 2. Founders in ring 2
    const founderCount = byType.founder.length || 1;
    byType.founder.forEach((n, i) => {
      const angle = (i / founderCount) * 2 * Math.PI + 0.2;
      const r = 180;
      positioned.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        radius: 20,
      });
    });

    // 3. Investors in ring 3 (Top & Right quadrants)
    const invCount = byType.investor.length || 1;
    byType.investor.forEach((n, i) => {
      const angle = (i / invCount) * Math.PI - Math.PI / 4;
      const r = 260;
      positioned.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        radius: 18,
      });
    });

    // 4. Mentors in ring 3 (Bottom & Left quadrants)
    const mentorCount = byType.mentor.length || 1;
    byType.mentor.forEach((n, i) => {
      const angle = (i / mentorCount) * Math.PI + (3 * Math.PI) / 4;
      const r = 260;
      positioned.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        radius: 18,
      });
    });

    // 5. Students in outer periphery
    const studentCount = byType.student.length || 1;
    byType.student.forEach((n, i) => {
      const angle = (i / studentCount) * 2 * Math.PI + 0.5;
      const r = 320;
      positioned.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        radius: 16,
      });
    });

    return positioned;
  }, [graphData.nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map();
    positionedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [positionedNodes]);

  // Filter nodes based on active role filter & search
  const visibleNodeIds = useMemo(() => {
    const q = search.toLowerCase().trim();
    const set = new Set();
    positionedNodes.forEach((n) => {
      const matchesFilter = activeFilter === "all" || n.type === activeFilter;
      const matchesSearch = !q || n.label.toLowerCase().includes(q);
      if (matchesFilter && matchesSearch) set.add(n.id);
    });
    return set;
  }, [positionedNodes, activeFilter, search]);

  // Edges connecting visible nodes
  const visibleEdges = useMemo(() => {
    const edges = graphData.edges || [];
    return edges
      .map((e) => {
        const sourceNode = nodeMap.get(String(e.source));
        const targetNode = nodeMap.get(String(e.target));
        if (sourceNode && targetNode && visibleNodeIds.has(sourceNode.id) && visibleNodeIds.has(targetNode.id)) {
          return { ...e, sourceNode, targetNode };
        }
        return null;
      })
      .filter(Boolean);
  }, [graphData.edges, nodeMap, visibleNodeIds]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (onNodeSelect) onNodeSelect(node);
  };

  // Connected neighbors of the selected node
  const selectedConnections = useMemo(() => {
    if (!selectedNode) return [];
    const connected = [];
    (graphData.edges || []).forEach((e) => {
      if (String(e.source) === selectedNode.id) {
        const target = nodeMap.get(String(e.target));
        if (target) connected.push({ node: target, relation: e.relationship });
      } else if (String(e.target) === selectedNode.id) {
        const source = nodeMap.get(String(e.source));
        if (source) connected.push({ node: source, relation: e.relationship });
      }
    });
    return connected;
  }, [selectedNode, graphData.edges, nodeMap]);

  return (
    <div className="ecosystem-graph-container">
      {/* Top Toolbar */}
      <div className="ecosystem-graph-toolbar">
        <div className="graph-toolbar-left">
          <span className="graph-badge">
            <Share2 size={14} className="inline mr-1" /> Live Ecosystem Network Graph
          </span>
          <span className="graph-stats-summary">
            {graphData.summary?.totalNodes || positionedNodes.length} Verified Entities •{" "}
            {graphData.summary?.totalEdges || graphData.edges?.length || 0} Real Connections
          </span>
        </div>

        <div className="graph-toolbar-right">
          <div className="graph-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search graph node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="graph-zoom-controls">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              title="Zoom Out"
            >
              -
            </button>
            <button type="button" onClick={() => setZoom(1)} title="Reset Zoom">
              100%
            </button>
            <button
              type="button"
              onClick={fetchGraphData}
              disabled={loading}
              title="Refresh Graph"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Role Filters */}
      <div className="graph-role-filters">
        <button
          type="button"
          className={`graph-filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All Entities ({positionedNodes.length})
        </button>
        <button
          type="button"
          className={`graph-filter-btn founder ${activeFilter === "founder" ? "active" : ""}`}
          onClick={() => setActiveFilter("founder")}
        >
          <Rocket size={13} /> Startups
        </button>
        <button
          type="button"
          className={`graph-filter-btn investor ${activeFilter === "investor" ? "active" : ""}`}
          onClick={() => setActiveFilter("investor")}
        >
          <TrendingUp size={13} /> Investors
        </button>
        <button
          type="button"
          className={`graph-filter-btn mentor ${activeFilter === "mentor" ? "active" : ""}`}
          onClick={() => setActiveFilter("mentor")}
        >
          <Lightbulb size={13} /> Mentors
        </button>
        <button
          type="button"
          className={`graph-filter-btn student ${activeFilter === "student" ? "active" : ""}`}
          onClick={() => setActiveFilter("student")}
        >
          <GraduationCap size={13} /> Students
        </button>
        <button
          type="button"
          className={`graph-filter-btn industry ${activeFilter === "industry" ? "active" : ""}`}
          onClick={() => setActiveFilter("industry")}
        >
          <Building2 size={13} /> Industries
        </button>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="graph-canvas-wrapper">
        {loading ? (
          <div className="graph-empty-state">
            <RefreshCw size={24} className="animate-spin text-blue-600 mb-2" />
            <p>Constructing real entity network graph from MongoDB and ecosystem datasets...</p>
          </div>
        ) : error ? (
          <div className="graph-empty-state text-rose-700">
            <AlertCircle size={24} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            className="graph-svg"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          >
            <defs>
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Links / Edges */}
            <g className="graph-edges">
              {visibleEdges.map((edge, idx) => {
                const isHighlighted =
                  selectedNode &&
                  (selectedNode.id === edge.sourceNode.id || selectedNode.id === edge.targetNode.id);

                return (
                  <line
                    key={idx}
                    x1={edge.sourceNode.x}
                    y1={edge.sourceNode.y}
                    x2={edge.targetNode.x}
                    y2={edge.targetNode.y}
                    stroke={isHighlighted ? "#2563eb" : "#cbd5e1"}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={edge.relationship === "industry" ? "3 3" : undefined}
                    opacity={isHighlighted ? 1 : 0.6}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="graph-nodes">
              {positionedNodes
                .filter((n) => visibleNodeIds.has(n.id))
                .map((node) => {
                  const style = typeColors[node.type] || typeColors.founder;
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => handleNodeClick(node)}
                      className={`graph-node ${isSelected ? "selected" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        r={node.radius}
                        fill={isSelected ? style.fill : style.bg}
                        stroke={style.stroke}
                        strokeWidth={isSelected ? 3.5 : 2}
                        filter="url(#nodeGlow)"
                      />

                      <text
                        textAnchor="middle"
                        dy={node.radius + 13}
                        fontSize="10"
                        fontWeight="700"
                        fill="#1e293b"
                        className="graph-node-label"
                      >
                        {node.label.length > 14 ? `${node.label.slice(0, 12)}…` : node.label}
                      </text>

                      <text
                        textAnchor="middle"
                        dy={4}
                        fontSize="9"
                        fontWeight="800"
                        fill={isSelected ? "#ffffff" : style.text}
                      >
                        {node.label.charAt(0).toUpperCase()}
                      </text>
                    </g>
                  );
                })}
            </g>
          </svg>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="graph-node-drawer">
            <div className="node-drawer-header">
              <span
                className="node-type-pill"
                style={{
                  background: typeColors[selectedNode.type]?.bg,
                  color: typeColors[selectedNode.type]?.text,
                  border: `1px solid ${typeColors[selectedNode.type]?.stroke}`,
                }}
              >
                {typeColors[selectedNode.type]?.label || selectedNode.type}
              </span>
              <button type="button" onClick={() => setSelectedNode(null)}>
                <X size={15} />
              </button>
            </div>

            <h4 className="node-drawer-title">{selectedNode.label}</h4>

            {selectedNode.industry && (
              <p className="node-drawer-meta">
                <strong>Industry:</strong> {selectedNode.industry}
              </p>
            )}
            {selectedNode.fundingStage && (
              <p className="node-drawer-meta">
                <strong>Stage:</strong> {selectedNode.fundingStage}
              </p>
            )}
            {selectedNode.type && selectedNode.type !== "industry" && (
              <p className="node-drawer-meta">
                <strong>Ecosystem Role:</strong> {selectedNode.type}
              </p>
            )}

            <div className="node-connections-list">
              <span className="font-bold text-xs text-slate-700 block mb-2">
                Real Network Edges ({selectedConnections.length}):
              </span>
              {selectedConnections.length > 0 ? (
                selectedConnections.map((c, i) => (
                  <div key={i} className="node-conn-item">
                    <span className="conn-name">{c.node.label}</span>
                    <span className="conn-rel">{c.relation}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  No verified connection edges logged yet.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EcosystemGraph;
