import { useState } from "react";
import StoryPanel from "../../components/shared/StoryPanel";
import "./SingleNumberStory.css";

export default function SingleNumberStory({ story, step }) {
  const [showTable, setShowTable] = useState(true);

  if (!story || !step) {
    return (
      <StoryPanel
        title="Single Number"
        description="Press Play or Step Forward to start the XOR trace."
        label="Single number story"
      >
        <p className="sn-story__intro">
          Find the element that appears only once in an array where every other element appears exactly twice.
        </p>
      </StoryPanel>
    );
  }

  const { nums, singleVal, bitWidth, tableRows, bitColumns } = story;
  const {
    phase,
    currentIndex,
    currentNum,
    prevResult,
    result,
    prevResultBin,
    currentNumBin,
    resultBin,
    bitOperations = [],
    cancelledIndices = [],
    activePair,
  } = step;

  const getStoryTitle = () => {
    if (phase === "init") {
      return "Step 0: Initialize XOR Accumulator (result = 0)";
    }
    if (phase === "loop") {
      return `Step ${currentIndex + 1}: Inspect Element nums[${currentIndex}] = ${currentNum}`;
    }
    if (phase === "xor") {
      if (activePair) {
        return `Step ${currentIndex + 1}: Self-Cancellation (${prevResult} ^ ${currentNum} = ${result}) — Pair Cancelled!`;
      }
      return `Step ${currentIndex + 1}: XOR Accumulation (${prevResult} ^ ${currentNum} = ${result})`;
    }
    if (phase === "done") {
      return `Algorithm Complete: Single Number = ${result}`;
    }
    return "Single Number Trace";
  };

  const getAccumulatorBadge = () => {
    if (phase === "done") {
      return { text: `Final Single Number: ${result}`, tone: "success" };
    }
    if (activePair) {
      return { text: `Pair (${activePair.val}, ${activePair.val}) Annihilated!`, tone: "warning" };
    }
    if (result === 0) {
      return { text: "Accumulator is Neutral (0)", tone: "neutral" };
    }
    return { text: `Accumulator = ${result}`, tone: "info" };
  };

  const badge = getAccumulatorBadge();

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={step.message}
      label="Single number visualizer story"
      className="sn-story"
    >
      <p className="sn-story__explanation">{step.explanation}</p>

      {/* Hero Accumulator & Active Pair Alert */}
      <section className="sn-story__hero" aria-label="XOR Accumulator State">
        <div className="sn-hero__card">
          <div className="sn-hero__header">
            <span className="sn-hero__label">Cumulative Accumulator (result)</span>
            <span className={`sn-hero__badge sn-badge--${badge.tone}`}>
              {badge.text}
            </span>
          </div>

          <div className="sn-hero__values">
            <div className="sn-hero__decimal">
              <span className="sn-hero__num">{result}</span>
              <span className="sn-hero__sub">decimal</span>
            </div>

            <div className="sn-hero__divider">/</div>

            <div className="sn-hero__binary-block">
              <div className="sn-hero__binary-bits" aria-label={`Binary value: ${resultBin}`}>
                {resultBin.split("").map((bit, idx) => {
                  const power = bitWidth - 1 - idx;
                  const isOne = bit === "1";
                  return (
                    <div
                      key={idx}
                      className={`sn-bit-box ${isOne ? "is-one" : "is-zero"}`}
                      title={`Bit ${power} (weight ${1 << power}): ${bit}`}
                    >
                      <span className="sn-bit-box__val">{bit}</span>
                      <span className="sn-bit-box__weight">2^{power}</span>
                    </div>
                  );
                })}
              </div>
              <span className="sn-hero__sub">
                {bitWidth}-bit two&apos;s complement binary
              </span>
            </div>
          </div>
        </div>

        {activePair && (
          <div className="sn-story__collision-banner" role="status" aria-live="polite">
            <span className="sn-collision__icon">⚡</span>
            <div className="sn-collision__text">
              <strong>Pair Collision Detected!</strong>
              <span>
                Value <code>{activePair.val}</code> at index {activePair.secondIndex} cancelled identical value at index {activePair.firstIndex} (<code>{activePair.val} ^ {activePair.val} = 0</code>).
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Bit-level XOR Operation Card (Shown during XOR phase or if operations exist) */}
      {bitOperations.length > 0 && (
        <section className="sn-story__operation" aria-label="Bitwise XOR Operation Breakdown">
          <div className="sn-op__header">
            <h4>Bitwise XOR Breakdown</h4>
            <div className="sn-op__equation">
              <span className="op-term">result ({prevResult} : <code>{prevResultBin}</code>)</span>
              <span className="op-symbol">^</span>
              <span className="op-term">nums[{currentIndex}] ({currentNum} : <code>{currentNumBin}</code>)</span>
              <span className="op-symbol">=</span>
              <span className="op-res">{result} (<code>{resultBin}</code>)</span>
            </div>
          </div>

          <div className="sn-op__columns-grid">
            {bitOperations.map((op) => {
              const { bitIndex, weight, prevBit, numBit, resultBit, action } = op;
              return (
                <div key={bitIndex} className={`sn-op-col sn-op-col--${action}`}>
                  <div className="sn-op-col__title">
                    Bit {bitIndex}
                    <span className="sn-op-col__weight">(2^{bitIndex} = {weight})</span>
                  </div>

                  <div className="sn-op-col__math">
                    <div className="sn-op-row">
                      <span className="sn-op-row__tag">prev</span>
                      <span className={`sn-op-bit ${prevBit === 1 ? "bit-one" : "bit-zero"}`}>
                        {prevBit}
                      </span>
                    </div>
                    <div className="sn-op-row">
                      <span className="sn-op-row__tag">^ num</span>
                      <span className={`sn-op-bit ${numBit === 1 ? "bit-one" : "bit-zero"}`}>
                        {numBit}
                      </span>
                    </div>
                    <div className="sn-op-row sn-op-row--result">
                      <span className="sn-op-row__tag">= new</span>
                      <span className={`sn-op-bit bit-res ${resultBit === 1 ? "bit-one" : "bit-zero"}`}>
                        {resultBit}
                      </span>
                    </div>
                  </div>

                  <div className={`sn-op-col__tag tag-${action}`}>
                    {action === "cancel" && "CANCELLED ⚡"}
                    {action === "set" && "TOGGLED ON ✨"}
                    {action === "keep" && "PRESERVED"}
                    {action === "zero" && "ZERO"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Array Elements Strip */}
      <section className="sn-story__array-strip" aria-label="Array Elements State">
        <div className="sn-strip__header">
          <h4>Input Array Elements & Cancellation Status</h4>
          <span className="sn-strip__stats">
            Cancelled: {cancelledIndices.length} / {nums.length} elements
          </span>
        </div>

        <div className="sn-strip__items">
          {nums.map((val, idx) => {
            const isCurrent = idx === currentIndex;
            const isCancelled = cancelledIndices.includes(idx);
            const isTargetSingle = val === singleVal && (story.tableRows[idx]?.isSingle ?? false);
            const isFinished = phase === "done";
            const rowMeta = story.tableRows[idx];

            let cardState = "pending";
            if (isCurrent) cardState = "active";
            else if (isCancelled) cardState = "cancelled";
            else if (isFinished && isTargetSingle) cardState = "survivor";
            else if (idx < currentIndex) cardState = "holding";

            return (
              <div
                key={idx}
                className={`sn-element-card sn-card--${cardState}`}
                title={`Index ${idx}: value = ${val}`}
              >
                <div className="sn-card__top">
                  <span className="sn-card__idx">[{idx}]</span>
                  {rowMeta?.pairId && (
                    <span className="sn-card__pair-pill">
                      Pair #{rowMeta.pairId}
                    </span>
                  )}
                  {isTargetSingle && isFinished && (
                    <span className="sn-card__single-pill">
                      Single 👑
                    </span>
                  )}
                </div>

                <div className="sn-card__val">{val}</div>

                <div className="sn-card__bin">
                  <code>{rowMeta?.binary || ""}</code>
                </div>

                <div className="sn-card__status">
                  {isCancelled && <span className="status-cancelled">Cancelled ✓</span>}
                  {isCurrent && <span className="status-active">Processing...</span>}
                  {!isCancelled && !isCurrent && isFinished && isTargetSingle && (
                    <span className="status-survivor">Surviving Answer!</span>
                  )}
                  {!isCancelled && !isCurrent && !isFinished && idx < currentIndex && (
                    <span className="status-holding">In Accumulator</span>
                  )}
                  {!isCancelled && !isCurrent && idx > currentIndex && (
                    <span className="status-pending">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Binary Bitwise Representation Table (Parity Proof) */}
      <section className="sn-story__table-section" aria-label="Binary Bitwise Representation Proof">
        <header className="sn-table-section__head">
          <div>
            <h4>Binary Bitwise Cancellation Table</h4>
            <p className="sn-table-section__sub">
              Proof that XOR is sum modulo 2: pairs contribute 2 ones (2 mod 2 = 0), leaving only the single number.
            </p>
          </div>
          <button
            type="button"
            className="sn-table-toggle-btn"
            onClick={() => setShowTable((prev) => !prev)}
            aria-expanded={showTable}
          >
            {showTable ? "Hide Elimination Table" : "Show Elimination Table"}
          </button>
        </header>

        {showTable && (
          <div className="sn-table-wrapper" tabIndex={0} role="region" aria-label="Bitwise table scrollable region">
            <table className="sn-table">
              <thead>
                <tr>
                  <th className="th-item">Index & Value</th>
                  {bitColumns.map((col) => (
                    <th key={col.bitIndex} className="th-bit">
                      <div>Bit {col.bitIndex}</div>
                      <div className="th-weight">{col.weightLabel}</div>
                    </th>
                  ))}
                  <th className="th-role">Role</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => {
                  const isCurrent = row.index === currentIndex;
                  const isCancelled = cancelledIndices.includes(row.index);
                  const isSingle = row.isSingle;

                  let trClass = "";
                  if (isCurrent) trClass = "tr-active";
                  else if (isCancelled) trClass = "tr-cancelled";
                  else if (isSingle && phase === "done") trClass = "tr-single";

                  return (
                    <tr key={row.index} className={trClass}>
                      <td className="td-item">
                        <span className="td-idx">nums[{row.index}]</span>
                        <strong className="td-val">{row.value}</strong>
                      </td>

                      {row.bits.map((bit, bitIdx) => {
                        const col = bitColumns[bitIdx];
                        return (
                          <td
                            key={col.bitIndex}
                            className={`td-bit ${bit === 1 ? "cell-bit-1" : "cell-bit-0"} ${
                              isCancelled ? "cell-dimmed" : ""
                            }`}
                          >
                            <span>{bit}</span>
                          </td>
                        );
                      })}

                      <td className="td-role">
                        {row.pairId ? (
                          <span className={`role-badge role-pair ${isCancelled ? "is-cancelled" : ""}`}>
                            Pair #{row.pairId} {isCancelled ? "(Annihilated)" : ""}
                          </span>
                        ) : (
                          <span className="role-badge role-unique">
                            Unique Single ⭐
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {/* Sum of 1s in each column */}
                <tr className="tfoot-row-sum">
                  <td className="td-item tfoot-label">
                    <strong>Total 1s (Σ)</strong>
                  </td>
                  {bitColumns.map((col) => (
                    <td key={col.bitIndex} className="td-bit tfoot-sum-val">
                      {col.onesCount} {col.onesCount === 1 ? "one" : "ones"}
                    </td>
                  ))}
                  <td className="td-role tfoot-note">Even = pair cancelled</td>
                </tr>

                {/* Parity (mod 2) */}
                <tr className="tfoot-row-parity">
                  <td className="td-item tfoot-label">
                    <strong>Parity (Σ mod 2)</strong>
                  </td>
                  {bitColumns.map((col) => (
                    <td
                      key={col.bitIndex}
                      className={`td-bit tfoot-parity-val ${
                        col.parity === 1 ? "parity-odd" : "parity-even"
                      }`}
                    >
                      <strong>{col.parity}</strong>
                      <span className="parity-badge">
                        {col.parity === 1 ? "Odd (1)" : "Even (0)"}
                      </span>
                    </td>
                  ))}
                  <td className="td-role tfoot-parity-match">
                    <strong>Matches Single: {singleVal}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* XOR Properties Reference */}
      <section className="sn-story__props" aria-label="Key XOR Properties">
        <h4 className="sn-props__title">XOR Properties Reference</h4>
        <div className="sn-props__grid">
          <div className="sn-prop-card">
            <code>x ^ 0 = x</code>
            <span>Identity Element: XOR with 0 keeps any number intact.</span>
          </div>
          <div className="sn-prop-card">
            <code>x ^ x = 0</code>
            <span>Self-Inverse: Any number XORed with itself cancels out completely.</span>
          </div>
          <div className="sn-prop-card">
            <code>x ^ y = y ^ x</code>
            <span>Commutative & Associative: Order of processing does not change the result.</span>
          </div>
          <div className="sn-prop-card">
            <code>O(N) time, O(1) space</code>
            <span>Optimal: Solves the problem in a single pass without extra memory/hashmap.</span>
          </div>
        </div>
      </section>
    </StoryPanel>
  );
}
