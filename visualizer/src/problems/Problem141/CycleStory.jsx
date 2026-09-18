import StoryPanel from "../../components/shared/StoryPanel";
import "./CycleStory.css";

export default function CycleStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Linked List Cycle"
        description="Press Play to begin tracing Floyd's Tortoise and Hare algorithm."
        label="Linked List Cycle visualizer story"
      >
        <p className="cycle-story__empty-msg">
          Use two pointers moving at different speeds (slow = 1 step, fast = 2
          steps). If a cycle exists, the fast pointer is guaranteed to lap and
          meet the slow pointer.
        </p>
      </StoryPanel>
    );
  }

  const { nodes = [], pos, hasCycle, cycleLength } = story;
  const {
    activeLine,
    phase,
    slow,
    fast,
    slowVal,
    fastVal,
    slowPrev,
    fastPrev,
    fastNext,
    stepCount,
    gap,
    result,
    meetingNode,
    message,
    explanation,
  } = step;

  const n = nodes.length;

  // Compute dynamic story title
  const getStoryTitle = () => {
    if (phase === "init") {
      return n === 0
        ? "Initialization: Empty List (head is null)"
        : `Initialization: slow = fast = head (Node 0, val: ${nodes[0]?.val})`;
    }
    if (phase === "check") {
      if (fast === null || fastNext === null) {
        return `Condition Check: End of list reached (${fast === null ? "fast is null" : "fast.next is null"})`;
      }
      return `Condition Check: fast (Node ${fast}) & fast.next (Node ${fastNext}) exist — Loop continues`;
    }
    if (phase === "move_slow") {
      return `Tortoise Advances: slow moved 1 step (${slowPrev !== null ? `Node ${slowPrev}` : ""} → Node ${slow})`;
    }
    if (phase === "move_fast") {
      return fast !== null
        ? `Hare Advances: fast moved 2 steps (${fastPrev !== null ? `Node ${fastPrev}` : ""} → Node ${fast})`
        : `Hare Advances: fast moved 2 steps into null (end of list)`;
    }
    if (phase === "compare") {
      return slow === fast
        ? `Collision Detected: slow == fast at Node ${slow}!`
        : `Collision Check: slow (Node ${slow}) ≠ fast (${fast !== null ? `Node ${fast}` : "null"})`;
    }
    if (phase === "done") {
      return result
        ? `Cycle Confirmed: Meeting at Node ${meetingNode} (Return True)`
        : "Acyclic List: fast reached null (Return False)";
    }
    return "Floyd's Tortoise and Hare Trace";
  };

  // SVG Geometry for linked list diagram
  const nodeRadius = 24;
  const nodeSpacing = Math.max(
    76,
    Math.min(108, Math.floor(660 / Math.max(n + (hasCycle ? 0 : 1), 2))),
  );
  const startX = 54;
  const cy = 80;
  const svgWidth = Math.max(
    560,
    startX * 2 + (n + (hasCycle ? 0 : 1)) * nodeSpacing,
  );
  const svgHeight = hasCycle ? 200 : 155;

  const isCollision =
    (phase === "compare" && slow === fast && slow !== null) ||
    (phase === "done" && result && meetingNode !== null);

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={message}
      label="Linked List Cycle visualizer story"
      className="cycle-story"
    >
      {/* Detailed explanation card */}
      <p className="cycle-story__explanation">{explanation}</p>

      {/* Metrics and Floyd Pointer Status Bar */}
      <div
        className="cycle-story__metrics"
        role="region"
        aria-label="Floyd pointer status"
      >
        {/* Slow / Tortoise Card */}
        <div
          className={`cycle-story__metric-card slow-card ${slow !== null ? "active" : ""}`}
        >
          <div className="metric-header">
            <span className="metric-icon">🐢</span>
            <span className="metric-label">Slow (Tortoise)</span>
            <span className="metric-speed">Speed: +1</span>
          </div>
          <div className="cycle-story__metric-value">
            {slow !== null ? (
              <>
                <strong>Node {slow}</strong>
                <span className="metric-val-tag">val: {slowVal}</span>
              </>
            ) : (
              <span className="metric-null">null</span>
            )}
          </div>
          <div className="metric-sub">
            {slow !== null
              ? hasCycle && slow >= pos
                ? "Inside cycle"
                : "Acyclic prefix"
              : "Not initialized"}
          </div>
        </div>

        {/* Fast / Hare Card */}
        <div
          className={`cycle-story__metric-card fast-card ${fast !== null ? "active" : ""}`}
        >
          <div className="metric-header">
            <span className="metric-icon">🐇</span>
            <span className="metric-label">Fast (Hare)</span>
            <span className="metric-speed">Speed: +2</span>
          </div>
          <div className="cycle-story__metric-value">
            {fast !== null ? (
              <>
                <strong>Node {fast}</strong>
                <span className="metric-val-tag">val: {fastVal}</span>
              </>
            ) : (
              <span className="metric-null">null</span>
            )}
          </div>
          <div className="metric-sub">
            {fast !== null
              ? hasCycle && fast >= pos
                ? "Inside cycle"
                : "Acyclic prefix"
              : "End of list (null)"}
          </div>
        </div>

        {/* Relative Distance / Gap Card */}
        <div
          className={`cycle-story__metric-card gap-card ${
            isCollision ? "collision" : ""
          }`}
        >
          <div className="metric-header">
            <span className="metric-icon">📏</span>
            <span className="metric-label">Chase Gap (Δ)</span>
            <span className="metric-speed">
              {hasCycle && slow >= pos && fast >= pos
                ? "-1 / round"
                : "Relative"}
            </span>
          </div>
          <div className="cycle-story__metric-value">
            {isCollision ? (
              <strong className="collision-text">0 (COLLISION! 🎉)</strong>
            ) : gap !== null ? (
              <>
                <strong>{gap}</strong>
                <span className="metric-unit">
                  {gap === 1 ? "step behind" : "steps behind"}
                </span>
              </>
            ) : fast === null ? (
              <span className="metric-null">Fast hit null</span>
            ) : (
              <span className="metric-sub">Approaching</span>
            )}
          </div>
          <div className="metric-sub">
            {hasCycle
              ? `Cycle len: ${cycleLength} | Entry: Node ${pos}`
              : "Acyclic: terminates at null"}
          </div>
        </div>

        {/* Execution Iteration Card */}
        <div className="cycle-story__metric-card iter-card">
          <div className="metric-header">
            <span className="metric-icon">⏱️</span>
            <span className="metric-label">Iteration</span>
            <span className="metric-speed">Line {activeLine}</span>
          </div>
          <div className="cycle-story__metric-value">
            <strong>Round {stepCount}</strong>
          </div>
          <div className="metric-sub">
            Phase: <span className="metric-phase-badge">{phase}</span>
          </div>
        </div>
      </div>

      {/* Linked List Visual Diagram */}
      <div
        className="cycle-story__diagram-container"
        role="region"
        aria-label="Linked list track"
      >
        <div className="cycle-story__diagram-header">
          <span className="diagram-title">Linked List Topology</span>
          {hasCycle ? (
            <span className="cycle-badge">
              ⟳ Cycle Detected Structure: Node {n - 1} → Node {pos}
            </span>
          ) : (
            <span className="acyclic-badge">
              Linear Chain (Terminates at null)
            </span>
          )}
        </div>

        {n === 0 ? (
          <div className="cycle-story__empty-chain">
            <span className="empty-head">head</span>
            <span className="empty-arrow">→</span>
            <span className="empty-null">null</span>
          </div>
        ) : (
          <div className="cycle-story__svg-viewport">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="cycle-story__svg"
              aria-label="Linked list node diagram"
            >
              <defs>
                {/* Regular arrow marker */}
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1.5 L 8 5 L 0 8.5 z"
                    fill="var(--text-dim, #64748b)"
                  />
                </marker>

                {/* Cycle return arrow marker */}
                <marker
                  id="cycle-arrow"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#a855f7" />
                </marker>
              </defs>

              {/* Forward edges between adjacent nodes */}
              {nodes.map((node, i) => {
                if (i >= n - 1) return null;
                const x1 = startX + i * nodeSpacing + nodeRadius;
                const x2 = startX + (i + 1) * nodeSpacing - nodeRadius;
                return (
                  <line
                    key={`edge-${i}`}
                    x1={x1}
                    y1={cy}
                    x2={x2}
                    y2={cy}
                    stroke="var(--border, #475569)"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow)"
                    className="cycle-story__forward-edge"
                  />
                );
              })}

              {/* Terminator edge to null if no cycle */}
              {!hasCycle && n > 0 && (
                <g className="cycle-story__null-group">
                  <line
                    x1={startX + (n - 1) * nodeSpacing + nodeRadius}
                    y1={cy}
                    x2={startX + n * nodeSpacing - 22}
                    y2={cy}
                    stroke="var(--border, #475569)"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow)"
                  />
                  <rect
                    x={startX + n * nodeSpacing - 20}
                    y={cy - 16}
                    width="44"
                    height="32"
                    rx="6"
                    fill="var(--surface3, #334155)"
                    stroke="var(--border, #475569)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={startX + n * nodeSpacing + 2}
                    y={cy + 5}
                    textAnchor="middle"
                    fill="var(--text-muted, #94a3b8)"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    null
                  </text>
                </g>
              )}

              {/* Cycle return back-edge arc if hasCycle */}
              {hasCycle && n > 0 && (
                <g className="cycle-story__cycle-arc-group">
                  {(() => {
                    const tailX = startX + (n - 1) * nodeSpacing;
                    const posX = startX + pos * nodeSpacing;
                    const arcDrop = Math.min(85, 45 + (n - 1 - pos) * 8);
                    const pathD = `M ${tailX} ${cy + nodeRadius} C ${tailX} ${
                      cy + arcDrop
                    }, ${posX} ${cy + arcDrop}, ${posX} ${cy + nodeRadius + 4}`;

                    return (
                      <>
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2.5"
                          strokeDasharray="5,4"
                          markerEnd="url(#cycle-arrow)"
                          className="cycle-story__cycle-arc-path"
                        />
                        {/* Label in the middle of arc */}
                        <rect
                          x={(tailX + posX) / 2 - 58}
                          y={cy + arcDrop - 12}
                          width="116"
                          height="22"
                          rx="11"
                          fill="rgba(30, 41, 59, 0.92)"
                          stroke="#a855f7"
                          strokeWidth="1.2"
                        />
                        <text
                          x={(tailX + posX) / 2}
                          y={cy + arcDrop + 3}
                          textAnchor="middle"
                          fill="#c084fc"
                          fontSize="10"
                          fontWeight="700"
                        >
                          ⟳ Cycle: {n - 1} → {pos}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}

              {/* Node Circles */}
              {nodes.map((node, i) => {
                const cx = startX + i * nodeSpacing;
                const isSlowHere = slow === i;
                const isFastHere = fast === i;
                const isBothHere = isSlowHere && isFastHere;
                const isCycleEntry = hasCycle && pos === i;
                const isMeetingPoint = isCollision && meetingNode === i;

                let circleClass = "cycle-story__node-circle";
                if (isMeetingPoint) circleClass += " is-meeting";
                else if (isBothHere) circleClass += " is-both";
                else if (isSlowHere) circleClass += " is-slow";
                else if (isFastHere) circleClass += " is-fast";
                else if (isCycleEntry) circleClass += " is-cycle-entry";

                return (
                  <g key={`node-${i}`} className="cycle-story__node-group">
                    {/* Cycle entry halo */}
                    {isCycleEntry && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={nodeRadius + 6}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        className="cycle-entry-halo"
                      />
                    )}

                    {/* Meeting pulse halo */}
                    {isMeetingPoint && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={nodeRadius + 8}
                        fill="none"
                        stroke="var(--error, #ef4444)"
                        strokeWidth="3"
                        className="meeting-pulse-halo"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={nodeRadius}
                      className={circleClass}
                    />

                    {/* Node Value */}
                    <text
                      x={cx}
                      y={cy + 5}
                      textAnchor="middle"
                      className="cycle-story__node-val"
                    >
                      {node.val}
                    </text>

                    {/* Node Index label below */}
                    <text
                      x={cx}
                      y={cy + nodeRadius + 15}
                      textAnchor="middle"
                      className="cycle-story__node-idx"
                    >
                      idx {i}
                    </text>

                    {/* Head badge on Node 0 */}
                    {i === 0 && (
                      <text
                        x={cx}
                        y={cy + nodeRadius + 26}
                        textAnchor="middle"
                        className="cycle-story__head-badge"
                      >
                        [head]
                      </text>
                    )}

                    {/* Cycle Entry badge */}
                    {isCycleEntry && (
                      <text
                        x={cx}
                        y={cy + nodeRadius + (i === 0 ? 37 : 26)}
                        textAnchor="middle"
                        className="cycle-story__pos-badge"
                      >
                        ★ pos={pos}
                      </text>
                    )}

                    {/* Pointer Badges Above Node */}
                    {isBothHere ? (
                      <g className="cycle-story__ptr-badge ptr-both">
                        <rect
                          x={cx - 38}
                          y={cy - nodeRadius - 28}
                          width="76"
                          height="22"
                          rx="6"
                          fill="rgba(245, 158, 11, 0.2)"
                          stroke="var(--warning, #f59e0b)"
                          strokeWidth="1.5"
                        />
                        <text
                          x={cx}
                          y={cy - nodeRadius - 13}
                          textAnchor="middle"
                          fill="var(--warning, #f59e0b)"
                          fontSize="11"
                          fontWeight="700"
                        >
                          🐢🐇 meet
                        </text>
                      </g>
                    ) : (
                      <>
                        {isSlowHere && (
                          <g className="cycle-story__ptr-badge ptr-slow">
                            <rect
                              x={cx - 30}
                              y={cy - nodeRadius - 26}
                              width="60"
                              height="20"
                              rx="5"
                              fill="rgba(34, 197, 94, 0.2)"
                              stroke="var(--success, #22c55e)"
                              strokeWidth="1.5"
                            />
                            <text
                              x={cx}
                              y={cy - nodeRadius - 12}
                              textAnchor="middle"
                              fill="var(--success, #22c55e)"
                              fontSize="11"
                              fontWeight="700"
                            >
                              🐢 slow
                            </text>
                          </g>
                        )}
                        {isFastHere && (
                          <g className="cycle-story__ptr-badge ptr-fast">
                            <rect
                              x={cx - 28}
                              y={cy - nodeRadius - 26}
                              width="56"
                              height="20"
                              rx="5"
                              fill="rgba(56, 189, 248, 0.2)"
                              stroke="var(--info, #38bdf8)"
                              strokeWidth="1.5"
                            />
                            <text
                              x={cx}
                              y={cy - nodeRadius - 12}
                              textAnchor="middle"
                              fill="var(--info, #38bdf8)"
                              fontSize="11"
                              fontWeight="700"
                            >
                              🐇 fast
                            </text>
                          </g>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Floyd's Algorithm Mathematical Insight Card */}
      <div
        className="cycle-story__proof-card"
        role="region"
        aria-label="Floyd algorithm properties"
      >
        <div className="proof-header">
          <span className="proof-icon">💡</span>
          <span className="proof-title">
            Why Floyd's Tortoise &amp; Hare Works
          </span>
        </div>
        <div className="proof-grid">
          <div className="proof-item">
            <strong>Time Complexity: O(N)</strong>
            <span>
              Tortoise takes at most N steps before meeting or reaching null.
              Inside a cycle of length C, Hare gains 1 step per round, closing
              any gap in &lt; C iterations.
            </span>
          </div>
          <div className="proof-item">
            <strong>Space Complexity: O(1)</strong>
            <span>
              Requires only two pointer variables (slow &amp; fast). Unlike Hash
              Sets that require O(N) memory to record visited references, Floyd
              uses zero auxiliary memory.
            </span>
          </div>
        </div>
      </div>

      {/* Result Status Banner */}
      {phase === "done" && (
        <div
          className={`cycle-story__result ${result ? "is-cycle" : "is-no-cycle"}`}
          role="status"
          aria-live="polite"
        >
          <div className="result-icon">{result ? "🎉" : "✓"}</div>
          <div className="result-text">
            <h4>
              {result
                ? "Cycle Detected — Return True"
                : "No Cycle Detected — Return False"}
            </h4>
            <p>
              {result
                ? `Collision confirmed at Node ${meetingNode} (value: ${nodes[meetingNode]?.val}) after ${stepCount} iterations.`
                : "Hare reached null at the end of the list. A finite acyclic list terminates."}
            </p>
          </div>
        </div>
      )}
    </StoryPanel>
  );
}
