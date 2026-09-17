import { useMemo } from "react";
import StoryPanel from "../../components/shared/StoryPanel";
import "./Cycle2Story.css";

/**
 * Story visualization component for LeetCode Problem 142 (Linked List Cycle II).
 * Highlights:
 * - Circular & linear linked list layout with meeting point highlight
 * - Phase 1 (Tortoise & Hare cycle detection) vs Phase 2 (Cycle entrance search)
 * - Invariant math card proving 2(F + a) = F + a + nC => F = nC - a
 * - Dual pointer progression towards cycle entrance
 */
export default function Cycle2Story({ story, step }) {
  const nodes = story?.nodes || [];
  const cyclePos = story?.pos ?? -1;
  const n = nodes.length;

  // Calculate layout coordinates
  const layout = useMemo(() => {
    if (n === 0) {
      return { width: 400, height: 160, coords: [] };
    }

    const NODE_RADIUS = 22;
    const coords = [];

    if (cyclePos === -1) {
      // Linear list layout
      const startX = 60;
      const stepX = 76;
      const y = 100;
      for (let i = 0; i < n; i++) {
        coords.push({ x: startX + i * stepX, y, id: i });
      }
      const width = Math.max(480, startX + n * stepX + 90);
      const height = 200;
      return { width, height, coords, nodeRadius: NODE_RADIUS };
    }

    // Cycle layout (prefix line + circle loop)
    const F = cyclePos;
    const C = n - cyclePos;
    const startX = 60;
    const stepX = 72;
    const R = Math.max(70, Math.min(125, 36 + C * 14));
    const yCenter = 130 + Math.max(0, R - 80);

    const xEntrance = startX + F * stepX;
    const cx = xEntrance + R;
    const cy = yCenter;

    // Linear prefix nodes: 0 .. F - 1
    for (let i = 0; i < F; i++) {
      coords.push({
        x: startX + i * stepX,
        y: cy,
        id: i,
        isPrefix: true,
      });
    }

    // Cycle nodes: F .. n - 1
    for (let k = 0; k < C; k++) {
      const idx = F + k;
      if (C === 1) {
        coords.push({
          x: cx - R,
          y: cy,
          id: idx,
          isCycle: true,
          isEntrance: true,
        });
      } else {
        // Clockwise rotation: theta starts at pi (leftmost) and decreases
        const theta = Math.PI - (2 * Math.PI * k) / C;
        coords.push({
          x: cx + R * Math.cos(theta),
          y: cy - R * Math.sin(theta),
          id: idx,
          isCycle: true,
          isEntrance: k === 0,
        });
      }
    }

    const width = Math.max(520, cx + R + 70);
    const height = cy + R + 70;

    return {
      width,
      height,
      coords,
      cx,
      cy,
      R,
      nodeRadius: NODE_RADIUS,
      cycleCount: C,
    };
  }, [n, cyclePos]);

  if (!step) {
    return (
      <StoryPanel
        title="Linked List Cycle II (Floyd's Algorithm)"
        description="Press Play or Step Forward to trace cycle detection and entrance identification."
        className="c2s-panel"
      >
        <div className="c2s-placeholder">
          <p>
            Floyd's Tortoise and Hare algorithm detects if a cycle exists and mathematically locates the exact node where the cycle begins.
          </p>
        </div>
      </StoryPanel>
    );
  }

  const {
    currentPhase,
    slow,
    fast,
    ptr1,
    ptr2,
    meetingPoint,
    cycleEntrance,
    result,
    isMeeting,
    isEntrance,
    mathInvariant,
    slowSteps = 0,
    fastSteps = 0,
    phase2Steps = 0,
  } = step;

  const isPhase1 = currentPhase === 1;
  const isPhase2 = currentPhase === 2;
  const isComplete = step.phase === "done";

  // Story Header Title
  const getStoryTitle = () => {
    if (n === 0) return "Empty Linked List — No Cycle";
    if (cyclePos === -1 && isComplete) return "Linear List Reached End — No Cycle";
    if (isComplete && result !== null) return `Cycle Entrance Confirmed at Node ${result}!`;
    if (isMeeting) return `Phase 1: Collision Detected at Meeting Node ${meetingPoint}!`;
    if (isEntrance) return `Phase 2: ptr1 & ptr2 Collided at Cycle Entrance Node ${cycleEntrance}!`;
    if (isPhase2) return `Phase 2: Advancing ptr1 (from head) & ptr2 (from meet)`;
    return `Phase 1: Detecting Cycle (slow 1x vs fast 2x)`;
  };

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={step.message}
      label="Linked List Cycle II Visual Story"
      className="c2s-panel"
    >
      {/* Top Banner: Mode Badge & Invariant Card */}
      <div className="c2s-header-row">
        <div
          className={`c2s-mode-badge ${
            isComplete
              ? result !== null
                ? "badge-success"
                : "badge-neutral"
              : isPhase2
              ? "badge-phase2"
              : "badge-phase1"
          }`}
          role="status"
        >
          <span className="badge-dot" />
          <span className="badge-text">
            {isComplete
              ? result !== null
                ? `COMPLETE · ENTRANCE NODE ${result}`
                : "COMPLETE · NO CYCLE"
              : isPhase2
              ? "PHASE 2 · LOCATING CYCLE ENTRANCE"
              : "PHASE 1 · FLOYD'S CYCLE DETECTION"}
          </span>
        </div>

        {mathInvariant && (
          <div className="c2s-math-pill" title="Mathematical distance invariant">
            <span className="math-pill-label">Invariant:</span>
            <code className="math-pill-code">{mathInvariant.formula}</code>
          </div>
        )}
      </div>

      {/* Explanation Text */}
      <p className="c2s-explanation">{step.explanation}</p>

      {/* Mathematical Invariant Insight Card */}
      {mathInvariant && (
        <section
          className="c2s-invariant-card"
          aria-label="Mathematical Proof Invariant Details"
        >
          <div className="invariant-header">
            <strong>Floyd's Cycle Distance Invariant Proof</strong>
            <span className="invariant-tag">2(F + a) = F + a + nC ⇒ F = nC - a</span>
          </div>
          <div className="invariant-grid">
            <div className="inv-stat">
              <span className="inv-label">F (Head to Entrance)</span>
              <span className="inv-val">{mathInvariant.F} step(s)</span>
            </div>
            <div className="inv-stat">
              <span className="inv-label">C (Cycle Length)</span>
              <span className="inv-val">{mathInvariant.C} node(s)</span>
            </div>
            <div className="inv-stat">
              <span className="inv-label">a (Entrance to Meet)</span>
              <span className="inv-val">{mathInvariant.a} step(s)</span>
            </div>
            <div className="inv-stat highlight">
              <span className="inv-label">Meeting Point</span>
              <span className="inv-val">Node {meetingPoint}</span>
            </div>
          </div>
          <div className="invariant-equation">
            <span>Substituted values:</span>
            <code>{mathInvariant.detailed}</code>
          </div>
        </section>
      )}

      {/* Interactive SVG Diagram */}
      <div className="c2s-svg-container" tabIndex={0} role="region" aria-label="Linked List Graph Visualization">
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="c2s-svg"
        >
          <defs>
            {/* Standard edge marker */}
            <marker
              id="c2s-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 7 4, 0 7" fill="var(--text-muted, #94a3b8)" />
            </marker>

            {/* Cycle loop return arrow */}
            <marker
              id="c2s-cycle-arrow"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#6366f1" />
            </marker>

            {/* Success arrow marker */}
            <marker
              id="c2s-arrow-success"
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#10b981" />
            </marker>
          </defs>

          {/* Edges */}
          {layout.coords.map((c, i) => {
            const nextIdx = nodes[i]?.next;
            if (nextIdx === null || nextIdx === undefined) {
              // Edge to NULL
              const fromX = c.x + layout.nodeRadius;
              const fromY = c.y;
              const toX = fromX + 44;
              const toY = fromY;
              return (
                <g key={`edge-null-${i}`}>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="var(--border, #64748b)"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    markerEnd="url(#c2s-arrow)"
                  />
                  <rect
                    x={toX + 4}
                    y={toY - 12}
                    width={38}
                    height={24}
                    rx="4"
                    fill="var(--surface2, #334155)"
                    stroke="var(--border, #475569)"
                  />
                  <text
                    x={toX + 23}
                    y={toY + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="var(--text-muted, #94a3b8)"
                  >
                    null
                  </text>
                </g>
              );
            }

            const targetCoord = layout.coords[nextIdx];
            if (!targetCoord) return null;

            // Self-loop edge (cycle length = 1)
            if (nextIdx === i) {
              const r = layout.nodeRadius;
              const loopR = 24;
              const topY = c.y - r;
              return (
                <path
                  key={`edge-self-${i}`}
                  d={`M ${c.x - 8} ${topY} C ${c.x - 30} ${topY - loopR * 2}, ${c.x + 30} ${topY - loopR * 2}, ${c.x + 8} ${topY}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  markerEnd="url(#c2s-cycle-arrow)"
                />
              );
            }

            // Return loop edge: from last node (n-1) back to entrance (cyclePos)
            const isReturnEdge = i === n - 1 && nextIdx === cyclePos;
            if (isReturnEdge) {
              const dx = targetCoord.x - c.x;
              const dy = targetCoord.y - c.y;
              const dist = Math.hypot(dx, dy);

              if (layout.cycleCount === 2) {
                // 2-node cycle: draw curved return arc below
                const fromX = c.x - layout.nodeRadius;
                const fromY = c.y + 6;
                const toX = targetCoord.x + layout.nodeRadius + 4;
                const toY = targetCoord.y + 6;
                const midX = (fromX + toX) / 2;
                const midY = c.y + 36;
                return (
                  <path
                    key={`edge-cycle-${i}`}
                    d={`M ${fromX} ${fromY} Q ${midX} ${midY}, ${toX} ${toY}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    markerEnd="url(#c2s-cycle-arrow)"
                  />
                );
              }

              // General return loop curve
              const uX = dx / dist;
              const uY = dy / dist;
              const fromX = c.x + uX * layout.nodeRadius;
              const fromY = c.y + uY * layout.nodeRadius;
              const toX = targetCoord.x - uX * (layout.nodeRadius + 4);
              const toY = targetCoord.y - uY * (layout.nodeRadius + 4);

              // Curve inward toward center
              const midX = (fromX + toX) / 2 + (layout.cy - fromY) * 0.2;
              const midY = (fromY + toY) / 2 - (layout.cx - fromX) * 0.2;

              return (
                <path
                  key={`edge-cycle-return-${i}`}
                  d={`M ${fromX} ${fromY} Q ${midX} ${midY}, ${toX} ${toY}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  markerEnd="url(#c2s-cycle-arrow)"
                />
              );
            }

            // 2-node cycle forward edge
            if (cyclePos >= 0 && layout.cycleCount === 2 && i === cyclePos && nextIdx === i + 1) {
              const fromX = c.x + layout.nodeRadius;
              const fromY = c.y - 6;
              const toX = targetCoord.x - layout.nodeRadius - 4;
              const toY = targetCoord.y - 6;
              const midX = (fromX + toX) / 2;
              const midY = c.y - 36;
              return (
                <path
                  key={`edge-forward-2-${i}`}
                  d={`M ${fromX} ${fromY} Q ${midX} ${midY}, ${toX} ${toY}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  markerEnd="url(#c2s-cycle-arrow)"
                />
              );
            }

            // Standard straight edge
            const dx = targetCoord.x - c.x;
            const dy = targetCoord.y - c.y;
            const dist = Math.hypot(dx, dy);
            const uX = dx / dist;
            const uY = dy / dist;

            const fromX = c.x + uX * layout.nodeRadius;
            const fromY = c.y + uY * layout.nodeRadius;
            const toX = targetCoord.x - uX * (layout.nodeRadius + 4);
            const toY = targetCoord.y - uY * (layout.nodeRadius + 4);

            const isCycleEdge = c.isCycle && targetCoord.isCycle;

            return (
              <line
                key={`edge-${i}-${nextIdx}`}
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={isCycleEdge ? "#6366f1" : "var(--border, #94a3b8)"}
                strokeWidth={isCycleEdge ? "2.5" : "2"}
                markerEnd={isCycleEdge ? "url(#c2s-cycle-arrow)" : "url(#c2s-arrow)"}
              />
            );
          })}

          {/* Node Circles and Badges */}
          {layout.coords.map((c, i) => {
            const isEntranceNode = cyclePos >= 0 && i === cyclePos;
            const isMeetingNode = meetingPoint !== null && i === meetingPoint;
            const isSlow = slow === i;
            const fastIsHere = fast === i;
            const isPtr1 = ptr1 === i;
            const isPtr2 = ptr2 === i;

            // Phase 1 Pointers
            const showSlow = isPhase1 && isSlow;
            const showFast = isPhase1 && fastIsHere;
            const showP1Meet = isPhase1 && showSlow && showFast;

            // Phase 2 Pointers
            const showPtr1 = isPhase2 && isPtr1;
            const showPtr2 = isPhase2 && isPtr2;
            const showP2Collision = isPhase2 && showPtr1 && showPtr2;

            // Done state
            const isTargetResult = isComplete && result === i;

            let circleFill = "var(--surface2, #1e293b)";
            let strokeColor = "var(--border, #475569)";
            let strokeWidth = 2;

            if (isTargetResult) {
              circleFill = "rgba(16, 185, 129, 0.25)";
              strokeColor = "#10b981";
              strokeWidth = 3.5;
            } else if (showP2Collision || showP1Meet) {
              circleFill = "rgba(245, 158, 11, 0.25)";
              strokeColor = "#f59e0b";
              strokeWidth = 3.5;
            } else if (isEntranceNode) {
              circleFill = "rgba(99, 102, 241, 0.18)";
              strokeColor = "#6366f1";
              strokeWidth = 3;
            } else if (isMeetingNode) {
              circleFill = "rgba(245, 158, 11, 0.12)";
              strokeColor = "#f59e0b";
              strokeWidth = 2.5;
            }

            return (
              <g key={`node-${i}`} className="c2s-node-group">
                {/* Entrance pulse / glow circle */}
                {isEntranceNode && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={layout.nodeRadius + 6}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="c2s-pulse-ring"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={layout.nodeRadius}
                  fill={circleFill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />

                {/* Node Value */}
                <text
                  x={c.x}
                  y={c.y + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="var(--text, #f8fafc)"
                >
                  {nodes[i]?.val}
                </text>

                {/* Node Index label */}
                <text
                  x={c.x}
                  y={c.y + layout.nodeRadius + 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-muted, #94a3b8)"
                >
                  [{i}]
                </text>

                {/* Node Entrance Tag */}
                {isEntranceNode && (
                  <g transform={`translate(${c.x - 30}, ${c.y - layout.nodeRadius - 22})`}>
                    <rect
                      width="60"
                      height="17"
                      rx="3"
                      fill="#6366f1"
                      className="c2s-tag-rect"
                    />
                    <text
                      x="30"
                      y="12"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill="#ffffff"
                    >
                      ENTRANCE
                    </text>
                  </g>
                )}

                {/* Node Meeting Tag */}
                {isMeetingNode && !isEntranceNode && (
                  <g transform={`translate(${c.x - 24}, ${c.y - layout.nodeRadius - 20})`}>
                    <rect
                      width="48"
                      height="16"
                      rx="3"
                      fill="#d97706"
                      className="c2s-tag-rect"
                    />
                    <text
                      x="24"
                      y="11"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill="#ffffff"
                    >
                      MEET
                    </text>
                  </g>
                )}

                {/* Phase 1 Pointer Badges */}
                {isPhase1 && (
                  <g transform={`translate(${c.x}, ${c.y + layout.nodeRadius + 22})`}>
                    {showP1Meet ? (
                      <g transform="translate(-32, 2)">
                        <rect width="64" height="18" rx="4" fill="#f59e0b" />
                        <text x="32" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#000">
                          🐢🐇 MEET
                        </text>
                      </g>
                    ) : (
                      <>
                        {showSlow && (
                          <g transform="translate(-24, 2)">
                            <rect width="48" height="17" rx="3" fill="#10b981" />
                            <text x="24" y="12" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#064e3b">
                              🐢 slow
                            </text>
                          </g>
                        )}
                        {showFast && (
                          <g transform={`translate(-24, ${showSlow ? 22 : 2})`}>
                            <rect width="48" height="17" rx="3" fill="#ec4899" />
                            <text x="24" y="12" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ffffff">
                              🐇 fast
                            </text>
                          </g>
                        )}
                      </>
                    )}
                  </g>
                )}

                {/* Phase 2 Pointer Badges */}
                {isPhase2 && (
                  <g transform={`translate(${c.x}, ${c.y + layout.nodeRadius + 22})`}>
                    {showP2Collision ? (
                      <g transform="translate(-40, 2)">
                        <rect width="80" height="18" rx="4" fill="#10b981" />
                        <text x="40" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#064e3b">
                          ⭐ COLLISION!
                        </text>
                      </g>
                    ) : (
                      <>
                        {showPtr1 && (
                          <g transform="translate(-26, 2)">
                            <rect width="52" height="17" rx="3" fill="#3b82f6" />
                            <text x="26" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">
                              🟦 ptr1 (hd)
                            </text>
                          </g>
                        )}
                        {showPtr2 && (
                          <g transform={`translate(-26, ${showPtr1 ? 22 : 2})`}>
                            <rect width="52" height="17" rx="3" fill="#a855f7" />
                            <text x="26" y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">
                              🟪 ptr2 (mt)
                            </text>
                          </g>
                        )}
                      </>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pointer Telemetry Dashboard */}
      <section className="c2s-telemetry" aria-label="Pointer Telemetry Status">
        {isPhase1 && (
          <div className="telemetry-grid">
            <div className={`telemetry-card ${slow !== null ? "active" : ""}`}>
              <span className="card-tag slow-tag">🐢 Slow Pointer</span>
              <div className="card-value">
                {slow !== null ? `Node ${slow} [val=${nodes[slow]?.val}]` : "—"}
              </div>
              <span className="card-sub">1 step/iter · Total: {slowSteps} steps</span>
            </div>

            <div className={`telemetry-card ${fast !== null ? "active" : ""}`}>
              <span className="card-tag fast-tag">🐇 Fast Pointer</span>
              <div className="card-value">
                {fast !== null ? `Node ${fast} [val=${nodes[fast]?.val}]` : "None"}
              </div>
              <span className="card-sub">2 steps/iter · Total: {fastSteps} steps</span>
            </div>

            <div className={`telemetry-card ${isMeeting ? "highlight-success" : ""}`}>
              <span className="card-tag status-tag">Phase 1 Status</span>
              <div className="card-value">
                {isMeeting ? `Collided at Node ${meetingPoint}` : "Hunting for cycle"}
              </div>
              <span className="card-sub">
                {isMeeting ? "Advancing to Phase 2" : "slow == fast check"}
              </span>
            </div>
          </div>
        )}

        {isPhase2 && (
          <div className="telemetry-grid">
            <div className={`telemetry-card ${ptr1 !== null ? "active-ptr1" : ""}`}>
              <span className="card-tag ptr1-tag">🟦 ptr1 (from Head)</span>
              <div className="card-value">
                {ptr1 !== null ? `Node ${ptr1} [val=${nodes[ptr1]?.val}]` : "—"}
              </div>
              <span className="card-sub">Step {phase2Steps} of F ({mathInvariant?.F})</span>
            </div>

            <div className={`telemetry-card ${ptr2 !== null ? "active-ptr2" : ""}`}>
              <span className="card-tag ptr2-tag">🟪 ptr2 (from Meeting)</span>
              <div className="card-value">
                {ptr2 !== null ? `Node ${ptr2} [val=${nodes[ptr2]?.val}]` : "—"}
              </div>
              <span className="card-sub">Started at Node {meetingPoint}</span>
            </div>

            <div className={`telemetry-card ${isEntrance ? "highlight-success" : ""}`}>
              <span className="card-tag status-tag">Phase 2 Distance</span>
              <div className="card-value">
                {isEntrance
                  ? `Entrance Found!`
                  : `${Math.max(0, (mathInvariant?.F ?? 0) - phase2Steps)} step(s) to entrance`}
              </div>
              <span className="card-sub">F = nC - a alignment</span>
            </div>
          </div>
        )}
      </section>

      {/* Result Hero Banner */}
      {isComplete && (
        <section
          className={`c2s-result-card ${result !== null ? "is-success" : "is-none"}`}
          role="status"
          aria-live="polite"
        >
          <div className="result-icon">{result !== null ? "✓" : "∅"}</div>
          <div className="result-body">
            <strong className="result-title">
              {result !== null
                ? `Cycle Entrance Node: [${result}] (val = ${nodes[result]?.val})`
                : "detectCycle(head) = None (No Cycle)"}
            </strong>
            <p className="result-text">
              {result !== null
                ? `Mathematical invariant confirmed: Starting ptr1 at head and ptr2 at collision point Node ${meetingPoint} brought them to meet at Node ${result} after ${phase2Steps} step(s).`
                : "The fast pointer reached the end of the linked list without looping back."}
            </p>
          </div>
        </section>
      )}
    </StoryPanel>
  );
}
