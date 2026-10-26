import StoryPanel from "../../components/shared/StoryPanel";
import SvgViewport from "../../components/shared/SvgViewport";
import "./CandyStory.css";

export default function CandyStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Candy Distribution"
        description="Press Play to begin tracing."
        label="Candy Visualizer"
      >
        <p>
          Distribute the minimum number of candies to children such that each child has at least one candy
          and children with higher ratings than adjacent neighbors receive strictly more candies.
        </p>
      </StoryPanel>
    );
  }

  const { ratings } = story;
  const {
    activeLine,
    phase,
    pass,
    direction,
    i: activeIndex,
    compareIndex,
    candies,
    totalCandies,
    previousCandy,
    neededCandy,
    newCandy,
    conditionMet,
    message,
    explanation,
  } = step;

  const n = ratings.length;
  const maxCandy = Math.max(...candies, 3);

  // SVG Geometry
  const colWidth = Math.max(38, Math.min(64, Math.floor(540 / Math.max(n, 1))));
  const gap = Math.max(16, Math.floor(colWidth * 0.45));
  const leftPad = 65;
  const rightPad = 65;
  const svgWidth = Math.max(540, leftPad + rightPad + n * (colWidth + gap) - gap);
  const svgHeight = 310;
  const groundY = 220;
  const chartHeight = 140;

  const yForCandy = (c) => groundY - (c / maxCandy) * chartHeight;
  const xForChild = (idx) => leftPad + idx * (colWidth + gap);
  const cxForChild = (idx) => xForChild(idx) + colWidth / 2;

  // Title generation
  let title = "Candy Distribution";
  if (phase === "done") {
    title = `Distribution Complete: Minimal ${totalCandies} Candies Total`;
  } else if (phase === "init") {
    title =
      activeLine === 2
        ? `Setup: Inspect Line of ${n} Children`
        : "Base Allocation: Give Each Child 1 Candy";
  } else if (pass === "left-to-right") {
    if (phase === "loop") {
      title = `Left Pass: Inspect Child ${activeIndex} vs Left Neighbor ${compareIndex}`;
    } else if (phase === "compare") {
      title = conditionMet
        ? `Right-Slope Detected: Rating ${ratings[activeIndex]} > ${ratings[compareIndex]}`
        : `No Slope: Rating ${ratings[activeIndex]} ≤ ${ratings[compareIndex]}`;
    } else if (phase === "update") {
      title = `Reward Right-Slope: Child ${activeIndex} Candies = ${newCandy}`;
    }
  } else if (pass === "right-to-left") {
    if (phase === "loop") {
      title = `Right Pass: Inspect Child ${activeIndex} vs Right Neighbor ${compareIndex}`;
    } else if (phase === "compare") {
      title = conditionMet
        ? `Left-Slope Detected: Rating ${ratings[activeIndex]} > ${ratings[compareIndex]}`
        : `No Slope: Rating ${ratings[activeIndex]} ≤ ${ratings[compareIndex]}`;
    } else if (phase === "update") {
      title =
        previousCandy >= neededCandy
          ? `Preserve Peak: Child ${activeIndex} Keeps ${newCandy} Candies`
          : `Reward Left-Slope: Child ${activeIndex} Raised to ${newCandy} Candies`;
    }
  }

  // Pass progress states
  const ltrState =
    pass === "left-to-right"
      ? "active"
      : pass === "right-to-left" || phase === "done"
      ? "completed"
      : "pending";

  const rtlState =
    pass === "right-to-left"
      ? "active"
      : phase === "done"
      ? "completed"
      : "pending";

  // Arc calculation for comparison arrow
  const hasComparisonArc = activeIndex >= 0 && compareIndex >= 0;
  let arcD = "";
  let arcMidX = 0;
  let arcPeak = 0;
  let arcColor = conditionMet ? "#22c55e" : "#94a3b8";

  if (hasComparisonArc) {
    const xFrom = cxForChild(compareIndex);
    const xTo = cxForChild(activeIndex);
    const yFrom = yForCandy(candies[compareIndex]);
    const yTo = yForCandy(candies[activeIndex]);

    arcMidX = (xFrom + xTo) / 2;
    arcPeak = Math.max(25, Math.min(yFrom, yTo) - 45);
    arcD = `M ${xFrom} ${yFrom - 6} Q ${arcMidX} ${arcPeak} ${xTo} ${yTo - 6}`;
    arcColor = conditionMet ? "#22c55e" : "#94a3b8";
  }

  return (
    <StoryPanel
      title={title}
      description={message}
      label="Candy Distribution Visualizer Story"
      className="candy-story-panel"
    >
      <p className="candy-story__explanation">{explanation}</p>

      {/* Two-Pass Stepper & Direction Indicator */}
      <section
        className="candy-story__pass-stepper"
        aria-label="Pass direction indicator"
      >
        <div
          className={`candy-story__pass-card candy-story__pass-card--${ltrState}`}
        >
          <div className="candy-story__pass-header">
            <span className="candy-story__pass-badge">Pass 1</span>
            <span className="candy-story__pass-direction">L → R</span>
          </div>
          <div className="candy-story__pass-name">Left-to-Right Scan</div>
          <div className="candy-story__pass-rule">
            Reward right-slopes: <code>candies[i] = candies[i-1] + 1</code>
          </div>
          <div className="candy-story__pass-status">
            {ltrState === "completed" && "✓ Completed"}
            {ltrState === "active" && "▶ In Progress"}
            {ltrState === "pending" && "Pending"}
          </div>
        </div>

        <div className="candy-story__pass-connector" aria-hidden="true">
          <span>➔</span>
        </div>

        <div
          className={`candy-story__pass-card candy-story__pass-card--${rtlState}`}
        >
          <div className="candy-story__pass-header">
            <span className="candy-story__pass-badge">Pass 2</span>
            <span className="candy-story__pass-direction">R ← L</span>
          </div>
          <div className="candy-story__pass-name">Right-to-Left Scan</div>
          <div className="candy-story__pass-rule">
            Reward left-slopes: <code>candies[i] = max(candies[i], candies[i+1] + 1)</code>
          </div>
          <div className="candy-story__pass-status">
            {rtlState === "completed" && "✓ Completed"}
            {rtlState === "active" && "▶ In Progress"}
            {rtlState === "pending" && "Pending"}
          </div>
        </div>
      </section>

      {/* Metrics Header Cards */}
      <section
        className="candy-story__metrics"
        role="region"
        aria-label="Algorithm state metrics"
      >
        <div className="candy-story__metric-card">
          <span className="candy-story__metric-label">Pass Phase</span>
          <span
            className={`candy-story__metric-val candy-story__metric-val--direction`}
          >
            {direction === "ltr" && "Left → Right"}
            {direction === "rtl" && "Right ← Left"}
            {direction === "none" && (phase === "done" ? "Finished" : "Setup")}
          </span>
          <span className="candy-story__metric-sub">
            {direction === "ltr" && `Iterating i = 1 .. ${n - 1}`}
            {direction === "rtl" && `Iterating i = ${n - 2} .. 0`}
            {direction === "none" && (phase === "done" ? "All constraints satisfied" : "Rule 1 floor")}
          </span>
        </div>

        <div className="candy-story__metric-card">
          <span className="candy-story__metric-label">Current Child (i)</span>
          <span className="candy-story__metric-val candy-story__metric-val--child">
            {activeIndex >= 0 ? `Child ${activeIndex}` : "—"}
          </span>
          <span className="candy-story__metric-sub">
            {activeIndex >= 0
              ? `Rating: ${ratings[activeIndex]} | Candies: ${candies[activeIndex]}`
              : "No child selected"}
          </span>
        </div>

        <div className="candy-story__metric-card">
          <span className="candy-story__metric-label">Neighbor Compared</span>
          <span className="candy-story__metric-val candy-story__metric-val--neighbor">
            {compareIndex >= 0 ? `Child ${compareIndex}` : "—"}
          </span>
          <span className="candy-story__metric-sub">
            {compareIndex >= 0
              ? `Rating: ${ratings[compareIndex]} | Candies: ${candies[compareIndex]}`
              : "No neighbor"}
          </span>
        </div>

        <div className="candy-story__metric-card">
          <span className="candy-story__metric-label">Comparison Result</span>
          <span
            className={`candy-story__metric-val ${
              conditionMet === true
                ? "candy-story__metric-val--true"
                : conditionMet === false
                ? "candy-story__metric-val--false"
                : ""
            }`}
          >
            {conditionMet === true && "Higher Rating (True)"}
            {conditionMet === false && "Not Higher (False)"}
            {conditionMet === null && "—"}
          </span>
          <span className="candy-story__metric-sub">
            {conditionMet === true && (pass === "left-to-right" ? `Assign ${newCandy} candies` : `max(${previousCandy}, ${neededCandy}) = ${newCandy}`)}
            {conditionMet === false && "No candy increase needed"}
            {conditionMet === null && "Awaiting comparison"}
          </span>
        </div>

        <div className="candy-story__metric-card candy-story__metric-card--total">
          <span className="candy-story__metric-label">Total Candies</span>
          <span className="candy-story__metric-val candy-story__metric-val--total">
            🍬 {totalCandies}
          </span>
          <span className="candy-story__metric-sub">
            {phase === "done" ? "Optimal minimum answer" : "Current running sum"}
          </span>
        </div>
      </section>

      {/* SVG Viewport with Children Bars and Comparison Arcs */}
      <SvgViewport
        width={svgWidth}
        height={svgHeight}
        className="candy-story__viewport"
      >
        <title>Children ratings and candy distribution chart</title>

        <defs>
          <marker
            id="candy-arrow-ltr"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill={arcColor} />
          </marker>
          <marker
            id="candy-arrow-rtl"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill={arcColor} />
          </marker>

          {/* Gradients for bars */}
          <linearGradient id="candyBarDone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="candyBarActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="candyBarNeighbor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Horizontal Candy Reference Grid Lines */}
        {[1, 2, 3, 4, 5]
          .filter((lvl) => lvl <= maxCandy)
          .map((lvl) => {
            const y = yForCandy(lvl);
            return (
              <g key={lvl} className="candy-story__grid-group">
                <line
                  x1={leftPad - 15}
                  x2={svgWidth - 20}
                  y1={y}
                  y2={y}
                  className="candy-story__grid-line"
                />
                <text
                  x={leftPad - 20}
                  y={y + 3}
                  textAnchor="end"
                  className="candy-story__grid-label"
                >
                  {lvl} 🍬
                </text>
              </g>
            );
          })}

        {/* Baseline Ground Axis */}
        <line
          x1={leftPad - 25}
          x2={svgWidth - 15}
          y1={groundY}
          y2={groundY}
          className="candy-story__ground-line"
        />

        {/* Comparison Arc Connecting compareIndex and activeIndex */}
        {hasComparisonArc && (
          <g className="candy-story__arc-group">
            <path
              d={arcD}
              className="candy-story__arc-path"
              stroke={arcColor}
              markerEnd={
                pass === "left-to-right"
                  ? "url(#candy-arrow-ltr)"
                  : "url(#candy-arrow-rtl)"
              }
            />

            {/* Label badge over arc */}
            <rect
              x={arcMidX - 60}
              y={arcPeak - 14}
              width={120}
              height={20}
              rx={10}
              fill={conditionMet ? "rgba(34, 197, 94, 0.2)" : "rgba(148, 163, 184, 0.2)"}
              stroke={arcColor}
              strokeWidth="1.2"
            />
            <text
              x={arcMidX}
              y={arcPeak}
              textAnchor="middle"
              className="candy-story__arc-label"
              fill={arcColor}
            >
              {ratings[activeIndex]} {ratings[activeIndex] > ratings[compareIndex] ? ">" : "≤"} {ratings[compareIndex]}
              {conditionMet ? " (Higher ★)" : " (No bonus)"}
            </text>
          </g>
        )}

        {/* Children Bars and Metadata */}
        {ratings.map((rating, idx) => {
          const bx = xForChild(idx);
          const c = candies[idx];
          const by = yForCandy(c);
          const bh = Math.max(8, groundY - by);
          const cx = cxForChild(idx);

          const isActive = activeIndex === idx;
          const isCompare = compareIndex === idx;
          const isDone = phase === "done";

          let barState = "default";
          if (isDone) barState = "done";
          else if (isActive) barState = "active";
          else if (isCompare) barState = "compare";

          return (
            <g
              key={idx}
              className="candy-story__col-group"
              data-state={barState}
              tabIndex={0}
              role="figure"
              aria-label={`Child ${idx}: rating ${rating}, candies ${c}`}
            >
              {/* Candy Bar */}
              <rect
                x={bx}
                y={by}
                width={colWidth}
                height={bh}
                rx={6}
                ry={6}
                className="candy-story__bar"
              />

              {/* Candy Count Badge above bar */}
              <text
                x={cx}
                y={by - 8}
                textAnchor="middle"
                className="candy-story__candy-count"
              >
                {c} 🍬
              </text>

              {/* Rating Star Badge below baseline */}
              <rect
                x={cx - 18}
                y={groundY + 8}
                width={36}
                height={22}
                rx={11}
                className="candy-story__rating-badge"
              />
              <text
                x={cx}
                y={groundY + 23}
                textAnchor="middle"
                className="candy-story__rating-text"
              >
                ★{rating}
              </text>

              {/* Child Index label */}
              <text
                x={cx}
                y={groundY + 44}
                textAnchor="middle"
                className="candy-story__child-idx"
              >
                Child {idx}
              </text>

              {/* Active Child Inspection Pointer */}
              {isActive && (
                <g className="candy-story__active-pointer">
                  <polygon
                    points={`${cx},${by - 18} ${cx - 5},${by - 26} ${cx + 5},${by - 26}`}
                    fill="#f59e0b"
                  />
                  <rect
                    x={cx - 22}
                    y={by - 42}
                    width={44}
                    height={16}
                    rx={3}
                    fill="#f59e0b"
                  />
                  <text
                    x={cx}
                    y={by - 30}
                    textAnchor="middle"
                    className="candy-story__pointer-text"
                  >
                    i = {idx}
                  </text>
                </g>
              )}

              {/* Neighbor Pointer */}
              {isCompare && !isActive && (
                <g className="candy-story__neighbor-pointer">
                  <polygon
                    points={`${cx},${by - 18} ${cx - 5},${by - 26} ${cx + 5},${by - 26}`}
                    fill="#38bdf8"
                  />
                  <rect
                    x={cx - 28}
                    y={by - 42}
                    width={56}
                    height={16}
                    rx={3}
                    fill="#38bdf8"
                  />
                  <text
                    x={cx}
                    y={by - 30}
                    textAnchor="middle"
                    className="candy-story__pointer-text"
                  >
                    neighbor
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </SvgViewport>

      {/* Numerical Breakdown Matrix */}
      <section
        className="candy-story__matrix"
        aria-label="Children status table"
      >
        <div className="candy-story__matrix-row candy-story__matrix-row--header">
          <span className="candy-story__matrix-cell candy-story__matrix-cell--label">
            Child
          </span>
          {ratings.map((_, idx) => (
            <span
              key={idx}
              className={`candy-story__matrix-cell ${
                idx === activeIndex
                  ? "active"
                  : idx === compareIndex
                  ? "compare"
                  : ""
              }`}
            >
              #{idx}
            </span>
          ))}
        </div>

        <div className="candy-story__matrix-row">
          <span className="candy-story__matrix-cell candy-story__matrix-cell--label">
            Rating
          </span>
          {ratings.map((r, idx) => (
            <span
              key={idx}
              className={`candy-story__matrix-cell candy-story__matrix-cell--rating ${
                idx === activeIndex
                  ? "active"
                  : idx === compareIndex
                  ? "compare"
                  : ""
              }`}
            >
              ★ {r}
            </span>
          ))}
        </div>

        <div className="candy-story__matrix-row">
          <span className="candy-story__matrix-cell candy-story__matrix-cell--label">
            Candies
          </span>
          {candies.map((c, idx) => (
            <span
              key={idx}
              className={`candy-story__matrix-cell candy-story__matrix-cell--candy ${
                idx === activeIndex
                  ? "active"
                  : idx === compareIndex
                  ? "compare"
                  : ""
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </section>
    </StoryPanel>
  );
}
