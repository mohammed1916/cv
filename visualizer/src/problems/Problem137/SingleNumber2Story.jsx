import StoryPanel from "../../components/shared/StoryPanel";
import { toBinaryString } from "./algorithm";
import "./SingleNumber2Story.css";

export default function SingleNumber2Story({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Single Number II (Modulo 3 Bit Counter)"
        description="Press Play to trace the algorithm."
        label="Single Number II story"
      >
        <p className="sn2-story__intro">
          Find the unique integer in an array where all other integers appear exactly three times.
          The algorithm simulates a 3-state finite state machine (00 → 01 → 10 → 00) across all bits
          using two bitmasks: <code>ones</code> and <code>twos</code>.
        </p>
      </StoryPanel>
    );
  }

  const { singleVal, bitWidth = 8 } = story;
  const isDone = step.phase === "done";
  const isInit = step.phase === "init";
  const bitStates = step.bitStates || [];
  const bitTransitions = step.bitTransitions || [];

  // Count bits currently in each FSM state
  const state00Count = bitStates.filter((b) => b.state === "00").length;
  const state01Count = bitStates.filter((b) => b.state === "01").length;
  const state10Count = bitStates.filter((b) => b.state === "10").length;

  const getStoryTitle = () => {
    if (isInit) {
      return "Step 1: Initialize 3-State Bit Counters (ones = 0, twos = 0)";
    }
    if (step.phase === "loop") {
      return `Step 2: Inspect Element nums[${step.currentIndex}] = ${step.currentNum}`;
    }
    if (step.phase === "update") {
      if (step.subphase === "ones") {
        return `Step 3a: Update 'ones' Bitmask for ${step.currentNum}`;
      }
      return `Step 3b: Update 'twos' Bitmask for ${step.currentNum}`;
    }
    if (isDone) {
      return `Complete: Single Number Found = ${step.singleVal ?? singleVal}`;
    }
    return "Single Number II Trace";
  };

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={step.message}
      label="Single Number II visualizer story"
      className="sn2-story"
    >
      <p className="sn2-story__explanation">{step.explanation}</p>

      {/* Hero / Status Section */}
      {isDone ? (
        <section className="sn2-hero sn2-hero--done" role="status" aria-label="Final algorithm result">
          <div className="sn2-hero__badge">Result Found</div>
          <div className="sn2-hero__val">
            Single Number: <strong>{step.singleVal ?? singleVal}</strong>
          </div>
          <div className="sn2-hero__sub">
            Binary: <code>0b{toBinaryString(step.singleVal ?? singleVal, bitWidth)}</code>
          </div>
          <p className="sn2-hero__desc">
            All numbers that occurred 3 times completed the full <code>00 → 01 → 10 → 00</code> cycle and returned to 00.
            Only <strong>{step.singleVal ?? singleVal}</strong> was seen once, leaving its bits recorded in <code>ones</code>.
          </p>
        </section>
      ) : (
        <section className="sn2-hero" role="region" aria-label="Current execution status">
          <div className="sn2-hero__header">
            <span className="sn2-hero__badge">
              {isInit ? "Initialization" : `Processing Element [${step.currentIndex}]`}
            </span>
            {step.currentNum !== null && (
              <span className="sn2-hero__num">
                Current Number: <strong>{step.currentNum}</strong>
                <span className="sn2-hero__bin"> (0b{toBinaryString(step.currentNum, bitWidth)})</span>
              </span>
            )}
          </div>
          <div className="sn2-hero__stats">
            <div className="sn2-stat-chip">
              <span className="sn2-stat-chip__label">ones (seen 1× mod 3):</span>
              <span className="sn2-stat-chip__val">{step.ones}</span>
              <code className="sn2-stat-chip__bin">0b{toBinaryString(step.ones, bitWidth)}</code>
            </div>
            <div className="sn2-stat-chip">
              <span className="sn2-stat-chip__label">twos (seen 2× mod 3):</span>
              <span className="sn2-stat-chip__val">{step.twos}</span>
              <code className="sn2-stat-chip__bin">0b{toBinaryString(step.twos, bitWidth)}</code>
            </div>
            <div className="sn2-stat-chip sn2-stat-chip--mod">
              <span className="sn2-stat-chip__label">ones &amp; twos:</span>
              <span className="sn2-stat-chip__val">{step.ones & step.twos}</span>
              <span className="sn2-stat-chip__hint">Always 0 (Disjoint)</span>
            </div>
          </div>
        </section>
      )}

      {/* Input Array Progression Rail */}
      <section className="sn2-array-rail" role="region" aria-label="Input array progression">
        <div className="sn2-section-title">Input Array Traversal (nums)</div>
        <div className="sn2-array-items" role="list">
          {story.nums.map((val, idx) => {
            const isCurrent = idx === step.currentIndex;
            const isProcessed = step.processedIndices.includes(idx);
            let statusClass = "pending";
            if (isCurrent) statusClass = "current";
            else if (isProcessed) statusClass = "processed";

            return (
              <div
                key={idx}
                role="listitem"
                className={`sn2-array-item sn2-array-item--${statusClass}`}
                aria-label={`Index ${idx}: value ${val}, status ${statusClass}`}
              >
                <span className="sn2-array-item__idx">[{idx}]</span>
                <span className="sn2-array-item__val">{val}</span>
                <span className="sn2-array-item__bin">0b{toBinaryString(val, bitWidth)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modulo 3 Finite State Machine Diagram */}
      <section className="sn2-fsm-section" role="region" aria-label="Finite state machine diagram">
        <div className="sn2-section-title">Modulo 3 Finite State Machine (Bit Counter)</div>
        <div className="sn2-fsm-container">
          <svg
            className="sn2-fsm-svg"
            viewBox="0 0 540 180"
            role="img"
            aria-label="FSM Diagram: State 00 transitions to 01 on bit 1, 01 transitions to 10 on bit 1, and 10 resets to 00 on bit 1."
          >
            <defs>
              <marker
                id="sn2-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="var(--primary)" />
              </marker>
              <marker
                id="sn2-arrow-reset"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="var(--error)" />
              </marker>
            </defs>

            {/* Transition 00 -> 01 (+1) */}
            <path
              d="M 125 70 C 180 20, 240 20, 295 70"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              markerEnd="url(#sn2-arrow)"
            />
            <text x="210" y="36" className="sn2-svg-label" textAnchor="middle">
              +1 bit (ones=1)
            </text>

            {/* Transition 01 -> 10 (+1) */}
            <path
              d="M 335 105 C 385 135, 435 135, 475 105"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              markerEnd="url(#sn2-arrow)"
            />
            <text x="410" y="145" className="sn2-svg-label" textAnchor="middle">
              +1 bit (twos=1)
            </text>

            {/* Transition 10 -> 00 (+1 Reset) */}
            <path
              d="M 460 70 C 360 -20, 190 -20, 95 70"
              fill="none"
              stroke="var(--error)"
              strokeWidth="2.5"
              strokeDasharray="5,4"
              markerEnd="url(#sn2-arrow-reset)"
            />
            <text x="270" y="8" className="sn2-svg-label sn2-svg-label--reset" textAnchor="middle">
              +1 bit (Reset to 00: count ≡ 0 mod 3)
            </text>

            {/* State Node 0: State 00 */}
            <g className="sn2-node-group" transform="translate(90, 95)">
              <circle
                r="40"
                className={`sn2-node-circle ${state00Count > 0 ? "sn2-node-circle--has-bits" : ""}`}
              />
              <text y="-8" className="sn2-node-title" textAnchor="middle">
                00
              </text>
              <text y="10" className="sn2-node-sub" textAnchor="middle">
                Count ≡ 0
              </text>
              <text y="24" className="sn2-node-badge" textAnchor="middle">
                {state00Count} bits
              </text>
            </g>

            {/* State Node 1: State 01 */}
            <g className="sn2-node-group" transform="translate(315, 95)">
              <circle
                r="40"
                className={`sn2-node-circle ${state01Count > 0 ? "sn2-node-circle--has-bits" : ""}`}
              />
              <text y="-8" className="sn2-node-title" textAnchor="middle">
                01
              </text>
              <text y="10" className="sn2-node-sub" textAnchor="middle">
                Count ≡ 1
              </text>
              <text y="24" className="sn2-node-badge" textAnchor="middle">
                {state01Count} bits
              </text>
            </g>

            {/* State Node 2: State 10 */}
            <g className="sn2-node-group" transform="translate(485, 95)">
              <circle
                r="36"
                className={`sn2-node-circle ${state10Count > 0 ? "sn2-node-circle--has-bits" : ""}`}
              />
              <text y="-8" className="sn2-node-title" textAnchor="middle">
                10
              </text>
              <text y="10" className="sn2-node-sub" textAnchor="middle">
                Count ≡ 2
              </text>
              <text y="24" className="sn2-node-badge" textAnchor="middle">
                {state10Count} bits
              </text>
            </g>
          </svg>
        </div>
      </section>

      {/* Bit Register Matrix */}
      <section className="sn2-matrix-section" role="region" aria-label="Bit register matrix">
        <div className="sn2-section-title">Bit Register Snapshot (Width: {bitWidth} bits)</div>
        <div className="sn2-matrix-table-wrapper">
          <table className="sn2-matrix-table" aria-label="Bit registers across bit positions">
            <thead>
              <tr>
                <th scope="col" className="sn2-matrix-label-col">Register</th>
                {bitStates.map((b) => (
                  <th key={b.bitIndex} scope="col" className="sn2-matrix-bit-head">
                    {b.bitLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Incoming Number row */}
              {step.currentNum !== null && (
                <tr className="sn2-matrix-row--num">
                  <th scope="row" className="sn2-matrix-label-col">
                    num ({step.currentNum})
                  </th>
                  {bitStates.map((b) => {
                    const inBit = (step.currentNum >>> b.bitIndex) & 1;
                    return (
                      <td
                        key={b.bitIndex}
                        className={`sn2-matrix-cell ${inBit === 1 ? "sn2-matrix-cell--active-num" : ""}`}
                      >
                        {inBit}
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* ones row */}
              <tr className="sn2-matrix-row--ones">
                <th scope="row" className="sn2-matrix-label-col">
                  ones ({step.ones})
                </th>
                {bitStates.map((b) => (
                  <td
                    key={b.bitIndex}
                    className={`sn2-matrix-cell ${b.onesBit === 1 ? "sn2-matrix-cell--ones-1" : ""}`}
                  >
                    {b.onesBit}
                  </td>
                ))}
              </tr>

              {/* twos row */}
              <tr className="sn2-matrix-row--twos">
                <th scope="row" className="sn2-matrix-label-col">
                  twos ({step.twos})
                </th>
                {bitStates.map((b) => (
                  <td
                    key={b.bitIndex}
                    className={`sn2-matrix-cell ${b.twosBit === 1 ? "sn2-matrix-cell--twos-1" : ""}`}
                  >
                    {b.twosBit}
                  </td>
                ))}
              </tr>

              {/* FSM state & count row */}
              <tr className="sn2-matrix-row--state">
                <th scope="row" className="sn2-matrix-label-col">State (Count mod 3)</th>
                {bitStates.map((b) => (
                  <td key={b.bitIndex} className="sn2-matrix-cell sn2-matrix-cell--state">
                    <span className={`sn2-state-tag sn2-state-tag--${b.state}`}>
                      {b.state} ({b.count})
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bit Transitions Table for Active Element */}
      {bitTransitions && bitTransitions.length > 0 && (
        <section className="sn2-transitions-section" role="region" aria-label="Bit transitions table">
          <div className="sn2-section-title">
            Bit Transitions for nums[{step.currentIndex}] = {step.currentNum}
          </div>
          <div className="sn2-table-wrapper">
            <table className="sn2-trans-table" aria-label="Bit state transitions table">
              <thead>
                <tr>
                  <th scope="col">Bit</th>
                  <th scope="col">Incoming b</th>
                  <th scope="col">Prev State (t, o)</th>
                  <th scope="col">Next State (t, o)</th>
                  <th scope="col">Count mod 3</th>
                  <th scope="col">Transition Note</th>
                </tr>
              </thead>
              <tbody>
                {bitTransitions.map((t) => (
                  <tr
                    key={t.bitIndex}
                    className={`sn2-trans-row ${t.changed ? "sn2-trans-row--changed" : "sn2-trans-row--unchanged"}`}
                  >
                    <td className="sn2-trans-cell--bit">{t.bitLabel}</td>
                    <td className="sn2-trans-cell--in">
                      <span className={`sn2-bit-chip ${t.incomingBit === 1 ? "sn2-bit-chip--one" : ""}`}>
                        {t.incomingBit}
                      </span>
                    </td>
                    <td className="sn2-trans-cell--state">
                      <code>{t.prevState}</code> (Count {t.prevCount})
                    </td>
                    <td className="sn2-trans-cell--state">
                      <code>{t.nextState}</code> (Count {t.nextCount})
                    </td>
                    <td className="sn2-trans-cell--count">
                      {t.changed ? (
                        <span className="sn2-count-trans">
                          {t.prevCount} → {t.nextCount}
                        </span>
                      ) : (
                        <span className="sn2-count-same">{t.nextCount}</span>
                      )}
                    </td>
                    <td className="sn2-trans-cell--note">{t.transitionNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Algorithmic Invariant & Cheat Sheet */}
      <section className="sn2-notes-section" role="region" aria-label="Algorithmic rules and invariants">
        <div className="sn2-section-title">Modulo 3 FSM Transition Logic</div>
        <div className="sn2-notes-grid">
          <div className="sn2-note-card">
            <div className="sn2-note-card__title">Line 4: ones = (ones ^ num) &amp; ~twos</div>
            <div className="sn2-note-card__body">
              XOR toggles the bit. Masking with <code>~twos</code> guarantees that if a bit was already recorded in
              <code>twos</code> (count = 2), it is barred from entering <code>ones</code>.
            </div>
          </div>
          <div className="sn2-note-card">
            <div className="sn2-note-card__title">Line 5: twos = (twos ^ num) &amp; ~ones</div>
            <div className="sn2-note-card__body">
              XOR toggles the bit. Masking with <code>~ones</code> uses the freshly updated <code>ones</code>,
              ensuring a bit advancing from count 0 to 1 does not also enter <code>twos</code>.
            </div>
          </div>
          <div className="sn2-note-card">
            <div className="sn2-note-card__title">Mathematical Guarantee</div>
            <div className="sn2-note-card__body">
              Because <code>twos</code> is masked by <code>~ones</code>, <code>ones &amp; twos == 0</code> is guaranteed
              at every step. State <code>11</code> is impossible.
            </div>
          </div>
        </div>
      </section>
    </StoryPanel>
  );
}
