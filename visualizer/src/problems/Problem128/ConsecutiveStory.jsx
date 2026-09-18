import StoryPanel from "../../components/shared/StoryPanel";
import "./ConsecutiveStory.css";

export default function ConsecutiveStory({ story, step }) {
  const sortedSet = story?.uniqueSet
    ? [...story.uniqueSet].sort((a, b) => a - b)
    : [];

  if (!story || !step) {
    return (
      <StoryPanel
        title="Longest Consecutive Sequence"
        description="Press Play to begin tracing."
        label="Longest Consecutive Sequence story"
      >
        <p>
          Find the length of the longest consecutive elements sequence in an
          unsorted array in O(n) time using a hash set.
        </p>
      </StoryPanel>
    );
  }

  const {
    phase,
    num,
    curr,
    streak = 0,
    longest = 0,
    hasLeftNeighbor,
    leftNeighbor,
    nextMissing,
    isNewLongest,
    currentSequence = [],
    bestSequence = [],
    visitedStarts = [],
    skippedNums = [],
    message,
    explanation,
  } = step;

  const getStoryTitle = () => {
    if (phase === "init") {
      return "Step 1: Build Hash Set & Initialize Longest";
    }
    if (phase === "scan") {
      if (hasLeftNeighbor) {
        return `Inspecting ${num}: Left neighbor (${leftNeighbor}) in set → Skip`;
      }
      return `Inspecting ${num}: Left neighbor (${leftNeighbor}) NOT in set → Sequence Start!`;
    }
    if (phase === "chain") {
      return `Start Chain from ${curr} (Streak = 1)`;
    }
    if (phase === "expand") {
      return `Chain Expanding: Found ${curr} in Set (Streak = ${streak})`;
    }
    if (phase === "update") {
      if (isNewLongest) {
        return `New Longest Sequence Record: Length ${longest}!`;
      }
      return `Chain Ended (Streak = ${streak}) — Longest Remains ${longest}`;
    }
    if (phase === "done") {
      return `Search Complete — Longest Consecutive Sequence: ${story.longestStreak}`;
    }
    return "Longest Consecutive Sequence";
  };

  const isDone = phase === "done";

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={message}
      label="Longest Consecutive Sequence visual story"
      className="consecutive-story"
    >
      <p className="consecutive-story__explanation">{explanation}</p>

      {/* Metrics Row */}
      <div
        className="consecutive-story__metrics"
        role="region"
        aria-label="Algorithm state metrics"
      >
        <div className="consecutive-story__metric-card">
          <span className="metric-label">Set Elements</span>
          <span className="consecutive-story__metric-val">
            {story.uniqueSet.length}
          </span>
          <span className="metric-sub">{story.nums.length} input values</span>
        </div>

        <div className="consecutive-story__metric-card">
          <span className="metric-label">Inspected Element</span>
          <span className="consecutive-story__metric-val">
            {num != null ? num : "—"}
          </span>
          <span
            className={`metric-sub ${
              hasLeftNeighbor === true
                ? "sub-skip"
                : hasLeftNeighbor === false
                  ? "sub-start"
                  : ""
            }`}
          >
            {hasLeftNeighbor === true
              ? `${leftNeighbor} in set (Skip)`
              : hasLeftNeighbor === false
                ? `${leftNeighbor} not in set (Start!)`
                : "Awaiting scan"}
          </span>
        </div>

        <div className="consecutive-story__metric-card">
          <span className="metric-label">Current Streak</span>
          <span
            className={`consecutive-story__metric-val ${streak > 0 ? "val-streak" : ""}`}
          >
            {streak}
          </span>
          <span className="metric-sub">
            {currentSequence.length > 0
              ? `[${currentSequence[0]}..${curr}]`
              : "Inactive"}
          </span>
        </div>

        <div
          className={`consecutive-story__metric-card ${
            longest > 0 ? "metric-card--record" : ""
          }`}
        >
          <span className="metric-label">Record Longest</span>
          <span className="consecutive-story__metric-val val-record">
            {longest}
          </span>
          <span className="metric-sub">
            {bestSequence.length > 0
              ? `Best: [${bestSequence[0]}..${bestSequence[bestSequence.length - 1]}]`
              : "Initial floor (0)"}
          </span>
        </div>
      </div>

      {/* Left-Neighbor Start Inspector Card */}
      {num != null && (
        <section
          className={`consecutive-story__inspector ${
            hasLeftNeighbor ? "is-skip" : "is-start"
          }`}
          aria-label="Start candidate test"
        >
          <div className="inspector-header">
            <span className="inspector-badge">
              {hasLeftNeighbor
                ? "PREDECESSOR FOUND — SKIP"
                : "NO PREDECESSOR — SEQUENCE START"}
            </span>
            <span className="inspector-hint">
              {hasLeftNeighbor
                ? `num - 1 (${leftNeighbor}) is in the set. Traversing here would duplicate work.`
                : `num - 1 (${leftNeighbor}) is missing. ${num} is guaranteed to be a sequence head!`}
            </span>
          </div>
          <div className="inspector-diagram">
            <div
              className={`diagram-cell ${
                hasLeftNeighbor ? "cell-in-set" : "cell-missing"
              }`}
            >
              <span className="cell-role">Left Neighbor (num - 1)</span>
              <span className="cell-num">{leftNeighbor}</span>
              <span className="cell-status">
                {hasLeftNeighbor ? "In Set ✓" : "Missing ✗"}
              </span>
            </div>

            <div className="diagram-connector">
              <span className="diagram-arrow">➔</span>
              <span className="diagram-relation">+1</span>
            </div>

            <div
              className={`diagram-cell ${
                hasLeftNeighbor ? "cell-skip-target" : "cell-start-target"
              }`}
            >
              <span className="cell-role">Current Value (num)</span>
              <span className="cell-num">{num}</span>
              <span className="cell-status">
                {hasLeftNeighbor ? "Skip forward" : "Begin chain!"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Active Chain Expansion Rail */}
      {currentSequence.length > 0 && (
        <section
          className="consecutive-story__chain-section"
          aria-label="Active consecutive sequence expansion"
        >
          <div className="chain-header">
            <div className="chain-title-row">
              <span className="chain-title">Active Sequence Chain</span>
              <span className="chain-streak-badge">
                Length: {currentSequence.length}
              </span>
            </div>
            <span className="chain-sub">
              Tracing forward: curr + 1 in num_set
            </span>
          </div>

          <div className="chain-rail" role="list">
            {currentSequence.map((val, idx) => {
              const isTip = val === curr;
              return (
                <div key={val} className="chain-step-group">
                  <div
                    className={`chain-node ${isTip ? "is-tip" : "is-body"}`}
                    role="listitem"
                    aria-label={`Sequence element ${val}, index ${idx + 1}`}
                  >
                    <span className="node-idx">#{idx + 1}</span>
                    <span className="node-val">{val}</span>
                    {isTip && <span className="node-tag">curr</span>}
                  </div>
                  {idx < currentSequence.length - 1 && (
                    <div className="chain-link" aria-hidden="true">
                      <span className="link-arrow">➔</span>
                    </div>
                  )}
                </div>
              );
            })}

            {phase === "update" && nextMissing != null && (
              <div className="chain-step-group chain-step-missing">
                <div className="chain-link" aria-hidden="true">
                  <span className="link-arrow">➔</span>
                </div>
                <div
                  className="chain-node is-missing"
                  role="listitem"
                  aria-label={`Next probe ${nextMissing} not in set`}
                >
                  <span className="node-idx">probe</span>
                  <span className="node-val">{nextMissing}</span>
                  <span className="node-tag">✗ Not in set</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hash Set Elements Grid */}
      <section
        className="consecutive-story__set-section"
        aria-label="Hash set unique values"
      >
        <div className="set-header">
          <div className="set-title-row">
            <span className="set-title">Hash Set Elements</span>
            <span className="set-count-badge">
              {story.uniqueSet.length} Unique Numbers
            </span>
          </div>
          <span className="set-subtitle">
            Values displayed in numerical order to visualize consecutive
            clustering
          </span>
        </div>

        <div className="set-grid" role="list">
          {sortedSet.map((val) => {
            const isCurrent = val === num;
            const isInChain = currentSequence.includes(val);
            const isTip = val === curr && isInChain;
            const isVisitedStart = visitedStarts.includes(val);
            const isSkipped = skippedNums.includes(val);
            const isBest = bestSequence.includes(val);
            const isChampion = isDone && isBest;

            let modifier = "";
            let tag = "";

            if (isChampion) {
              modifier = "set-cell--champion";
              tag = "Best";
            } else if (isTip) {
              modifier = "set-cell--tip";
              tag = "Tip";
            } else if (isInChain) {
              modifier = "set-cell--chain";
              tag = "Chain";
            } else if (isCurrent && hasLeftNeighbor === false) {
              modifier = "set-cell--start";
              tag = "Start";
            } else if (isCurrent && hasLeftNeighbor === true) {
              modifier = "set-cell--skip";
              tag = "Skip";
            } else if (isVisitedStart) {
              modifier = "set-cell--was-start";
              tag = "Start";
            } else if (isSkipped) {
              modifier = "set-cell--was-skipped";
              tag = "Skip";
            } else if (isBest) {
              modifier = "set-cell--best";
              tag = "Best";
            }

            return (
              <div
                key={val}
                className={`set-cell ${modifier} ${
                  isCurrent ? "set-cell--focus" : ""
                }`}
                role="listitem"
                aria-label={`Number ${val}${tag ? `, ${tag}` : ""}`}
              >
                <span className="set-cell-val">{val}</span>
                {tag && <span className="set-cell-badge">{tag}</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Record Longest Sequence Showcase */}
      {bestSequence.length > 0 && (
        <section
          className={`consecutive-story__champion-card ${
            isDone ? "is-final" : ""
          }`}
          aria-label="Longest consecutive sequence champion"
        >
          <div className="champion-header">
            <div className="champion-title">
              <span className="trophy-emoji" aria-hidden="true">
                {isDone ? "🏆" : "⭐"}
              </span>
              <span>
                {isDone
                  ? "Maximal Consecutive Sequence Found"
                  : "Best Sequence So Far"}
              </span>
            </div>
            <span className="champion-streak-pill">Length {longest}</span>
          </div>

          <div className="champion-vals" role="list">
            {bestSequence.map((val, idx) => (
              <span key={val} className="champion-chip-group">
                <span className="champion-chip" role="listitem">
                  {val}
                </span>
                {idx < bestSequence.length - 1 && (
                  <span className="champion-arrow" aria-hidden="true">
                    ➔
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Complexity & Insight Banner */}
      <div className="consecutive-story__insight" role="note">
        <span className="insight-icon" aria-hidden="true">
          💡
        </span>
        <div className="insight-content">
          <strong>Why O(n) Time?</strong> By only expanding sequences where{" "}
          <code>num - 1 not in num_set</code>, each consecutive chain is
          explored once from its true beginning. Every number is inspected as an
          outer candidate once, and visited inside the while-loop at most once.
        </div>
      </div>
    </StoryPanel>
  );
}
