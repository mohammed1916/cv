import StoryPanel from "../../components/shared/StoryPanel";
import "./StockStory3.css";

function fmt(val) {
  if (val === -Infinity || !Number.isFinite(val)) return "-∞";
  return String(val);
}

function fmtMoney(val) {
  if (val === -Infinity || !Number.isFinite(val)) return "-∞";
  if (val < 0) return `-$${Math.abs(val)}`;
  return `$${val}`;
}

const STATE_CONFIG = [
  {
    key: "b1",
    label: "b1",
    title: "1st Buy Net",
    formula: "max(b1, -p)",
    desc: "Max cash after 1st buy",
    colorClass: "card-b1",
  },
  {
    key: "s1",
    label: "s1",
    title: "1st Sell Profit",
    formula: "max(s1, b1 + p)",
    desc: "Max profit after 1st sell",
    colorClass: "card-s1",
  },
  {
    key: "b2",
    label: "b2",
    title: "2nd Buy Net",
    formula: "max(b2, s1 - p)",
    desc: "Reinvest tx1 in 2nd buy",
    colorClass: "card-b2",
  },
  {
    key: "s2",
    label: "s2",
    title: "2nd Sell Profit",
    formula: "max(s2, b2 + p)",
    desc: "Max total profit (<= 2 tx)",
    colorClass: "card-s2",
  },
];

