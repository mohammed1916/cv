import StoryPanel from "../../components/shared/StoryPanel";
import "./GasStationStory.css";

/**
 * Visual story component for Problem 134: Gas Station.
 * Visualizes circular track of stations, car position, fuel tank gauge,
 * and deficit reset events.
 */
export default function GasStationStory({ story, step }) {
  if (!story) return null;

  const currentStep = step || story.frames[0];
  const { gas, cost, net, totalGas, totalCost } = story;
  const n = gas.length;

  const currentIndex = currentStep.currentIndex;
  const candidateStart = currentStep.candidateStart;
  const currTank = currentStep.currTank;
  const totalTank = currentStep.totalTank;
  const phase = currentStep.phase;
  const isDeficit = currentStep.phase === "deficit" || currentStep.event?.includes("deficit");

  // Polar coordinates for circular track
  const cx = 200;
  const cy = 200;
  const radius = n <= 2 ? 110 : 130;

  const stationCoords = gas.map((_, i) => {
    if (n === 1) {
      return { x: cx, y: cy - radius, angle: -Math.PI / 2 };
    }
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle,
    };
  });

  // Calculate maximum fuel capacity for gauge scaling
  const maxCapacity = Math.max(
    1,
    ...gas,
    ...story.frames.map((f) => f.currTank || 0)
  );

  const tankPercentage = Math.min(
    100,
    Math.max(0, (Math.max(0, currTank) / maxCapacity) * 100)
  );

  // Active car position
  let carPos = null;
  if (currentIndex >= 0 && currentIndex < n) {
    carPos = stationCoords[currentIndex];
  } else if (phase === "done" && story.canComplete && story.startStation >= 0) {
    carPos = stationCoords[story.startStation % n];
  }

  return (
    <StoryPanel
      title="Circular Track & Fuel Dynamics"
      description={currentStep.explanation || currentStep.message}
      label="Gas station circuit visual story"
    >
      <div className="gss-container">
        {/* Top Metric Cards */}
        <div className="gss-metrics-bar" role="region" aria-label="Circuit metrics">
          <div className={`gss-metric-card ${candidateStart >= 0 ? "highlight" : ""}`}>
            <span className="gss-metric-label">
              <span>🏁</span> Candidate Start
            </span>
            <div className="gss-metric-value">
              {candidateStart >= 0 ? `Station ${candidateStart}` : "None"}
              {phase === "done" && story.canComplete && (
                <span className="gss-metric-sub"> (Verified)</span>
              )}
            </div>
          </div>

          <div className="gss-metric-card">
            <span className="gss-metric-label">
              <span>🚗</span> Car Location
            </span>
            <div className="gss-metric-value">
              {currentIndex >= 0 ? `Station ${currentIndex}` : "Standby"}
            </div>
          </div>

          <div className={`gss-metric-card ${currTank < 0 ? "warning" : ""}`}>
            <span className="gss-metric-label">
              <span>⛽</span> Current Tank
            </span>
            <div className="gss-metric-value">
              {currTank}
              <span className="gss-metric-sub"> gal</span>
            </div>
          </div>

          <div className={`gss-metric-card ${totalTank < 0 ? "warning" : "highlight"}`}>
            <span className="gss-metric-label">
              <span>⚖️</span> Total Balance
            </span>
            <div className="gss-metric-value">
              {totalTank >= 0 ? `+${totalTank}` : totalTank}
              <span className="gss-metric-sub">
                {" "}
                ({totalGas} gas vs {totalCost} cost)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Fuel Gauge */}
        <div className="gss-fuel-gauge" role="region" aria-label="Fuel tank level">
          <div className="gss-fuel-header">
            <span>Trip Fuel Tank (curr_tank)</span>
            <span>
              {currTank} / {maxCapacity} gal
            </span>
          </div>
          <div className="gss-fuel-track">
            <div
              className={`gss-fuel-fill ${
                currTank < 0 ? "deficit" : currTank <= 1 ? "low" : "normal"
              }`}
              style={{ width: `${currTank < 0 ? 100 : tankPercentage}%` }}
            />
            <div className="gss-fuel-text">
              {currTank < 0 ? `DEFICIT: ${currTank} GAL` : `${currTank} gal`}
            </div>
          </div>
        </div>

        {/* Circular Track Stage */}
        <div className="gss-track-stage" role="region" aria-label="Circular road network">
          <svg
            className="gss-track-svg"
            viewBox="0 0 400 400"
            role="img"
            aria-label="Gas station circular track"
          >
            {/* Base Road Circular Track */}
            <circle cx={cx} cy={cy} r={radius} className="gss-svg-road-base" />
            <circle cx={cx} cy={cy} r={radius} className="gss-svg-road-dash" />

            {/* Road travel arcs / segment indicators */}
            {gas.map((_, i) => {
              const from = stationCoords[i];
              const to = stationCoords[(i + 1) % n];
              const isActiveEdge = currentIndex === i;

              // Quadratic curve midpoint pulled slightly inward
              const midAngle = (from.angle + to.angle) / 2;
              const textR = radius - 26;
              const tx = cx + textR * Math.cos(midAngle);
              const ty = cy + textR * Math.sin(midAngle);

              return (
                <g key={`edge-${i}`}>
                  {isActiveEdge && (
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#f59e0b"
                      strokeWidth="5"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  )}
                  {n <= 6 && (
                    <text
                      x={tx}
                      y={ty}
                      fill="var(--text-muted)"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      -{cost[i]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Central Hub Dashboard */}
            <circle cx={cx} cy={cy} r={46} className="gss-svg-center-hub" />
            <text x={cx} y={cy - 16} className="gss-svg-hub-title">
              Tank
            </text>
            <text x={cx} y={cy + 4} className="gss-svg-hub-val">
              {currTank} gal
            </text>
            <text
              x={cx}
              y={cy + 22}
              className="gss-svg-hub-status"
              fill={currTank < 0 ? "#ef4444" : "#10b981"}
            >
              {currTank < 0 ? "DEFICIT" : phase === "done" ? "COMPLETE" : "ON ROUTE"}
            </text>

            {/* Station Nodes */}
            {gas.map((g, i) => {
              const coord = stationCoords[i];
              const isCurrent = i === currentIndex;
              const isCandidate = candidateStart >= 0 && i === (candidateStart % n);
              const isStationDeficit = isCurrent && currTank < 0;

              // Position tags radially outside the station
              const tagR = radius + 32;
              const tagX = cx + tagR * Math.cos(coord.angle);
              const tagY = cy + tagR * Math.sin(coord.angle);

              let bgClass = "default";
              if (isStationDeficit) bgClass = "deficit";
              else if (isCurrent) bgClass = "current";
              else if (isCandidate) bgClass = "candidate";

              return (
                <g key={`station-${i}`} className="gss-svg-node">
                  {/* Outer candidate glow ring */}
                  {isCandidate && !isCurrent && (
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={24}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Main station circle */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={18}
                    className={`gss-svg-node-bg ${bgClass}`}
                  />

                  {/* Station number */}
                  <text x={coord.x} y={coord.y} className="gss-svg-node-num">
                    {i}
                  </text>

                  {/* Radial station fuel info */}
                  <g transform={`translate(${tagX}, ${tagY})`}>
                    <text
                      x="0"
                      y="-7"
                      className="gss-svg-node-tag"
                      fill="#10b981"
                    >
                      +{g}
                    </text>
                    <text
                      x="0"
                      y="4"
                      className="gss-svg-node-tag"
                      fill="#f43f5e"
                    >
                      -{cost[i]}
                    </text>
                    <text
                      x="0"
                      y="15"
                      className="gss-svg-node-tag"
                      fill={net[i] >= 0 ? "#10b981" : "#ef4444"}
                    >
                      Δ{net[i] >= 0 ? `+${net[i]}` : net[i]}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Car Marker */}
            {carPos && (
              <g
                className="gss-svg-car-marker"
                transform={`translate(${carPos.x}, ${carPos.y - 24})`}
              >
                <circle cx="0" cy="0" r="12" fill="#f59e0b" opacity="0.25" />
                <text
                  x="0"
                  y="4"
                  fontSize="16"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  🚗
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Deficit / Event Callout Banner */}
        {isDeficit && (
          <div className="gss-callout deficit" role="alert">
            <span className="gss-callout-icon">⚠️</span>
            <div className="gss-callout-body">
              <div className="gss-callout-title">Fuel Deficit Detected</div>
              <div>
                Current tank depleted to <strong>{currTank}</strong> at Station{" "}
                <strong>{currentIndex}</strong>. No station between former candidate and{" "}
                <strong>{currentIndex}</strong> could ever make it past this point.
                Advancing candidate start to <strong>Station {candidateStart}</strong> and
                refilling tank to 0.
              </div>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div
            className={`gss-callout ${story.canComplete ? "success" : "deficit"}`}
            role="status"
          >
            <span className="gss-callout-icon">
              {story.canComplete ? "🏆" : "🚫"}
            </span>
            <div className="gss-callout-body">
              <div className="gss-callout-title">
                {story.canComplete ? "Circuit Feasible!" : "Circuit Impossible"}
              </div>
              <div>
                {story.canComplete
                  ? `Starting at Station ${story.startStation} guarantees enough fuel to complete the entire circle with net balance ${totalTank}.`
                  : `Total fuel available (${totalGas}) is strictly less than total circuit cost (${totalCost}). Net balance is ${totalTank} (< 0). No station can complete the circuit.`}
              </div>
            </div>
          </div>
        )}

        {/* Station Net Delta Strip */}
        <div className="gss-strip-container" role="region" aria-label="Station list">
          <div className="gss-strip-header">Station Net Fuel Balance (gas[i] - cost[i])</div>
          <div className="gss-strip-list">
            {gas.map((g, i) => {
              const isCurrent = i === currentIndex;
              const isCandidate = candidateStart >= 0 && i === (candidateStart % n);
              const stationDeficit = isCurrent && currTank < 0;

              let itemClass = "";
              if (stationDeficit) itemClass = "deficit";
              else if (isCurrent) itemClass = "current";
              else if (isCandidate) itemClass = "candidate";

              return (
                <div key={i} className={`gss-strip-item ${itemClass}`}>
                  {isCandidate && <span className="gss-strip-flag">🏁</span>}
                  {isCurrent && !isCandidate && (
                    <span className="gss-strip-flag">🚗</span>
                  )}
                  <span className="gss-strip-idx">Station {i}</span>
                  <span className="gss-strip-gas">+{g} gas</span>
                  <span className="gss-strip-cost">-{cost[i]} cost</span>
                  <span className={`gss-strip-net ${net[i] >= 0 ? "pos" : "neg"}`}>
                    Δ {net[i] >= 0 ? `+${net[i]}` : net[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StoryPanel>
  );
}
