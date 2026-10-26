import StoryPanel from "../../components/shared/StoryPanel";
import SvgViewport from "../../components/shared/SvgViewport";
import "./StockStory.css";

export default function StockStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Best Time to Buy and Sell Stock"
        description="Press Play to begin."
        label="Stock Visualizer"
      >
        <p>
          Find the maximum profit achievable with a single buy and subsequent
          sell transaction using a one-pass greedy scan.
        </p>
      </StoryPanel>
    );
  }

  const { prices } = story;
  const n = prices.length;
  const maxPrice = Math.max(...prices, 1);

  // SVG Chart Geometry
  const barWidth = Math.max(28, Math.min(52, Math.floor(580 / Math.max(n, 1))));
  const gap = Math.max(12, Math.floor(barWidth * 0.42));
  const leftPad = 70;
  const rightPad = 50;
  const svgWidth = Math.max(520, leftPad + n * (barWidth + gap) + rightPad);
  const svgHeight = 290;
  const groundY = 220;
  const chartHeight = 150;

  const yForPrice = (p) => groundY - (p / maxPrice) * chartHeight;
  const xForDay = (i) => leftPad + i * (barWidth + gap);
  const xCenter = (i) => xForDay(i) + barWidth / 2;

  const isDone = step.phase === "done";
  const hasBestTrade =
    step.bestBuyDay >= 0 && step.bestSellDay >= 0 && step.maxProfit > 0;

  // Title generation
  let title = "Best Time to Buy and Sell Stock";
  if (isDone) {
    title =
      step.maxProfit > 0
        ? `Maximum Profit: $${step.maxProfit} (Buy Day ${step.bestBuyDay} → Sell Day ${step.bestSellDay})`
        : "Complete: No Profitable Trade Possible ($0 Profit)";
  } else if (step.phase === "init") {
    title = "Initialize Baseline: minPrice = ∞, maxProfit = 0";
  } else if (step.phase === "scan") {
    title = `Day ${step.i}: Inspecting Stock Price $${step.currentPrice}`;
  } else if (step.phase === "compare") {
    title =
      step.activeLine === 5
        ? `Day ${step.i}: Is Price $${step.currentPrice} < minPrice ($${step.minPrice === Infinity ? "∞" : step.minPrice})?`
        : `Day ${step.i}: Is Profit $${step.prospectiveProfit} > maxProfit ($${step.maxProfit})?`;
  } else if (step.phase === "update") {
    title =
      step.activeLine === 6
        ? `Day ${step.i}: New Lowest Buy Price $${step.minPrice} Recorded`
        : `Day ${step.i}: New Best Profit $${step.maxProfit} Achieved!`;
  }

  return (
    <StoryPanel
      title={title}
      description={step.message}
      label="Stock Price Timeline and Greedy Single-Pass Visualization"
      className="stock-story-panel"
    >
      <p className="stock-story__explanation">{step.explanation}</p>

      {/* Metrics Header Cards */}
      <div
        className="stock-story__metrics"
        role="region"
        aria-label="Algorithm state metrics"
      >
        <div className="stock-story__metric-card">
          <span className="stock-story__metric-label">minPrice (Best Buy)</span>
          <span className="stock-story__metric-val stock-story__metric-val--min">
            {step.minPrice === Infinity ? "∞" : `$${step.minPrice}`}
          </span>
          <span className="stock-story__metric-sub">
            {step.minDay >= 0 ? `Day ${step.minDay}` : "Not yet set"}
          </span>
        </div>

        <div className="stock-story__metric-card">
          <span className="stock-story__metric-label">Day {step.i >= 0 ? step.i : "–"} Profit</span>
          <span className="stock-story__metric-val">
            {step.prospectiveProfit != null
              ? `+$${step.prospectiveProfit}`
              : "—"}
          </span>
          <span className="stock-story__metric-sub">
            {step.prospectiveProfit != null
              ? `$${step.currentPrice} − $${step.minPrice}`
              : "price − minPrice"}
          </span>
        </div>

        <div className="stock-story__metric-card">
          <span className="stock-story__metric-label">maxProfit (Record)</span>
          <span
            className={`stock-story__metric-val ${
              step.maxProfit > 0 ? "stock-story__metric-val--profit" : ""
            }`}
          >
            ${step.maxProfit}
          </span>
          <span className="stock-story__metric-sub">
            {step.maxProfit > 0 ? "Best profit so far" : "Initial floor"}
          </span>
        </div>

        <div className="stock-story__metric-card stock-story__metric-card--wide">
          <span className="stock-story__metric-label">Best Transaction</span>
          <span className="stock-story__metric-val stock-story__metric-val--trade">
            {hasBestTrade
              ? `Day ${step.bestBuyDay} ($${prices[step.bestBuyDay]}) → Day ${step.bestSellDay} ($${prices[step.bestSellDay]})`
              : "None yet"}
          </span>
          <span className="stock-story__metric-sub">
            {hasBestTrade
              ? `Net gain: +$${step.maxProfit}`
              : "Awaiting profitable pair"}
          </span>
        </div>
      </div>

      {/* Interactive Svg Viewport Chart */}
      <SvgViewport
        width={svgWidth}
        height={svgHeight}
        className="stock-story__viewport"
      >
        <title>Stock price bar chart and timeline</title>

        <defs>
          <marker
            id="stock-arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#22c55e" />
          </marker>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => {
          const val = Math.round(maxPrice * pct);
          const y = yForPrice(val);
          return (
            <g key={pct} className="stock-story__grid-line-group">
              <line
                x1={leftPad - 15}
                x2={svgWidth - 25}
                y1={y}
                y2={y}
                className="stock-story__grid-line"
              />
              <text
                x={leftPad - 20}
                y={y + 3}
                textAnchor="end"
                className="stock-story__grid-label"
              >
                ${val}
              </text>
            </g>
          );
        })}

        {/* X-axis baseline */}
        <line
          x1={leftPad - 15}
          x2={svgWidth - 25}
          y1={groundY}
          y2={groundY}
          className="stock-story__axis-line"
        />

        {/* minPrice horizontal reference line */}
        {step.minPrice < Infinity && (
          <g className="stock-story__min-reference">
            <line
              x1={leftPad - 15}
              x2={svgWidth - 25}
              y1={yForPrice(step.minPrice)}
              y2={yForPrice(step.minPrice)}
              className="stock-story__min-line"
            />
            <rect
              x={leftPad - 65}
              y={yForPrice(step.minPrice) - 10}
              width={45}
              height={18}
              rx={3}
              fill="rgba(56, 189, 248, 0.2)"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <text
              x={leftPad - 42}
              y={yForPrice(step.minPrice) + 3}
              textAnchor="middle"
              className="stock-story__min-line-label"
            >
              ${step.minPrice}
            </text>
          </g>
        )}

        {/* Best trade connection arc between bestBuyDay and bestSellDay */}
        {hasBestTrade && (
          <g className="stock-story__best-trade-arc">
            {(() => {
              const bX = xCenter(step.bestBuyDay);
              const sX = xCenter(step.bestSellDay);
              const bY = yForPrice(prices[step.bestBuyDay]);
              const sY = yForPrice(prices[step.bestSellDay]);
              const arcPeak = Math.max(18, Math.min(bY, sY) - 34);
              const midX = (bX + sX) / 2;

              return (
                <>
                  <path
                    d={`M ${bX} ${bY - 4} Q ${midX} ${arcPeak} ${sX} ${sY - 4}`}
                    className="stock-story__arc-path"
                    markerEnd="url(#stock-arrowhead)"
                  />
                  <rect
                    x={midX - 44}
                    y={arcPeak - 14}
                    width={88}
                    height={18}
                    rx={9}
                    className="stock-story__arc-badge"
                  />
                  <text
                    x={midX}
                    y={arcPeak - 1}
                    textAnchor="middle"
                    className="stock-story__arc-text"
                  >
                    Profit +${step.maxProfit}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Price Bars and Markers */}
        {prices.map((price, idx) => {
          const bx = xForDay(idx);
          const by = yForPrice(price);
          const bh = Math.max(4, groundY - by);
          const cx = xCenter(idx);

          const isCurrent = step.i === idx;
          const isMinDay = step.minDay === idx && step.minPrice < Infinity;
          const isBestBuy = step.bestBuyDay === idx && step.maxProfit > 0;
          const isBestSell = step.bestSellDay === idx && step.maxProfit > 0;
          const isEvaluatingSell =
            isCurrent &&
            (step.activeLine === 7 || step.activeLine === 8) &&
            step.prospectiveProfit != null;

          let barState = "default";
          if (isCurrent) barState = "current";
          else if (isDone && isBestSell) barState = "best-sell";
          else if (isDone && isBestBuy) barState = "best-buy";
          else if (isMinDay) barState = "min-price";

          return (
            <g
              key={idx}
              className="stock-story__bar-group"
              data-state={barState}
              tabIndex={0}
              role="figure"
              aria-label={`Day ${idx}: price $${price}`}
            >
              {/* Underlying price bar */}
              <rect
                x={bx}
                y={by}
                width={barWidth}
                height={bh}
                rx={4}
                ry={4}
                className="stock-story__bar"
              />

              {/* Prospective profit overlay bracket when evaluating selling today */}
              {isEvaluatingSell && (
                <rect
                  x={bx}
                  y={by}
                  width={barWidth}
                  height={Math.max(4, yForPrice(step.minPrice) - by)}
                  rx={4}
                  className="stock-story__profit-overlay"
                />
              )}

              {/* Price text above bar */}
              <text
                x={cx}
                y={by - 8}
                textAnchor="middle"
                className="stock-story__price-text"
              >
                ${price}
              </text>

              {/* Day index label below baseline */}
              <text
                x={cx}
                y={groundY + 16}
                textAnchor="middle"
                className="stock-story__day-text"
              >
                {idx}
              </text>

              {/* Day role badge under the index */}
              {isBestBuy && isBestSell ? (
                <text
                  x={cx}
                  y={groundY + 32}
                  textAnchor="middle"
                  className="stock-story__badge stock-story__badge--success"
                >
                  BUY/SELL
                </text>
              ) : isBestBuy && (isDone || isMinDay) ? (
                <text
                  x={cx}
                  y={groundY + 32}
                  textAnchor="middle"
                  className="stock-story__badge stock-story__badge--buy"
                >
                  BUY ★
                </text>
              ) : isBestSell && isDone ? (
                <text
                  x={cx}
                  y={groundY + 32}
                  textAnchor="middle"
                  className="stock-story__badge stock-story__badge--sell"
                >
                  SELL ★
                </text>
              ) : isMinDay ? (
                <text
                  x={cx}
                  y={groundY + 32}
                  textAnchor="middle"
                  className="stock-story__badge stock-story__badge--min"
                >
                  MIN
                </text>
              ) : isEvaluatingSell ? (
                <text
                  x={cx}
                  y={groundY + 32}
                  textAnchor="middle"
                  className="stock-story__badge stock-story__badge--eval"
                >
                  SELL?
                </text>
              ) : null}

              {/* Current day inspection pointer */}
              {isCurrent && (
                <g className="stock-story__pointer-group">
                  <polygon
                    points={`${cx},${by - 14} ${cx - 6},${by - 23} ${cx + 6},${by - 23}`}
                    className="stock-story__pointer-arrow"
                  />
                  <rect
                    x={cx - 24}
                    y={by - 37}
                    width={48}
                    height={16}
                    rx={3}
                    className="stock-story__pointer-pill"
                  />
                  <text
                    x={cx}
                    y={by - 25}
                    textAnchor="middle"
                    className="stock-story__pointer-text"
                  >
                    Day {idx}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </SvgViewport>
    </StoryPanel>
  );
}
