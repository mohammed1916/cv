import { useMemo } from "react";
import StoryPanel from "../../components/shared/StoryPanel";
import "./CloneGraphStory.css";

const SVG_WIDTH = 340;
const SVG_HEIGHT = 220;
const NODE_RADIUS = 20;

/**
 * Computes deterministic 2D node layout positions for graphs up to 20 nodes.
 */
function getGraphPositions(numNodes, width = SVG_WIDTH, height = SVG_HEIGHT) {
  const positions = {};
  if (numNodes === 0) return positions;
  if (numNodes === 1) {
    positions[1] = { x: width / 2, y: height / 2 };
    return positions;
  }
  if (numNodes === 2) {
    positions[1] = { x: width * 0.28, y: height / 2 };
    positions[2] = { x: width * 0.72, y: height / 2 };
    return positions;
  }
  if (numNodes === 3) {
    positions[1] = { x: width / 2, y: 48 };
    positions[2] = { x: width * 0.24, y: height - 52 };
    positions[3] = { x: width * 0.76, y: height - 52 };
    return positions;
  }
  if (numNodes === 4) {
    const padX = 75;
    const padY = 52;
    positions[1] = { x: padX, y: padY };
    positions[2] = { x: width - padX, y: padY };
    positions[3] = { x: width - padX, y: height - padY };
    positions[4] = { x: padX, y: height - padY };
    return positions;
  }
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.38;
  for (let i = 1; i <= numNodes; i++) {
    const angle = (2 * Math.PI * (i - 1)) / numNodes - Math.PI / 2;
    positions[i] = {
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    };
  }
  return positions;
}

