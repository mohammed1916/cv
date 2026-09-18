import StoryPanel from "../../components/shared/StoryPanel";
import "./PartitionStory.css";

export default function PartitionStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Palindrome Partitioning"
        description="Press Play to begin exploring palindrome partitions."
        label="Palindrome Partitioning visualizer story"
      >
        <p className="partition-story__explanation">
          Given a string s, partition s such that every substring of the
          partition is a palindrome. Backtrack through all candidate substring
          cuts, validate palindromes, and collect all complete partitions.
        </p>
      </StoryPanel>
    );
  }

  const { s } = story;
  const {
    phase,
    start,
    end,
    candidate,
    isPalindrome,
    path = [],
    partitions = [],
    depth = 0,
    cuts = [],
    activeCut = null,
    candidateCount = 0,
    explanation,
    message,
  } = step;

  const getStoryTitle = () => {
    switch (phase) {
      case "init":
        return "Backtracking Initialization";
      case "inspect":
        return `Candidate Substring: s[${start}:${end}] = "${candidate}"`;
      case "validate":
        return isPalindrome
          ? `Palindrome Verified: "${candidate}" ✓`
          : `Not a Palindrome: "${candidate}" ✗`;
      case "branch":
        return `Branching: Add "${candidate}" & Recurse on Suffix`;
      case "complete":
        return `Complete Partition Discovered! (#${partitions.length})`;
      case "backtrack":
        return `Backtrack: Pop "${candidate || "last"}" and Explore Next Cut`;
      case "done":
        return `Search Complete: Found ${partitions.length} Valid Partition(s)`;
      default:
        return "Palindrome Partitioning Trace";
    }
  };

  const reversedCandidate = candidate
    ? candidate.split("").reverse().join("")
    : "";
  const remainingSuffix =
    start !== null && start !== undefined ? s.slice(start) : "";

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={message}
      label="Palindrome Partitioning visualizer story"
      className="partition-story"
    >
      <p className="partition-story__explanation">{explanation}</p>

      {/* Quick Metrics Bar */}
      <section
        className="partition-story__metrics"
        aria-label="Exploration metrics"
      >
        <div className="metric-chip">
          <span className="metric-label">String Length</span>
          <span className="partition-story__metric-value">
            |s| = {s.length}
          </span>
        </div>
        <div className="metric-chip">
          <span className="metric-label">Depth</span>
          <span className="partition-story__metric-value">Level {depth}</span>
        </div>
        <div className="metric-chip">
          <span className="metric-label">Candidates Tested</span>
          <span className="partition-story__metric-value">
            {candidateCount}
          </span>
        </div>
        <div className="metric-chip highlight">
          <span className="metric-label">Solutions</span>
          <span className="partition-story__metric-value">
            {partitions.length}
          </span>
        </div>
        <div className={`phase-badge phase-${phase}`} role="status">
          {phase.toUpperCase()}
        </div>
      </section>

      {/* String Partition Cuts Board */}
      <section
        className="partition-story__cuts-section"
        aria-label="String cuts board"
      >
        <header className="section-header">
          <h4>String &amp; Cut Placements</h4>
          <span className="section-hint">
            Committed cuts divide string into verified palindrome pieces
          </span>
        </header>

        <div className="cuts-board">
          {s.split("").map((ch, idx) => {
            const isCommitted = start !== null && idx < start;
            const isCandidate =
              start !== null && end !== null && idx >= start && idx < end;
            const isFuture = start !== null && idx >= (end ?? start);

            let charStatusClass = "status-unexplored";
            if (isCommitted) {
              charStatusClass = "status-committed";
            } else if (isCandidate) {
              if (phase === "validate" || phase === "branch") {
                charStatusClass = isPalindrome
                  ? "status-valid"
                  : "status-invalid";
              } else {
                charStatusClass = "status-candidate";
              }
            } else if (isFuture) {
              charStatusClass = "status-future";
            }

            const isCutHere = cuts.includes(idx + 1);
            const isCandidateCutHere = activeCut === idx + 1;

            return (
              <div key={`ch-wrap-${idx}`} className="char-slot">
                <div className={`char-box ${charStatusClass}`}>
                  <span className="char-index">{idx}</span>
                  <span className="char-value">{ch}</span>
                </div>

                {/* Cut slot between characters or at end */}
                {idx < s.length - 1 && (
                  <div
                    className={`cut-divider ${
                      isCutHere
                        ? "is-committed-cut"
                        : isCandidateCutHere
                          ? "is-candidate-cut"
                          : "is-empty-cut"
                    }`}
                    title={`Cut position ${idx + 1}`}
                  >
                    <span className="cut-marker">
                      {isCutHere ? "✂" : isCandidateCutHere ? "⋮" : ""}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pointer legend */}
        <div className="cuts-legend">
          <div className="cuts-legend__item">
            <span className="legend-dot dot-committed" />
            <span>Committed Prefix</span>
          </div>
          <div className="cuts-legend__item">
            <span className="legend-dot dot-candidate" />
            <span>
              Candidate s[{start ?? 0}:{end ?? start ?? 0}]
            </span>
          </div>
          <div className="cuts-legend__item">
            <span className="legend-dot dot-unexplored" />
            <span>Remaining Suffix</span>
          </div>
          <div className="cuts-legend__item">
            <span className="legend-scissor">✂</span>
            <span>Committed Cut</span>
          </div>
        </div>
      </section>

      {/* Candidate Substring Inspection Hero Card */}
      {candidate && (
        <section
          className={`partition-story__inspection-card ${
            isPalindrome === true
              ? "is-match"
              : isPalindrome === false
                ? "is-mismatch"
                : "is-checking"
          }`}
          aria-label="Candidate substring inspection"
        >
          <header className="inspection-header">
            <span className="inspection-title">
              Candidate Substring:{" "}
              <code>
                s[{start}:{end}]
              </code>
            </span>
            <span
              className={`verdict-badge ${
                isPalindrome === true
                  ? "badge-success"
                  : isPalindrome === false
                    ? "badge-error"
                    : "badge-info"
              }`}
            >
              {isPalindrome === true
                ? "PALINDROME ✓"
                : isPalindrome === false
                  ? "NOT PALINDROME ✗"
                  : "INSPECTING..."}
            </span>
          </header>

          <div className="inspection-body">
            <div className="sub-compare-col">
              <span className="sub-label">Forward</span>
              <div className="sub-letters">
                {candidate.split("").map((c, i) => (
                  <span key={`fwd-${i}`} className="sub-letter">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="sub-operator">
              <span className="operator-symbol">
                {isPalindrome === true
                  ? "=="
                  : isPalindrome === false
                    ? "≠"
                    : "≟"}
              </span>
            </div>

            <div className="sub-compare-col">
              <span className="sub-label">Reversed</span>
              <div className="sub-letters reversed">
                {reversedCandidate.split("").map((c, i) => (
                  <span key={`rev-${i}`} className="sub-letter">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <footer className="inspection-footer">
            {isPalindrome === true && (
              <span className="footer-note success">
                Valid prefix. Recurse on remaining suffix: &quot;{s.slice(end)}
                &quot;.
              </span>
            )}
            {isPalindrome === false && (
              <span className="footer-note error">
                Symmetry test failed (&quot;{candidate}&quot; != &quot;
                {reversedCandidate}&quot;). Cut pruned.
              </span>
            )}
            {isPalindrome === null && (
              <span className="footer-note info">
                Evaluating substring symmetry between start index {start} and
                end index {end}.
              </span>
            )}
          </footer>
        </section>
      )}

      {/* Current Backtracking Path */}
      <section
        className="partition-story__path-section"
        aria-label="Current partition path"
      >
        <header className="section-header">
          <h4>Current Partition Path</h4>
          <span className="section-hint">
            Remaining suffix:{" "}
            <code>&quot;{remainingSuffix || "∅ (none)"}&quot;</code>
          </span>
        </header>

        <div className="path-chips-row">
          {path.length === 0 ? (
            <span className="empty-path-text">
              Path is empty (at search root, start index {start ?? 0}).
            </span>
          ) : (
            path.map((piece, idx) => (
              <div key={`path-piece-${idx}`} className="path-piece-group">
                <span className="path-piece">
                  <span className="piece-index">#{idx + 1}</span>
                  <span className="piece-text">&quot;{piece}&quot;</span>
                </span>
                {idx < path.length - 1 && <span className="path-arrow">➔</span>}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Completed Solutions Gallery */}
      <section
        className="partition-story__solutions-section"
        aria-label="Completed palindrome partitions"
      >
        <header className="section-header">
          <h4>Valid Palindrome Partitions ({partitions.length})</h4>
          <span className="section-hint">
            All collected partitions where every substring is a palindrome
          </span>
        </header>

        {partitions.length === 0 ? (
          <div className="no-solutions-card">
            <span className="no-solutions-icon">⏳</span>
            <span>
              No full partitions discovered yet. Backtracking is actively
              searching...
            </span>
          </div>
        ) : (
          <div className="solutions-list" role="list">
            {partitions.map((part, pIdx) => {
              const isLatest =
                phase === "complete" && pIdx === partitions.length - 1;
              return (
                <div
                  key={`partition-${pIdx}`}
                  className={`solution-item ${isLatest ? "is-new-solution" : ""}`}
                  role="listitem"
                >
                  <div className="solution-id">
                    <span>Solution #{pIdx + 1}</span>
                    {isLatest && <span className="new-badge">NEW!</span>}
                  </div>
                  <div className="solution-parts">
                    {part.map((segment, sIdx) => (
                      <span
                        key={`seg-${pIdx}-${sIdx}`}
                        className="solution-segment"
                      >
                        &quot;{segment}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </StoryPanel>
  );
}
