import { useState } from "react";
import StoryPanel from "../../components/shared/StoryPanel";
import PointerRail from "../../components/shared/PointerRail";
import CharacterComparison from "../../components/shared/CharacterComparison";
import "./PalindromeStory.css";

export default function PalindromeStory({ story, step }) {
  const [showMapping, setShowMapping] = useState(false);

  if (!story || !step) {
    return (
      <StoryPanel
        title="Valid Palindrome"
        description="Press Play to begin tracing."
      >
        <p>
          Convert uppercase letters to lowercase, strip non-alphanumeric
          characters, and use two pointers from opposite ends to check if the
          string reads symmetrically.
        </p>
      </StoryPanel>
    );
  }

  const { raw, cleaned } = story;
  const { l, r, comparing, matchedIndices = [], result } = step;

  const getStoryTitle = () => {
    if (step.phase === "init" && l === null) {
      return "Step 1: Filter & Lowercase String";
    }
    if (step.phase === "init") {
      return "Step 2: Initialize Pointers (L=0, R=len-1)";
    }
    if (step.phase === "compare") {
      if (comparing?.match) {
        return `Comparing s[${l}] ('${comparing.leftChar}') and s[${r}] ('${comparing.rightChar}') — Match`;
      }
      return `Comparing s[${l}] ('${comparing?.leftChar}') and s[${r}] ('${comparing?.rightChar}') — Mismatch`;
    }
    if (step.phase === "update") {
      return `Advancing Pointers: l → ${l}, r → ${r}`;
    }
    if (step.phase === "done") {
      return result
        ? "Palindrome Verified! Result: True"
        : "Mismatch Detected! Result: False";
    }
    return "Valid Palindrome Trace";
  };

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={step.message}
      label="Valid Palindrome visualizer story"
      className="palindrome-story"
    >
      <p className="palindrome-story__explanation">{step.explanation}</p>

      {/* Comparison Hero Card during compare or mismatch */}
      {comparing && (
        <CharacterComparison
          leftIndexLabel={`s[${comparing.l}]`}
          leftChar={comparing.leftChar}
          leftTag="Left Pointer"
          rightIndexLabel={`s[${comparing.r}]`}
          rightChar={comparing.rightChar}
          rightTag="Right Pointer"
          isMatch={comparing.match}
          ariaLabel="Current character comparison"
        />
      )}

      {/* Result Badge */}
      {result !== null && (
        <section
          className={`palindrome-story__result-badge ${
            result ? "is-valid" : "is-invalid"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="result-badge__icon">{result ? "✓" : "✗"}</div>
          <div className="result-badge__info">
            <strong className="result-badge__title">
              {result ? "isPalindrome(s) = True" : "isPalindrome(s) = False"}
            </strong>
            <p className="result-badge__desc">
              {result
                ? `Cleaned string "${cleaned}" is symmetric forward and backward.`
                : `Mismatch found between left s[${comparing?.l}] ('${comparing?.leftChar}') and right s[${comparing?.r}] ('${comparing?.rightChar}').`}
            </p>
          </div>
        </section>
      )}

      {/* Cleaned String with PointerRail */}
      <section className="palindrome-story__rail-container">
        <PointerRail
          title="Cleaned Character Sequence"
          values={cleaned.length > 0 ? cleaned.split("") : ["(empty)"]}
          range={l != null && r != null && l <= r ? { start: l, end: r } : null}
          pointers={[
            ...(l != null && l >= 0 && l < cleaned.length
              ? [{ id: "L", label: `L (${l})`, index: l, tone: "info" }]
              : []),
            ...(r != null && r >= 0 && r < cleaned.length
              ? [{ id: "R", label: `R (${r})`, index: r, tone: "warning" }]
              : []),
          ]}
          note={
            result === false
              ? `Mismatch at s[${comparing?.l}] and s[${comparing?.r}]. Loop halts.`
              : result === true
                ? "All character pairs matched; pointers crossed."
                : comparing?.match
                  ? "Characters match. Move both pointers inward."
                  : "Compare character at L with character at R."
          }
        />
      </section>

      {/* Character Grid with Status Highlights */}
      {cleaned.length > 0 && (
        <section
          className="palindrome-story__cells-section"
          aria-label="Cleaned character cells"
        >
          <div className="palindrome-story__cells-header">
            <strong>Character Cells & Status Highlights</strong>
            <div className="palindrome-story__cells-legend">
              <span className="palindrome-story__legend-item palindrome-story__legend-matched">
                <span className="palindrome-story__legend-dot" /> Matched
              </span>
              <span className="palindrome-story__legend-item palindrome-story__legend-comparing">
                <span className="palindrome-story__legend-dot" /> Comparing
              </span>
              <span className="palindrome-story__legend-item palindrome-story__legend-mismatch">
                <span className="palindrome-story__legend-dot" /> Mismatch
              </span>
            </div>
          </div>

          <div className="palindrome-story__cells-track">
            {cleaned.split("").map((ch, idx) => {
              const isL = l === idx;
              const isR = r === idx;
              const isComparingL = comparing && comparing.l === idx;
              const isComparingR = comparing && comparing.r === idx;
              const isComparing = isComparingL || isComparingR;
              const isMatch = isComparing && comparing.match;
              const isMismatch = isComparing && !comparing.match;
              const isPreviouslyMatched = matchedIndices.includes(idx);
              const isOutside =
                l != null && r != null && l <= r && (idx < l || idx > r);

              let statusClass = "";
              if (isMismatch) statusClass = "cell-mismatch";
              else if (isMatch) statusClass = "cell-match";
              else if (isComparing) statusClass = "cell-comparing";
              else if (isPreviouslyMatched) statusClass = "cell-matched";
              else if (isOutside) statusClass = "cell-outside";

              return (
                <div
                  key={idx}
                  className={`palindrome-story__cell ${statusClass}`}
                  data-index={idx}
                >
                  <div className="cell-badges">
                    {isL && <span className="cell-badge badge-l">L</span>}
                    {isR && <span className="cell-badge badge-r">R</span>}
                  </div>
                  <span className="cell-char">{ch}</span>
                  <span className="cell-idx">{idx}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 1: Raw-to-Clean Position Mapping Inspector */}
      <section className="palindrome-story__mapping-section">
        <header className="mapping-section__head">
          <div>
            <strong>Step 1 Normalization: Raw → Clean Mapping</strong>
            <span className="mapping-subtext">
              ({story.mapping.length} alphanumeric kept of {raw.length} raw
              characters)
            </span>
          </div>
          <button
            type="button"
            className="mapping-toggle-btn"
            onClick={() => setShowMapping((prev) => !prev)}
            aria-expanded={showMapping}
          >
            {showMapping ? "Hide Mapping Table" : "Show Full Mapping Table"}
          </button>
        </header>

        {/* Compact raw preview */}
        <div
          className="palindrome-story__raw-preview"
          tabIndex={0}
          role="region"
          aria-label="Raw character filter preview"
        >
          {story.rawChars.map((rc) => (
            <span
              key={rc.index}
              className={`raw-char-chip ${
                rc.isKept ? "is-kept" : "is-filtered"
              }`}
              title={
                rc.isKept
                  ? `raw[${rc.index}] = '${rc.char}' → clean[${rc.cleanIndex}]`
                  : `raw[${rc.index}] = '${rc.char}' (filtered out)`
              }
            >
              <span className="rc-char">{rc.char === " " ? "␣" : rc.char}</span>
              <span className="rc-clean-idx">
                {rc.isKept ? rc.cleanIndex : "✕"}
              </span>
            </span>
          ))}
        </div>

        {/* Detailed Mapping Table */}
        {showMapping && (
          <div className="palindrome-story__mapping-table-wrapper">
            <table className="palindrome-story__mapping-table">
              <thead>
                <tr>
                  <th>Clean Index</th>
                  <th>Clean Char</th>
                  <th>Raw Index</th>
                  <th>Raw Char</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {story.rawChars.map((rc) => (
                  <tr
                    key={rc.index}
                    className={rc.isKept ? "tr-kept" : "tr-filtered"}
                  >
                    <td>{rc.isKept ? rc.cleanIndex : "—"}</td>
                    <td>
                      {rc.isKept ? (
                        <code>{story.mapping[rc.cleanIndex]?.cleanChar}</code>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{rc.index}</td>
                    <td>
                      <code>{rc.char === " " ? "<space>" : rc.char}</code>
                    </td>
                    <td>
                      {rc.isKept ? (
                        <span className="tag-kept">Kept (Lowercased)</span>
                      ) : (
                        <span className="tag-skipped">
                          Filtered (Non-alnum)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </StoryPanel>
  );
}