export default function CloneGraphStory({ story, step }) {
  const { originalGraph, clonedGraph } = story || {};
  const numNodes = originalGraph?.numNodes ?? 0;

  const positions = useMemo(() => getGraphPositions(numNodes), [numNodes]);

  if (!step || !story) {
    return (
      <StoryPanel
        title="Clone Graph"
        description="Press Play or Next to step through the BFS graph cloning algorithm."
        label="Clone Graph Visual Story"
      >
        <p className="cg-story__idle">
          Deep-clones an undirected graph using Breadth-First Search (BFS) and a hash map
          to preserve node identities and cycle relationships.
        </p>
      </StoryPanel>
    );
  }

  const {
    phase,
    explanation,
    queue = [],
    clones = {},
    curr,
    neighbor,
    activeOriginalNode,
    activeCloneNode,
    activeEdge,
    highlightCloneEdge,
    clonedUndirectedKeys = [],
  } = step;

  const clonedCount = Object.keys(clones).length;
  const totalEdges = originalGraph?.edges?.length ?? 0;
  const clonedEdgesCount = clonedUndirectedKeys.length;

  const getPhaseBadge = () => {
    switch (phase) {
      case "start":
        return { label: "START", class: "badge-start" };
      case "check-null":
        return { label: "CHECK NULL", class: "badge-check" };
      case "init-map":
        return { label: "INIT MAP", class: "badge-init" };
      case "init-queue":
        return { label: "INIT QUEUE", class: "badge-init" };
      case "clone-start":
        return { label: "CLONE ROOT", class: "badge-clone" };
      case "check-queue":
        return { label: "CHECK QUEUE", class: "badge-loop" };
      case "pop":
        return { label: "DEQUEUE", class: "badge-pop" };
      case "scan-neighbors":
        return { label: "NEIGHBORS", class: "badge-scan" };
      case "next-neighbor":
        return { label: "INSPECT NBR", class: "badge-nbr" };
      case "check-neighbor":
        return { label: "CHECK CLONE", class: "badge-check" };
      case "clone-node":
        return { label: "CLONE NODE", class: "badge-clone" };
      case "enqueue":
        return { label: "ENQUEUE", class: "badge-enqueue" };
      case "clone-edge":
        return { label: "CONNECT EDGE", class: "badge-edge" };
      case "queue-empty":
        return { label: "QUEUE EMPTY", class: "badge-empty" };
      case "done":
        return { label: "COMPLETE", class: "badge-done" };
      default:
        return { label: phase.toUpperCase(), class: "badge-default" };
    }
  };

  const phaseBadge = getPhaseBadge();

  return (
    <StoryPanel
      title="Clone Graph — BFS Side-by-Side Traversal"
      description={explanation}
      label="Clone Graph Visual Story"
      className="cg-story"
    >
      {/* Metrics & Phase Header */}
      <div className="cg-story__header" aria-label="Algorithm status metrics">
        <div className="cg-story__badges">
          <span className={`cg-badge ${phaseBadge.class}`}>{phaseBadge.label}</span>
          <span className="cg-badge cg-badge--info">
            curr: {curr ? `Node(${curr})` : "None"}
          </span>
          <span className="cg-badge cg-badge--warning">
            neighbor: {neighbor ? `Node(${neighbor})` : "None"}
          </span>
          <span className="cg-badge cg-badge--success">
            Cloned: {clonedCount} / {numNodes} nodes
          </span>
          <span className="cg-badge cg-badge--accent">
            Edges: {clonedEdgesCount} / {totalEdges} wired
          </span>
        </div>
      </div>

      {numNodes === 0 ? (
        /* Empty Graph Edge Case */
        <div className="cg-story__empty-state" role="status">
          <div className="cg-empty-icon">∅</div>
          <h4>Empty Graph (Input node is None)</h4>
          <p>
            The input graph contains 0 nodes. The algorithm immediately returns{" "}
            <code>None</code> without allocating clones or initiating BFS.
          </p>
        </div>
      ) : (
        /* Dual Graphs Side-by-Side View */
        <div className="cg-story__graphs-container">
          {/* Original Graph Card */}
          <div className="cg-story__graph-card original-card">
            <div className="cg-card-header">
              <span className="cg-card-title">Original Graph (Source)</span>
              <span className="cg-card-tag orig-tag">Heap A • Read-Only</span>
            </div>

            <div className="cg-svg-wrap">
              <svg
                className="cg-svg"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                role="img"
                aria-label="Original graph visualization"
              >
                {/* Edges */}
                <g className="cg-edges-layer">
                  {originalGraph?.edges.map((edge) => {
                    const p1 = positions[edge.u];
                    const p2 = positions[edge.v];
                    if (!p1 || !p2) return null;

                    const isEdgeActive =
                      activeEdge &&
                      ((activeEdge.from === edge.u && activeEdge.to === edge.v) ||
                        (activeEdge.from === edge.v && activeEdge.to === edge.u));

                    return (
                      <line
                        key={`orig-edge-${edge.key}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        className={`cg-edge orig-edge ${isEdgeActive ? "edge-active" : ""}`}
                      />
                    );
                  })}
                </g>

                {/* Nodes */}
                <g className="cg-nodes-layer">
                  {originalGraph?.nodes.map((node) => {
                    const pos = positions[node.val];
                    if (!pos) return null;

                    const isCurrent = curr === node.val;
                    const isNeighbor = neighbor === node.val;
                    const isInQueue = queue.includes(node.val);
                    const isCloned = node.val in clones;
                    const isOriginActive = activeOriginalNode === node.val;

                    let nodeClass = "orig-node";
                    if (isCurrent) nodeClass += " is-current";
                    else if (isNeighbor) nodeClass += " is-neighbor";
                    else if (isInQueue) nodeClass += " is-queued";
                    else if (isCloned) nodeClass += " is-cloned";

                    if (isOriginActive) nodeClass += " is-origin-active";

                    return (
                      <g key={`orig-node-${node.val}`} className={nodeClass}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={NODE_RADIUS}
                          className="node-circle"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          className="node-label"
                        >
                          {node.val}
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + NODE_RADIUS + 13}
                          textAnchor="middle"
                          className="node-address"
                        >
                          {node.address}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Transfer & Direction Indicator */}
          <div className="cg-story__transfer-indicator" aria-hidden="true">
            <div className="transfer-arrow">➔</div>
            <div className="transfer-badge">
              {phase === "clone-start" || phase === "clone-node"
                ? "+ New Node"
                : phase === "clone-edge"
                ? "+ Add Edge"
                : phase === "enqueue"
                ? "Enqueue"
                : "clones[u]"}
            </div>
          </div>

          {/* Cloned Graph Card */}
          <div className="cg-story__graph-card clone-card">
            <div className="cg-card-header">
              <span className="cg-card-title">Cloned Graph (Deep Copy)</span>
              <span className="cg-card-tag clone-tag">Heap B • New Nodes</span>
            </div>

            <div className="cg-svg-wrap">
              <svg
                className="cg-svg"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                role="img"
                aria-label="Cloned graph visualization"
              >
                {/* Ghosted target edges & Built clone edges */}
                <g className="cg-edges-layer">
                  {clonedGraph?.edges.map((edge) => {
                    const p1 = positions[edge.u];
                    const p2 = positions[edge.v];
                    if (!p1 || !p2) return null;

                    const isClonedEdge = clonedUndirectedKeys.includes(edge.key);
                    const isHighlightEdge =
                      highlightCloneEdge &&
                      ((highlightCloneEdge.from === edge.u &&
                        highlightCloneEdge.to === edge.v) ||
                        (highlightCloneEdge.from === edge.v &&
                          highlightCloneEdge.to === edge.u));

                    if (!isClonedEdge) {
                      // Faint ghost guideline showing where future edge connects
                      return (
                        <line
                          key={`clone-edge-ghost-${edge.key}`}
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          className="cg-edge-ghost"
                        />
                      );
                    }

                    return (
                      <line
                        key={`clone-edge-${edge.key}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        className={`cg-edge clone-edge ${
                          isHighlightEdge ? "edge-clone-active" : ""
                        }`}
                      />
                    );
                  })}
                </g>

                {/* Clone Nodes */}
                <g className="cg-nodes-layer">
                  {clonedGraph?.nodes.map((node) => {
                    const pos = positions[node.val];
                    if (!pos) return null;

                    const cloneData = clones[node.val];
                    const isAllocated = Boolean(cloneData);
                    const isCloneActive = activeCloneNode === node.val;

                    if (!isAllocated) {
                      return (
                        <g
                          key={`clone-node-pending-${node.val}`}
                          className="clone-node-ghost"
                        >
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={NODE_RADIUS}
                            className="node-circle ghost"
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 4}
                            textAnchor="middle"
                            className="node-label ghost"
                          >
                            {node.val}&apos;
                          </text>
                          <text
                            x={pos.x}
                            y={pos.y + NODE_RADIUS + 13}
                            textAnchor="middle"
                            className="node-address ghost"
                          >
                            unallocated
                          </text>
                        </g>
                      );
                    }

                    let cloneClass = "clone-node is-allocated";
                    if (isCloneActive) cloneClass += " is-clone-active";

                    return (
                      <g key={`clone-node-${node.val}`} className={cloneClass}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={NODE_RADIUS}
                          className="node-circle clone"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          className="node-label clone"
                        >
                          {node.val}&apos;
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + NODE_RADIUS + 13}
                          textAnchor="middle"
                          className="node-address clone"
                        >
                          {cloneData.address}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* BFS Queue Evolution Section */}
      <div className="cg-story__queue-section">
        <div className="cg-section-header">
          <div className="cg-section-title">
            <span>BFS Queue (<code>queue = deque([node])</code>)</span>
            <span className="cg-count-pill">{queue.length} in queue</span>
          </div>
          <span className="cg-section-sub">
            FIFO exploration order ensures nodes are cloned before their incident edges are connected.
          </span>
        </div>

        <div className="cg-queue-rail" role="region" aria-label="BFS Queue items">
          <div className="queue-end-label front">◀ FRONT (popleft)</div>
          <div className="queue-items">
            {queue.length === 0 ? (
              <span className="queue-empty-text">[ Queue is empty ]</span>
            ) : (
              queue.map((val, idx) => {
                const isNextToPop = idx === 0;
                return (
                  <div
                    key={`queue-pill-${val}-${idx}`}
                    className={`queue-pill ${isNextToPop ? "is-head" : ""}`}
                  >
                    <span className="pill-node">Node({val})</span>
                    <span className="pill-addr">
                      {originalGraph?.nodes.find((n) => n.val === val)?.address}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="queue-end-label back">BACK (append) ▶</div>
        </div>
      </div>

      {/* Clones Hash Map Lookup Table */}
      <div className="cg-story__table-section">
        <div className="cg-section-header">
          <div className="cg-section-title">
            <span>Clone Hash Map (<code>clones = &#123;&#125;</code>)</span>
            <span className="cg-count-pill">
              {clonedCount} registered
            </span>
          </div>
          <span className="cg-section-sub">
            Guarantees each node is cloned exactly once and avoids infinite recursion on cycles.
          </span>
        </div>

        <div className="cg-table-wrapper">
          <table className="cg-table" aria-label="Clone hash map lookup table">
            <thead>
              <tr>
                <th scope="col">Key (val)</th>
                <th scope="col">Original Object</th>
                <th scope="col">Cloned Object</th>
                <th scope="col">Cloned Neighbors List</th>
                <th scope="col">Wiring Status</th>
              </tr>
            </thead>
            <tbody>
              {numNodes === 0 ? (
                <tr>
                  <td colSpan={5} className="cg-table-empty">
                    Hash map is empty {`{}`}
                  </td>
                </tr>
              ) : (
                originalGraph?.nodes.map((origNode) => {
                  const val = origNode.val;
                  const clone = clones[val];
                  const isRegistered = Boolean(clone);
                  const isRowActive = curr === val || neighbor === val;
                  const totalExpected = originalGraph.adj[val]?.length ?? 0;
                  const connectedNow = clone?.neighbors.length ?? 0;
                  const isFullyConnected = isRegistered && connectedNow === totalExpected;

                  return (
                    <tr
                      key={`clone-row-${val}`}
                      className={`cg-tr ${isRowActive ? "tr-active" : ""} ${
                        !isRegistered ? "tr-unregistered" : ""
                      }`}
                    >
                      <td className="td-key">
                        <code>{val}</code>
                      </td>
                      <td className="td-orig">
                        <span className="obj-badge orig">
                          Node({val}) @ {origNode.address}
                        </span>
                      </td>
                      <td className="td-clone">
                        {isRegistered ? (
                          <span className="obj-badge clone">
                            Node({val})&apos; @ {clone.address}
                          </span>
                        ) : (
                          <span className="obj-pending">Not cloned yet</span>
                        )}
                      </td>
                      <td className="td-neighbors">
                        {isRegistered ? (
                          <code className="neighbors-list">
                            [
                            {clone.neighbors.length > 0
                              ? clone.neighbors.map((n) => `Node(${n})'`).join(", ")
                              : ""}
                            ]
                          </code>
                        ) : (
                          <span className="obj-pending">—</span>
                        )}
                      </td>
                      <td className="td-status">
                        {!isRegistered ? (
                          <span className="status-pill status-unallocated">Pending</span>
                        ) : isFullyConnected ? (
                          <span className="status-pill status-done">
                            Complete ({connectedNow}/{totalExpected})
                          </span>
                        ) : (
                          <span className="status-pill status-building">
                            Building ({connectedNow}/{totalExpected})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StoryPanel>
  );
}