export default function StockStory3({ story, step }) {
  if (!step || !story) {
    return (
      <StoryPanel
        title="Best Time to Buy and Sell Stock III"
        description="Press Play to track optimal 2-transaction profit."
      >
        <p>
          At most two transactions are permitted. We track 4 states simultaneously
          in a single pass: <code>b1</code>, <code>s1</code>, <code>b2</code>, and <code>s2</code>.
        </p>
      </StoryPanel>
    );
  }

  const prices = story.prices || [];
  const {
    dayIndex = -1,
    currentPrice = null,
    b1 = -Infinity,
    s1 = 0,
    b2 = -Infinity,
    s2 = 0,
    prevStates = {},
    activeVar = null,
    comparison = null,
    history = [],
    phase = "init",
    message = "",
    explanation = "",
  } = step;

  // Timeline SVG calculations
  const svgWidth = 560;
  const svgHeight = 110;
  const padX = 40;
  const padY = 24;
  const plotWidth = Math.max(svgWidth - 2 * padX, 1);
  const plotHeight = Math.max(svgHeight - 2 * padY, 1);

  const maxPrice = prices.length > 0 ? Math.max(...prices, 1) : 1;
  const minPrice = 0;
  const priceRange = maxPrice - minPrice || 1;

  const points = prices.map((p, idx) => {
    const x =
      prices.length > 1
        ? padX + (idx / (prices.length - 1)) * plotWidth
        : svgWidth / 2;
    const y = padY + plotHeight - ((p - minPrice) / priceRange) * plotHeight;
    return { x, y, p, idx };
  });

  const polylinePoints = points.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const areaPoints =
    points.length > 1
      ? `${points[0].x},${padY + plotHeight} ${polylinePoints} ${points[points.length - 1].x},${padY + plotHeight}`
      : "";

  const activePoint = dayIndex >= 0 && dayIndex < points.length ? points[dayIndex] : null;

  // Header title
  const panelTitle =
    phase === "done"
      ? `Final Max Profit: $${story.maxProfit}`
      : phase === "init"
        ? "Initialize 4 DP Variables"
        : `Day ${dayIndex}: Stock Price $${currentPrice}`;

  return (
    <StoryPanel
      title={panelTitle}
      description={message}
      label="Best Time to Buy and Sell Stock III Story Panel"
    >
      <div className="stock-story">
        {/* Explanation text */}
        <p className="stock-story__explanation">{explanation}</p>

        {/* Comparison Callout when evaluating a variable */}
        {comparison && (
          <div
            className="stock-story__calc-banner"
            data-updated={comparison.updated ? "true" : "false"}
            role="status"
            aria-live="polite"
          >
            <div className="stock-story__calc-header">
              <span className="stock-story__calc-badge">
                {comparison.updated ? "State Updated" : "Kept Previous State"}
              </span>
              <span className="stock-story__calc-label">
                Evaluating <strong>{comparison.target}</strong> ({comparison.label})
              </span>
            </div>
            <div className="stock-story__calc-math">
              <span className="stock-story__formula">{comparison.formula}</span>
              <span className="stock-story__calc-arrow">&rarr;</span>
              <strong className="stock-story__calc-result">
                {fmtMoney(comparison.resultVal)}
              </strong>
            </div>
          </div>
        )}

        {/* 4 State Cards */}
        <div
          className="stock-story__cards"
          role="region"
          aria-label="4 DP State Cards: b1, s1, b2, s2"
        >
          {STATE_CONFIG.map((cfg) => {
            const currentVal =
              cfg.key === "b1"
                ? b1
                : cfg.key === "s1"
                  ? s1
                  : cfg.key === "b2"
                    ? b2
                    : s2;
            const prevVal = prevStates[cfg.key];
            const isActive = activeVar === cfg.key;
            const isUpdated = isActive && step.updated;

            return (
              <div
                key={cfg.key}
                className={`stock-story__card ${cfg.colorClass}`}
                data-active={isActive ? "true" : "false"}
                data-updated={isUpdated ? "true" : "false"}
              >
                <div className="stock-story__card-top">
                  <span className="stock-story__card-var">{cfg.label}</span>
                  <span className="stock-story__card-title">{cfg.title}</span>
                </div>

                <div className="stock-story__card-value">
                  {fmtMoney(currentVal)}
                </div>

                <div className="stock-story__card-formula">
                  <code>{cfg.formula}</code>
                </div>

                <div className="stock-story__card-meta">
                  {isActive ? (
                    <span
                      className={`stock-story__card-tag ${
                        isUpdated ? "tag-updated" : "tag-kept"
                      }`}
                    >
                      {isUpdated ? "Updated" : "Unchanged"} (Prev: {fmtMoney(prevVal)})
                    </span>
                  ) : (
                    <span className="stock-story__card-desc">{cfg.desc}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Timeline SVG */}
        {prices.length > 0 && (
          <div
            className="stock-story__timeline-container"
            role="region"
            aria-label="Stock Price Timeline"
          >
            <div className="stock-story__timeline-header">
              <span className="stock-story__timeline-title">Price Timeline</span>
              <span className="stock-story__timeline-info">
                {prices.length} trading days &bull; Max price: ${maxPrice}
              </span>
            </div>

            <svg
              className="stock-story__timeline-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Price chart with day cursor"
            >
              <defs>
                <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area under curve */}
              {areaPoints && (
                <polygon points={areaPoints} fill="url(#stockAreaGrad)" />
              )}

              {/* Polyline connecting points */}
              {points.length > 1 && (
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="var(--accent, #3b82f6)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Day indicator line */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={padY - 4}
                  x2={activePoint.x}
                  y2={svgHeight - 12}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}

              {/* Price Points */}
              {points.map((pt) => {
                const isCurrent = pt.idx === dayIndex;
                const isPast = pt.idx < dayIndex || phase === "done";

                return (
                  <g key={pt.idx} className="stock-story__point-group">
                    {/* Active Halo */}
                    {isCurrent && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9"
                        fill="rgba(251, 191, 36, 0.25)"
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isCurrent ? 5.5 : 4}
                      fill={
                        isCurrent
                          ? "#fbbf24"
                          : isPast
                            ? "var(--accent, #3b82f6)"
                            : "var(--border, #64748b)"
                      }
                      stroke="var(--surface, #1e293b)"
                      strokeWidth="2"
                    />

                    {/* Price tag above */}
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      textAnchor="middle"
                      className={`stock-story__svg-label ${
                        isCurrent ? "svg-label-active" : ""
                      }`}
                    >
                      ${pt.p}
                    </text>

                    {/* Day tag below */}
                    <text
                      x={pt.x}
                      y={svgHeight - 4}
                      textAnchor="middle"
                      className={`stock-story__svg-sublabel ${
                        isCurrent ? "svg-sublabel-active" : ""
                      }`}
                    >
                      D{pt.idx}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* DP Evolution History Table */}
        {prices.length > 0 && (
          <div className="stock-story__table-container">
            <div className="stock-story__table-header">
              <span className="stock-story__table-title">DP Evolution Matrix</span>
              <span className="stock-story__table-sub">
                Step-by-step state snapshot after each day
              </span>
            </div>

            <div className="stock-story__table-scroll">
              <table className="stock-story__table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Price</th>
                    <th className="th-b1">b1 (Buy 1)</th>
                    <th className="th-s1">s1 (Sell 1)</th>
                    <th className="th-b2">b2 (Buy 2)</th>
                    <th className="th-s2">s2 (Sell 2)</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p, idx) => {
                    const rowHist = history.find((h) => h.day === idx);
                    const isCurrentDay = idx === dayIndex;
                    const isEvaluated = Boolean(rowHist) || (isCurrentDay && phase !== "init");

                    const rowB1 = rowHist ? rowHist.b1 : isCurrentDay ? b1 : null;
                    const rowS1 = rowHist ? rowHist.s1 : isCurrentDay ? s1 : null;
                    const rowB2 = rowHist ? rowHist.b2 : isCurrentDay ? b2 : null;
                    const rowS2 = rowHist ? rowHist.s2 : isCurrentDay ? s2 : null;

                    return (
                      <tr
                        key={idx}
                        className={`stock-story__row ${
                          isCurrentDay ? "row-active" : ""
                        } ${isEvaluated ? "row-evaluated" : "row-pending"}`}
                      >
                        <td>
                          <strong>Day {idx}</strong>
                          {isCurrentDay && <span className="current-indicator">&bull;</span>}
                        </td>
                        <td>${p}</td>
                        <td
                          className={`td-b1 ${
                            isCurrentDay && activeVar === "b1" ? "cell-active" : ""
                          }`}
                        >
                          {rowB1 !== null ? fmt(rowB1) : "--"}
                        </td>
                        <td
                          className={`td-s1 ${
                            isCurrentDay && activeVar === "s1" ? "cell-active" : ""
                          }`}
                        >
                          {rowS1 !== null ? fmt(rowS1) : "--"}
                        </td>
                        <td
                          className={`td-b2 ${
                            isCurrentDay && activeVar === "b2" ? "cell-active" : ""
                          }`}
                        >
                          {rowB2 !== null ? fmt(rowB2) : "--"}
                        </td>
                        <td
                          className={`td-s2 ${
                            isCurrentDay && activeVar === "s2" ? "cell-active" : ""
                          }`}
                        >
                          {rowS2 !== null ? fmt(rowS2) : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Final Conclusion Banner */}
        {phase === "done" && (
          <div
            className="stock-story__done-card"
            role="region"
            aria-label="Result summary"
          >
            <div className="stock-story__done-icon">&#10003;</div>
            <div className="stock-story__done-text">
              <div className="stock-story__done-title">
                Optimal Profit: ${story.maxProfit}
              </div>
              <div className="stock-story__done-desc">
                By maintaining at most 2 non-overlapping transactions, the
                algorithm tracks the global maximum net profit in <code>O(n)</code>{" "}
                time and <code>O(1)</code> space.
              </div>
            </div>
          </div>
        )}
      </div>
    </StoryPanel>
  );
}
