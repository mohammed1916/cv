import StoryPanel from "../../components/shared/StoryPanel";
import "./StockStory2.css";

export default function StockStory2({ story, step }) {
  if (!step) {
    return (
      <StoryPanel
        title="Stock Trading II: Maximize Profit"
        description="Press Play or Next to step through the greedy algorithm."
      >
        <p className="stock2-explanation">
          You are given daily stock prices and can execute multiple transactions.
          The greedy approach captures every adjacent upward slope to guarantee the
          maximum possible profit.
        </p>
      </StoryPanel>
    );
  }

  const { prices, totalProfit } = story;
  const {
    phase,
    explanation,
    message,
    currentDay,
    prevDay,
    currentPrice,
    prevPrice,
    diff,
    isUpward,
    profit,
    transactions = [],
  } = step;

  const n = prices ? prices.length : 0;

  // Chart layout calculations
  const svgWidth = 640;
  const svgHeight = 220;
  const padding = { top: 32, right: 36, bottom: 44, left: 48 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  let points = [];
  let gridLevels = [];

  if (n > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    let yMin;
    let yMax;
    if (minPrice === maxPrice) {
      yMin = Math.max(0, minPrice - 2);
      yMax = maxPrice + 2;
    } else {
      const range = maxPrice - minPrice;
      yMin = Math.max(0, Math.floor(minPrice - range * 0.15));
      yMax = Math.ceil(maxPrice + range * 0.15);
    }
    const ySpan = yMax - yMin || 1;

    gridLevels = [
      yMin,
      Math.round((yMin + yMax) / 2),
      yMax,
    ];

    points = prices.map((price, idx) => {
      const x =
        n === 1
          ? padding.left + plotWidth / 2
          : padding.left + (idx / (n - 1)) * plotWidth;
      const y =
        svgHeight - padding.bottom - ((price - yMin) / ySpan) * plotHeight;
      return { x, y, price, day: idx };
    });
  }

  const basePathD =
    points.length > 1
      ? points
          .map((pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`))
          .join(" ")
      : "";

  const activePrevPt =
    prevDay !== null && prevDay !== undefined && points[prevDay]
      ? points[prevDay]
      : null;
  const activeCurrPt =
    currentDay !== null && currentDay !== undefined && points[currentDay]
      ? points[currentDay]
      : null;

  // Profit meter computation
  const targetProfit = totalProfit > 0 ? totalProfit : 1;
  const profitPercentage = Math.min(
    100,
    Math.round((profit / targetProfit) * 100),
  );

  let panelTitle = "Stock Trading II: Max Profit";
  if (phase === "init") {
    panelTitle = "Initialize State: profit = 0";
  } else if (phase === "compare") {
    panelTitle = `Day ${prevDay} ($${prevPrice}) vs Day ${currentDay} ($${currentPrice})`;
  } else if (phase === "update") {
    panelTitle = `Captured +$${diff} Profit! (Total: $${profit})`;
  } else if (phase === "done") {
    panelTitle = `Optimal Profit Found: $${profit}`;
  }

  return (
    <StoryPanel title={panelTitle} description={message}>
      <p className="stock2-explanation">{explanation}</p>

      {/* Dashboard cards */}
      <div className="stock2-dashboard">
        <div
          className={`stock2-card ${phase === "update" ? "highlight" : ""}`}
        >
          <div className="stock2-card-label">Accumulated Profit</div>
          <div className="stock2-card-value-row">
            <span
              className={`stock2-profit-number ${profit > 0 ? "profit-positive" : ""}`}
            >
              ${profit}
            </span>
            {phase === "update" && (
              <span className="stock2-profit-badge">+${diff}</span>
            )}
          </div>
          <div className="stock2-profit-meter-track">
            <div
              className="stock2-profit-meter-bar"
              style={{ width: `${profitPercentage}%` }}
            />
          </div>
          <div className="stock2-card-desc">
            {transactions.length} trade(s) captured • Target: ${totalProfit}
          </div>
        </div>

        <div className="stock2-card">
          <div className="stock2-card-label">Current Step Assessment</div>
          <div className="stock2-compare-row">
            {currentDay !== null && prevDay !== null ? (
              <>
                <span>
                  Day {prevDay} (${prevPrice}) → Day {currentDay} ($
                  {currentPrice})
                </span>
              </>
            ) : (
              <span>{phase === "done" ? "Scan finished" : "Not started"}</span>
            )}
          </div>
          <div style={{ marginTop: "4px" }}>
            {phase === "compare" && isUpward && (
              <span className="stock2-action-badge buy-sell">
                ▲ Upward (+${diff}) • Buy & Sell
              </span>
            )}
            {phase === "compare" && !isUpward && diff < 0 && (
              <span className="stock2-action-badge skip">
                ▼ Drop (-${Math.abs(diff)}) • Skip
              </span>
            )}
            {phase === "compare" && !isUpward && diff === 0 && (
              <span className="stock2-action-badge flat">
                — Flat ($0) • Skip
              </span>
            )}
            {phase === "update" && (
              <span className="stock2-action-badge buy-sell">
                ✓ Banked +${diff}
              </span>
            )}
            {phase === "done" && (
              <span className="stock2-action-badge buy-sell">
                ✓ Complete (${profit})
              </span>
            )}
            {phase === "init" && (
              <span className="stock2-action-badge idle">Ready</span>
            )}
          </div>
          <div className="stock2-card-desc">
            {isUpward
              ? `Capture slope: prices[${currentDay}] - prices[${prevDay}] = +$${diff}`
              : currentDay !== null && prevDay !== null
                ? `prices[${currentDay}] <= prices[${prevDay}], no gain possible`
                : "Checking adjacent day pairs"}
          </div>
        </div>
      </div>

      {/* SVG Price Chart */}
      {n > 0 && (
        <div
          className="stock2-chart-container"
          role="region"
          aria-label="Stock price chart with slope and profit step visualization"
        >
          <div className="stock2-chart-header">
            <span className="stock2-chart-title">
              Stock Price Trend & Slope Step
            </span>
            <div className="stock2-chart-legend">
              <div className="stock2-legend-item">
                <span className="stock2-legend-swatch swatch-profit" />
                <span>Profitable Step (+Δ)</span>
              </div>
              <div className="stock2-legend-item">
                <span className="stock2-legend-swatch swatch-skip" />
                <span>Loss / Drop (-Δ)</span>
              </div>
              <div className="stock2-legend-item">
                <span className="stock2-legend-swatch swatch-neutral" />
                <span>Prices Baseline</span>
              </div>
            </div>
          </div>

          <svg
            className="stock2-svg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            aria-hidden="true"
          >
            {/* Grid horizontal lines */}
            {gridLevels.map((levelVal, idx) => {
              const yPos =
                svgHeight -
                padding.bottom -
                ((levelVal - gridLevels[0]) /
                  (gridLevels[gridLevels.length - 1] - gridLevels[0] || 1)) *
                  plotHeight;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={svgWidth - padding.right}
                    y2={yPos}
                    className="stock2-grid-line"
                  />
                  <text
                    x={padding.left - 8}
                    y={yPos}
                    className="stock2-axis-label"
                    textAnchor="end"
                  >
                    ${levelVal}
                  </text>
                </g>
              );
            })}

            {/* Base line connecting all price points */}
            {basePathD && <path d={basePathD} className="stock2-base-path" />}

            {/* Previously harvested transaction lines */}
            {transactions.map((tx, idx) => {
              const bPt = points[tx.buyDay];
              const sPt = points[tx.sellDay];
              if (!bPt || !sPt) return null;
              // Green slope line
              return (
                <line
                  key={`tx-${idx}`}
                  x1={bPt.x}
                  y1={bPt.y}
                  x2={sPt.x}
                  y2={sPt.y}
                  className="stock2-slope-line harvested"
                />
              );
            })}

            {/* Active comparison: Green upward step or red drop step */}
            {activePrevPt && activeCurrPt && (
              <g className="stock2-active-step-group">
                {/* Step right triangle: run along horizontal at prev price, rise along vertical */}
                <path
                  d={`M ${activePrevPt.x} ${activePrevPt.y} L ${activeCurrPt.x} ${activePrevPt.y} L ${activeCurrPt.x} ${activeCurrPt.y} Z`}
                  className={`stock2-step-triangle ${isUpward ? "profitable" : "unprofitable"}`}
                />

                {/* Vertical dimension text */}
                <text
                  x={activeCurrPt.x + 8}
                  y={(activePrevPt.y + activeCurrPt.y) / 2}
                  fill={isUpward ? "#10b981" : "#ef4444"}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  dominantBaseline="middle"
                >
                  {isUpward ? `+${diff}` : `${diff}`}
                </text>

                {/* Active slope hypotenuse */}
                <line
                  x1={activePrevPt.x}
                  y1={activePrevPt.y}
                  x2={activeCurrPt.x}
                  y2={activeCurrPt.y}
                  className={`stock2-slope-line ${
                    isUpward
                      ? "active-profit"
                      : diff < 0
                        ? "active-drop"
                        : "active-flat"
                  }`}
                />

                {/* Floating pill badge on slope midpoint */}
                {(() => {
                  const midX = (activePrevPt.x + activeCurrPt.x) / 2;
                  const midY = (activePrevPt.y + activeCurrPt.y) / 2 - 16;
                  const badgeColor = isUpward
                    ? "#10b981"
                    : diff < 0
                      ? "#ef4444"
                      : "#64748b";
                  return (
                    <g>
                      <rect
                        x={midX - 20}
                        y={midY - 10}
                        width="40"
                        height="20"
                        rx="5"
                        fill={badgeColor}
                      />
                      <text
                        x={midX}
                        y={midY + 1}
                        className="stock2-floating-badge"
                        fill="#ffffff"
                      >
                        {diff > 0 ? `+${diff}` : `${diff}`}
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Price node points and labels */}
            {points.map((pt) => {
              let nodeClass = "normal-day";
              if (pt.day === currentDay) {
                nodeClass = "active-day";
              } else if (pt.day === prevDay) {
                nodeClass = "buy-day";
              } else if (
                transactions.some(
                  (t) => t.buyDay === pt.day || t.sellDay === pt.day,
                )
              ) {
                nodeClass = "harvested-day";
              }

              const isFocused = pt.day === currentDay || pt.day === prevDay;

              return (
                <g key={pt.day}>
                  {/* Circle dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isFocused ? 6 : 4}
                    className={`stock2-node-circle ${nodeClass}`}
                  />
                  {/* Price label above dot */}
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    className="stock2-price-label"
                  >
                    ${pt.price}
                  </text>
                  {/* Day label below axis */}
                  <text
                    x={pt.x}
                    y={svgHeight - 16}
                    className="stock2-day-label"
                  >
                    D{pt.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Harvested Transactions Ledger */}
      <div className="stock2-ledger-section">
        <div className="stock2-ledger-header">
          <span className="stock2-ledger-title">
            Harvested Transactions ({transactions.length})
          </span>
          <span className="stock2-card-desc">
            Running Gain: ${profit}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="stock2-ledger-empty">
            No profitable transactions captured yet.
          </div>
        ) : (
          <div className="stock2-ledger-list">
            {transactions.map((tx, idx) => {
              const isJustAdded =
                phase === "update" && idx === transactions.length - 1;
              return (
                <div
                  key={idx}
                  className={`stock2-ledger-item ${isJustAdded ? "just-added" : ""}`}
                >
                  <span className="stock2-ledger-trade-num">#{idx + 1}</span>
                  <span className="stock2-ledger-days">
                    Day {tx.buyDay} (${prices[tx.buyDay]}) → Day {tx.sellDay} ($
                    {prices[tx.sellDay]})
                  </span>
                  <span className="stock2-ledger-gain">
                    +${tx.profit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StoryPanel>
  );
}
