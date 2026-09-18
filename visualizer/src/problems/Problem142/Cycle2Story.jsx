import LinkedListGraph from "../../components/shared/LinkedListGraph";
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

      <LinkedListGraph
        nodes={nodes.map((node, index) => ({ id: index, val: node.val }))}
        cycleStart={cyclePos}
        label="Cycle detection and entrance search"
        highlightedIds={[meetingPoint, cycleEntrance].filter(id => id != null)}
        pointers={isPhase1 ? [
          { label: 'slow', nodeId: slow }, { label: 'fast', nodeId: fast },
        ] : isPhase2 ? [
          { label: 'ptr1 (head)', nodeId: ptr1 }, { label: 'ptr2 (meeting)', nodeId: ptr2 },
        ] : []}
      />

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
