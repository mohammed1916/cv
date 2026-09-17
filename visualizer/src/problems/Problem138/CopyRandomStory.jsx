import StoryPanel from "../../components/shared/StoryPanel";
import "./CopyRandomStory.css";

export default function CopyRandomStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Copy List with Random Pointer"
        description="Press Play or use Next to step through the 3-pass O(1) space algorithm."
        label="Copy List with Random Pointer story"
        className="copy-random-story"
      >
        <p className="copy-random-story__empty">No active trace loaded.</p>
      </StoryPanel>
    );
  }

  const {
    phase,
    phaseTitle,
    explanation,
    message,
    curr,
    copy,
    copyHead,
    originalNodes = [],
    clonedNodes = [],
    highlightedLinks = [],
  } = step;

  const n = originalNodes.length;

  // Layout parameters
  const colSpacing = 160;
  const startX = 90;
  const yOrig = 125;
  const yClone = 245;
  const svgWidth = Math.max(680, startX + n * colSpacing + 70);
  const svgHeight = 360;

  const getX = (idx) => startX + idx * colSpacing;

  const isLinkHighlighted = (fromKey, type) =>
    highlightedLinks.some((l) => l.from === fromKey && l.type === type);

  return (
    <StoryPanel
      title={phaseTitle}
      description={message}
      label="Copy List with Random Pointer visual story"
      className="copy-random-story"
    >
      <div className="copy-random-story__explanation">{explanation}</div>

      {/* Phase progress banner */}
      <div
        className="copy-random-story__phase-tracker"
        role="region"
        aria-label="Algorithm Phase Tracker"
      >
        <div
          className={`phase-step ${
            phase === "interleave"
              ? "active"
              : ["random", "decouple", "done"].includes(phase)
              ? "done"
              : ""
          }`}
        >
          <span className="phase-num">1</span>
          <div className="phase-text">
            <strong>Pass 1: Interleave</strong>
            <small>A → A′ → B → B′</small>
          </div>
        </div>

        <div className="phase-divider" aria-hidden="true">
          →
        </div>

        <div
          className={`phase-step ${
            phase === "random"
              ? "active"
              : ["decouple", "done"].includes(phase)
              ? "done"
              : ""
          }`}
        >
          <span className="phase-num">2</span>
          <div className="phase-text">
            <strong>Pass 2: Wire Random</strong>
            <small>A′.random = A.random.next</small>
          </div>
        </div>

        <div className="phase-divider" aria-hidden="true">
          →
        </div>

        <div
          className={`phase-step ${
            phase === "decouple" ? "active" : phase === "done" ? "done" : ""
          }`}
        >
          <span className="phase-num">3</span>
          <div className="phase-text">
            <strong>Pass 3: Decouple</strong>
            <small>Separate original & clone</small>
          </div>
        </div>
      </div>

      {/* Metrics & pointer badges */}
      <div
        className="copy-random-story__metrics"
        role="region"
        aria-label="Pointer status metrics"
      >
        <div className="metric-card">
          <span className="metric-label">curr pointer</span>
          <span
            className={`metric-val ${curr !== null ? "val-curr" : "val-muted"}`}
          >
            {curr !== null ? `Node ${curr} (val: ${originalNodes[curr].val})` : "null"}
          </span>
          <span className="metric-sub">
            {phase === "interleave"
              ? "Interleaving clone node"
              : phase === "random"
              ? "Inspecting random reference"
              : phase === "decouple"
              ? "Restoring next links"
              : "Finished traversal"}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">copy pointer</span>
          <span
            className={`metric-val ${copy !== null ? "val-copy" : "val-muted"}`}
          >
            {copy !== null
              ? `Clone ${copy}′ (val: ${originalNodes[copy].val})`
              : "—"}
          </span>
          <span className="metric-sub">
            {copy !== null ? `Operating on clone ${copy}′` : "Awaiting assignment"}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">copy_head</span>
          <span
            className={`metric-val ${
              copyHead !== null ? "val-head" : "val-muted"
            }`}
          >
            {copyHead !== null ? `Clone ${copyHead}′` : "not set"}
          </span>
          <span className="metric-sub">Return value reference</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Space Complexity</span>
          <span className="metric-val val-badge">O(1) Auxiliary</span>
          <span className="metric-sub">No hash map required</span>
        </div>
      </div>

      {/* Linked List Canvas */}
      {n === 0 ? (
        <div className="copy-random-story__empty-card">
          <p>
            <strong>Head is null (empty list).</strong>
          </p>
          <p>copyRandomList returns null immediately without processing.</p>
        </div>
      ) : (
        <div
          className="copy-random-story__canvas-wrap"
          role="region"
          aria-label="Linked list nodes and pointers visualizer"
        >
          <div className="canvas-legend">
            <span className="legend-item legend-orig">
              <span className="legend-swatch swatch-orig" />
              Original Nodes (Row 1)
            </span>
            <span className="legend-item legend-clone">
              <span className="legend-swatch swatch-clone" />
              Cloned Nodes (Row 2)
            </span>
            <span className="legend-item legend-rnd-orig">
              <span className="legend-line line-orig" />
              Orig Random Arc (Top)
            </span>
            <span className="legend-item legend-rnd-clone">
              <span className="legend-line line-clone" />
              Clone Random Arc (Bottom)
            </span>
          </div>

          <svg
            className="copy-random-story__svg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            width={svgWidth}
            height={svgHeight}
          >
            <title>Interactive Linked List with Next and Random Pointers</title>
            <desc>
              Displays original nodes in top row and cloned nodes in bottom row
              with dynamic next arrows and curved random pointer arcs.
            </desc>

            <defs>
              <marker
                id="arrow-orig-next"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#3b82f6" />
              </marker>

              <marker
                id="arrow-clone-next"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#a855f7" />
              </marker>

              <marker
                id="arrow-orig-random"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
              </marker>

              <marker
                id="arrow-clone-random"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#c084fc" />
              </marker>

              <marker
                id="arrow-highlight"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* 1. ORIGINAL RANDOM POINTER ARCS (Above top row) */}
            {originalNodes.map((node) => {
              if (node.random === null) return null;
              const fromX = getX(node.id);
              const toX = getX(node.random);
              const isHl = isLinkHighlighted(node.key, "random");

              if (node.id === node.random) {
                // Self-loop
                const pathD = `M ${fromX - 12} ${yOrig - 20} C ${fromX - 30} ${
                  yOrig - 65
                }, ${fromX + 30} ${yOrig - 65}, ${fromX + 12} ${yOrig - 20}`;
                return (
                  <g key={`orig-rnd-${node.id}`} className="random-arc-group">
                    <path
                      d={pathD}
                      className={`arc-random arc-orig ${isHl ? "arc-hl" : ""}`}
                      markerEnd={
                        isHl
                          ? "url(#arrow-highlight)"
                          : "url(#arrow-orig-random)"
                      }
                    />
                    <text
                      x={fromX}
                      y={yOrig - 70}
                      className="arc-label arc-label--orig"
                      textAnchor="middle"
                    >
                      rnd: self
                    </text>
                  </g>
                );
              }

              // Arc between distinct nodes
              const dist = Math.abs(toX - fromX);
              const arcH = Math.min(65, 25 + (dist / colSpacing) * 12);
              const midX = (fromX + toX) / 2;
              const midY = yOrig - 20 - arcH;
              const pathD = `M ${fromX} ${yOrig - 20} Q ${midX} ${midY} ${toX} ${
                yOrig - 20
              }`;

              return (
                <g key={`orig-rnd-${node.id}`} className="random-arc-group">
                  <path
                    d={pathD}
                    className={`arc-random arc-orig ${isHl ? "arc-hl" : ""}`}
                    markerEnd={
                      isHl ? "url(#arrow-highlight)" : "url(#arrow-orig-random)"
                    }
                  />
                  <text
                    x={midX}
                    y={midY - 4}
                    className="arc-label arc-label--orig"
                    textAnchor="middle"
                  >
                    rnd→[{node.random}]
                  </text>
                </g>
              );
            })}

            {/* 2. CLONED RANDOM POINTER ARCS (Below bottom row) */}
            {clonedNodes.map((node) => {
              if (node.random === null || !node.created) return null;
              const fromX = getX(node.id);
              const toX = getX(node.random);
              const isHl = isLinkHighlighted(node.key, "random");

              if (node.id === node.random) {
                // Self-loop
                const pathD = `M ${fromX - 12} ${yClone + 20} C ${fromX - 30} ${
                  yClone + 65
                }, ${fromX + 30} ${yClone + 65}, ${fromX + 12} ${yClone + 20}`;
                return (
                  <g key={`clone-rnd-${node.id}`} className="random-arc-group">
                    <path
                      d={pathD}
                      className={`arc-random arc-clone ${isHl ? "arc-hl" : ""}`}
                      markerEnd={
                        isHl
                          ? "url(#arrow-highlight)"
                          : "url(#arrow-clone-random)"
                      }
                    />
                    <text
                      x={fromX}
                      y={yClone + 78}
                      className="arc-label arc-label--clone"
                      textAnchor="middle"
                    >
                      rnd: self
                    </text>
                  </g>
                );
              }

              // Arc between distinct clone nodes
              const dist = Math.abs(toX - fromX);
              const arcH = Math.min(65, 25 + (dist / colSpacing) * 12);
              const midX = (fromX + toX) / 2;
              const midY = yClone + 20 + arcH;
              const pathD = `M ${fromX} ${yClone + 20} Q ${midX} ${midY} ${toX} ${
                yClone + 20
              }`;

              return (
                <g key={`clone-rnd-${node.id}`} className="random-arc-group">
                  <path
                    d={pathD}
                    className={`arc-random arc-clone ${isHl ? "arc-hl" : ""}`}
                    markerEnd={
                      isHl
                        ? "url(#arrow-highlight)"
                        : "url(#arrow-clone-random)"
                    }
                  />
                  <text
                    x={midX}
                    y={midY + 14}
                    className="arc-label arc-label--clone"
                    textAnchor="middle"
                  >
                    rnd→[{node.random}′]
                  </text>
                </g>
              );
            })}

            {/* 3. NEXT POINTERS FROM ORIGINAL NODES */}
            {originalNodes.map((node, i) => {
              const fromX = getX(i);
              const nextKey = node.nextKey;
              const isHl = isLinkHighlighted(node.key, "next");

              if (nextKey === `clone-${i}`) {
                // Downward arrow into interleaved clone
                return (
                  <g key={`orig-next-${i}`}>
                    <line
                      x1={fromX}
                      y1={yOrig + 20}
                      x2={fromX}
                      y2={yClone - 24}
                      className={`link-line link-interleave ${
                        isHl ? "link-hl" : ""
                      }`}
                      markerEnd={
                        isHl ? "url(#arrow-highlight)" : "url(#arrow-clone-next)"
                      }
                    />
                    <text
                      x={fromX + 12}
                      y={(yOrig + yClone) / 2}
                      className="link-label"
                    >
                      next
                    </text>
                  </g>
                );
              }

              if (nextKey === `orig-${i + 1}`) {
                // Horizontal arrow to next original node
                const toX = getX(i + 1);
                return (
                  <g key={`orig-next-${i}`}>
                    <line
                      x1={fromX + 34}
                      y1={yOrig}
                      x2={toX - 38}
                      y2={yOrig}
                      className={`link-line link-orig-next ${
                        isHl ? "link-hl" : ""
                      }`}
                      markerEnd={
                        isHl ? "url(#arrow-highlight)" : "url(#arrow-orig-next)"
                      }
                    />
                  </g>
                );
              }

              if (nextKey === null && i === n - 1) {
                // End of original list (null)
                return (
                  <g key={`orig-null-${i}`} className="null-terminator">
                    <line
                      x1={fromX + 34}
                      y1={yOrig}
                      x2={fromX + 58}
                      y2={yOrig}
                      className="link-null-line"
                    />
                    <text
                      x={fromX + 64}
                      y={yOrig + 4}
                      className="null-text"
                    >
                      null
                    </text>
                  </g>
                );
              }

              return null;
            })}

            {/* 4. NEXT POINTERS FROM CLONED NODES */}
            {clonedNodes.map((node, i) => {
              if (!node.created) return null;
              const fromX = getX(i);
              const nextKey = node.nextKey;
              const isHl = isLinkHighlighted(node.key, "next");

              if (nextKey === `orig-${i + 1}`) {
                // Diagonal arrow up to next original node
                const toX = getX(i + 1);
                return (
                  <g key={`clone-next-${i}`}>
                    <line
                      x1={fromX + 28}
                      y1={yClone - 16}
                      x2={toX - 28}
                      y2={yOrig + 22}
                      className={`link-line link-diagonal ${
                        isHl ? "link-hl" : ""
                      }`}
                      markerEnd={
                        isHl ? "url(#arrow-highlight)" : "url(#arrow-orig-next)"
                      }
                    />
                    <text
                      x={(fromX + toX) / 2 + 6}
                      y={(yOrig + yClone) / 2}
                      className="link-label"
                    >
                      next
                    </text>
                  </g>
                );
              }

              if (nextKey === `clone-${i + 1}`) {
                // Horizontal arrow directly to next cloned node
                const toX = getX(i + 1);
                return (
                  <g key={`clone-next-${i}`}>
                    <line
                      x1={fromX + 34}
                      y1={yClone}
                      x2={toX - 38}
                      y2={yClone}
                      className={`link-line link-clone-next ${
                        isHl ? "link-hl" : ""
                      }`}
                      markerEnd={
                        isHl ? "url(#arrow-highlight)" : "url(#arrow-clone-next)"
                      }
                    />
                  </g>
                );
              }

              if (nextKey === null && i === n - 1) {
                // End of clone list (null)
                return (
                  <g key={`clone-null-${i}`} className="null-terminator">
                    <line
                      x1={fromX + 34}
                      y1={yClone}
                      x2={fromX + 58}
                      y2={yClone}
                      className="link-null-line"
                    />
                    <text
                      x={fromX + 64}
                      y={yClone + 4}
                      className="null-text"
                    >
                      null
                    </text>
                  </g>
                );
              }

              return null;
            })}

            {/* 5. ORIGINAL NODES (Top Row) */}
            {originalNodes.map((node, i) => {
              const x = getX(i);
              const isCurr = curr === i;

              return (
                <g
                  key={node.key}
                  className={`node-group node-orig ${isCurr ? "node-active" : ""}`}
                  transform={`translate(${x}, ${yOrig})`}
                >
                  {/* Curr pointer badge above original node */}
                  {isCurr && (
                    <g
                      className="pointer-badge pointer-curr"
                      transform="translate(0, -32)"
                    >
                      <rect
                        x="-24"
                        y="-14"
                        width="48"
                        height="18"
                        rx="4"
                        className="badge-bg badge-bg--curr"
                      />
                      <text y="-1" className="badge-text" textAnchor="middle">
                        curr ↓
                      </text>
                    </g>
                  )}

                  <rect
                    x="-34"
                    y="-20"
                    width="68"
                    height="40"
                    rx="8"
                    className="node-box node-box--orig"
                  />
                  <text y="-3" className="node-val" textAnchor="middle">
                    {node.val}
                  </text>
                  <text y="14" className="node-tag" textAnchor="middle">
                    Orig [{i}]
                  </text>
                </g>
              );
            })}

            {/* 6. CLONED NODES (Bottom Row) */}
            {clonedNodes.map((node, i) => {
              const x = getX(i);
              const isCopy = copy === i;
              const isHead = copyHead === i;
              const created = node.created;

              return (
                <g
                  key={node.key}
                  className={`node-group node-clone ${
                    !created ? "node-ghost" : ""
                  } ${isCopy ? "node-active-clone" : ""}`}
                  transform={`translate(${x}, ${yClone})`}
                >
                  {/* Copy pointer badge */}
                  {isCopy && (
                    <g
                      className="pointer-badge pointer-copy"
                      transform="translate(0, 36)"
                    >
                      <rect
                        x="-24"
                        y="-12"
                        width="48"
                        height="18"
                        rx="4"
                        className="badge-bg badge-bg--copy"
                      />
                      <text y="1" className="badge-text" textAnchor="middle">
                        ↑ copy
                      </text>
                    </g>
                  )}

                  {/* Copy Head crown badge */}
                  {isHead && (
                    <g
                      className="pointer-badge pointer-head"
                      transform="translate(0, -28)"
                    >
                      <rect
                        x="-36"
                        y="-12"
                        width="72"
                        height="18"
                        rx="4"
                        className="badge-bg badge-bg--head"
                      />
                      <text y="1" className="badge-text" textAnchor="middle">
                        ★ copy_head
                      </text>
                    </g>
                  )}

                  <rect
                    x="-34"
                    y="-20"
                    width="68"
                    height="40"
                    rx="8"
                    className="node-box node-box--clone"
                  />
                  <text y="-3" className="node-val" textAnchor="middle">
                    {node.val}
                  </text>
                  <text y="14" className="node-tag" textAnchor="middle">
                    {created ? `Clone [${i}′]` : "uncreated"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* State Breakdown & Decoupled Lists Inspector */}
      <div
        className="copy-random-story__inspector"
        role="region"
        aria-label="Current list structures"
      >
        <div className="inspector-card">
          <h4 className="inspector-title">Original List</h4>
          <div className="nodes-chain">
            {originalNodes.map((n, i) => (
              <div
                key={n.key}
                className={`chain-chip ${curr === i ? "chip-curr" : ""}`}
              >
                <span className="chip-val">{n.val}</span>
                <span className="chip-sub">
                  r: {n.random !== null ? `[${n.random}]` : "∅"}
                </span>
                {i < originalNodes.length - 1 && (
                  <span className="chip-sep">→</span>
                )}
              </div>
            ))}
            <span className="chip-null">null</span>
          </div>
        </div>

        <div className="inspector-card">
          <h4 className="inspector-title">Cloned List</h4>
          <div className="nodes-chain">
            {clonedNodes.map((n, i) => (
              <div
                key={n.key}
                className={`chain-chip chain-chip--clone ${
                  !n.created ? "chip-uncreated" : ""
                } ${copy === i ? "chip-copy" : ""}`}
              >
                <span className="chip-val">
                  {n.created ? `${n.val}′` : "—"}
                </span>
                <span className="chip-sub">
                  r:{" "}
                  {n.created
                    ? n.random !== null
                      ? `[${n.random}′]`
                      : "∅"
                    : "?"}
                </span>
                {i < clonedNodes.length - 1 && (
                  <span className="chip-sep">→</span>
                )}
              </div>
            ))}
            <span className="chip-null">null</span>
          </div>
        </div>
      </div>
    </StoryPanel>
  );
}
