import StoryPanel from "../../components/shared/StoryPanel";
import "./WordBreakStory.css";

export default function WordBreakStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Word Break"
        description="Press Play or Step to begin the DP visualization."
        className="wb-story"
      >
        <p className="wb-story__desc">
          Determine if the string can be segmented into a sequence of dictionary words using 1D Dynamic Programming.
        </p>
      </StoryPanel>
    );
  }

  const { s, wordDict } = story;
  const n = s.length;
  const {
    phase,
    activeLine,
    dp,
    i,
    j,
    slice,
    dpJ,
    inDict,
    isMatch,
    updatedIndex,
    matchedWord,
    segments,
    result,
    explanation,
    message,
  } = step;

  const getTitle = () => {
    if (phase === "init") {
      return "Step 1: Base Case Initialization";
    }
    if (phase === "loop" && j === null) {
      return `Prefix Examination: s[0:${i}] ("${s.slice(0, i)}")`;
    }
    if (phase === "loop" && j !== null) {
      return `Split Candidate: Split at j = ${j}`;
    }
    if (phase === "check") {
      if (isMatch) {
        return `Split Valid: dp[${j}] is True and "${slice}" ∈ wordDict`;
      }
      if (!dpJ && inDict) {
        return `Split Invalid: dp[${j}] is False (unreachable prefix)`;
      }
      if (dpJ && !inDict) {
        return `Split Invalid: "${slice}" ∉ wordDict`;
      }
      return `Split Invalid: Both conditions failed`;
    }
    if (phase === "dp") {
      if (activeLine === 8) {
        return `DP Update: dp[${i}] = True`;
      }
      if (activeLine === 9) {
        return `Break Early: dp[${i}] Already Proven True`;
      }
    }
    if (phase === "done") {
      return result
        ? `Result: True ("${s}" can be segmented)`
        : `Result: False ("${s}" cannot be segmented)`;
    }
    return "Word Break Dynamic Programming";
  };

  const isWindowActive = j !== null && i !== null && j < i;

  return (
    <StoryPanel
      title={getTitle()}
      description={message}
      label="Word Break Visual Story"
      className="wb-story"
    >
      <p className="wb-story__explanation">{explanation}</p>

      {/* Telemetry Bar */}
      <section className="wb-story__telemetry" aria-label="Algorithm state telemetry">
        <div className="telemetry-item">
          <span className="telemetry-label">Prefix Index (i)</span>
          <span className="telemetry-val">
            {i !== null ? `${i} (s[0:${i}])` : "—"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Split Pointer (j)</span>
          <span className="telemetry-val">
            {j !== null ? `j = ${j}` : "—"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Candidate Window</span>
          <span className="telemetry-val highlight">
            {slice ? `"${slice}"` : "—"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">dp[j] Valid</span>
          <span className="telemetry-val">
            {dpJ === true ? (
              <span className="badge badge-success">TRUE ✓</span>
            ) : dpJ === false ? (
              <span className="badge badge-error">FALSE ✗</span>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Dict Lookup</span>
          <span className="telemetry-val">
            {inDict === true ? (
              <span className="badge badge-success">FOUND ✓</span>
            ) : inDict === false ? (
              <span className="badge badge-error">NOT IN DICT ✗</span>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">dp[len(s)]</span>
          <span className="telemetry-val">
            {dp[n] ? (
              <span className="badge badge-success">TRUE</span>
            ) : (
              <span className="badge badge-neutral">FALSE</span>
            )}
          </span>
        </div>
      </section>

      {/* Character Strip of String s with Boundary Pointers j and i */}
      <section className="wb-story__strip-card" aria-label="String character strip and boundary pointers">
        <header className="strip-card__header">
          <span className="strip-card__title">String Boundary Pointers & Candidate Window</span>
          {isWindowActive && (
            <span className="strip-card__window-tag">
              Testing window <code>s[{j}:{i}]</code> = <strong>&quot;{slice}&quot;</strong>
            </span>
          )}
        </header>

        {/* Pointer Pin Indicators Header */}
        <div className="wb-story__pointer-track" aria-hidden="true">
          {Array.from({ length: n + 1 }, (_, bIdx) => {
            const isPointerJ = bIdx === j;
            const isPointerI = bIdx === i;
            return (
              <div key={bIdx} className="pointer-slot">
                <div className="pointer-markers">
                  {isPointerJ && (
                    <span className="pointer-pin pointer-j" title={`Split pointer j = ${j}`}>
                      j={j}
                    </span>
                  )}
                  {isPointerI && (
                    <span className="pointer-pin pointer-i" title={`Outer pointer i = ${i}`}>
                      i={i}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Character Strip */}
        <div className="wb-story__char-strip" role="list" aria-label="Characters in string s">
          {s.split("").map((ch, idx) => {
            const inSlice = isWindowActive && idx >= j && idx < i;
            const inPrefix = j !== null && idx < j;
            const isMatchedSlice = inSlice && isMatch;
            const isMismatchSlice = inSlice && phase === "check" && !isMatch;
            const isVerifiedPrefix = dp[idx + 1] === true;

            let charClass = "char-slot";
            if (isMatchedSlice) charClass += " is-matched";
            else if (isMismatchSlice) charClass += " is-mismatch";
            else if (inSlice) charClass += " in-slice";
            else if (inPrefix && dp[j]) charClass += " in-prefix-valid";

            return (
              <div
                key={idx}
                role="listitem"
                className={charClass}
                aria-label={`Index ${idx}: character '${ch}', ${inSlice ? "in current window" : ""}`}
              >
                <span className="char-letter">{ch}</span>
                <span className="char-index">{idx}</span>
                {isVerifiedPrefix && (
                  <span className="char-verified-dot" title={`dp[${idx + 1}] is True`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Window Slice Bracket */}
        {isWindowActive && (
          <div className="wb-story__slice-bracket" aria-label={`Slice candidate: ${slice}`}>
            <span className="bracket-line" />
            <span
              className={`bracket-label ${
                isMatch ? "bracket-matched" : inDict ? "bracket-dict-only" : "bracket-default"
              }`}
            >
              s[{j}:{i}] = &quot;{slice}&quot; ({inDict ? "FOUND in dict" : "NOT in dict"})
            </span>
            <span className="bracket-line" />
          </div>
        )}
      </section>

      {/* Candidate Substring & Dictionary Lookup Card */}
      {j !== null && i !== null && slice && (
        <section
          className={`wb-story__lookup-card ${
            isMatch ? "is-match" : phase === "check" ? "is-mismatch" : ""
          }`}
          aria-label="Substring dictionary lookup check"
        >
          <div className="lookup-card__header">
            <span className="lookup-card__title">Split Position Validation at j = {j}</span>
            <span
              className={`lookup-status-badge ${
                isMatch
                  ? "badge-success"
                  : !dpJ
                  ? "badge-warning"
                  : inDict
                  ? "badge-info"
                  : "badge-error"
              }`}
            >
              {isMatch
                ? "VALID SPLIT ✓"
                : !dpJ
                ? "PREFIX UNREACHABLE"
                : "WORD NOT IN DICT"}
            </span>
          </div>

          <div className="lookup-card__formula">
            {/* Left condition: dp[j] */}
            <div className={`formula-box ${dpJ ? "box-true" : "box-false"}`}>
              <div className="formula-box__sub">Prefix Condition: dp[{j}]</div>
              <div className="formula-box__content">
                <span className="formula-str">
                  s[0:{j}] = &quot;{s.slice(0, j) || "ε"}&quot;
                </span>
                <span className={`formula-status ${dpJ ? "is-valid" : "is-invalid"}`}>
                  dp[{j}] = {dpJ ? "True ✓" : "False ✗"}
                </span>
              </div>
              <span className="formula-box__caption">
                {dpJ ? "Prefix is segmentable" : "Prefix cannot be formed"}
              </span>
            </div>

            <div className="formula-op">and</div>

            {/* Right condition: s[j:i] in words */}
            <div className={`formula-box ${inDict ? "box-true" : "box-false"}`}>
              <div className="formula-box__sub">Dictionary Condition: s[{j}:{i}] ∈ words</div>
              <div className="formula-box__content">
                <span className="formula-str">
                  &quot;{slice}&quot;
                </span>
                <span
                  className={`dictionary-lookup-badge ${
                    inDict ? "lookup-found" : "lookup-missing"
                  }`}
                >
                  {inDict ? "FOUND IN DICT ✓" : "NOT IN DICT ✗"}
                </span>
              </div>
              <span className="formula-box__caption">
                {inDict ? `"${slice}" is in wordDict` : `"${slice}" is missing from dictionary`}
              </span>
            </div>

            <div className="formula-op">=</div>

            {/* Result of the condition */}
            <div className={`formula-box outcome-box ${isMatch ? "box-match" : "box-nomatch"}`}>
              <div className="formula-box__sub">Condition Result</div>
              <div className="formula-box__content">
                <span className="outcome-result">
                  {isMatch ? "dp[i] = True!" : "Continue Search"}
                </span>
              </div>
              <span className="formula-box__caption">
                {isMatch
                  ? `Segmented: s[0:${j}] + "${slice}"`
                  : "Try next split position j"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 1D DP Boolean Table */}
      <section className="wb-story__dp-card" aria-label="1D DP boolean table">
        <header className="dp-card__header">
          <div className="dp-card__title-wrap">
            <span className="dp-card__title">1D DP Boolean Array: <code>dp[0..{n}]</code></span>
            <span className="dp-card__hint">
              <code>dp[k] = True</code> means prefix <code>s[0:k]</code> can be segmented
            </span>
          </div>
        </header>

        <div className="wb-story__dp-grid" role="table" aria-label="DP Table">
          {dp.map((val, idx) => {
            const isTarget = idx === i;
            const isSplitPoint = idx === j;
            const isFinalAnswer = phase === "done" && idx === n;
            const isJustUpdated = idx === updatedIndex && phase === "dp";
            const prefixStr = s.slice(0, idx);

            let cellClass = "dp-slot";
            if (val) cellClass += " is-true";
            else cellClass += " is-false";
            if (isTarget) cellClass += " is-target";
            if (isSplitPoint) cellClass += " is-split";
            if (isJustUpdated) cellClass += " is-updated";
            if (isFinalAnswer) cellClass += " is-answer";

            return (
              <div key={idx} className={cellClass} role="cell">
                <div className="dp-slot__tags">
                  {idx === 0 && <span className="slot-tag tag-base">base</span>}
                  {isSplitPoint && <span className="slot-tag tag-j">j</span>}
                  {isTarget && <span className="slot-tag tag-i">i</span>}
                  {isFinalAnswer && <span className="slot-tag tag-ans">ans</span>}
                </div>

                <div className="dp-slot__val" title={`dp[${idx}] = ${val}`}>
                  {val ? "T" : "F"}
                </div>

                <div className="dp-slot__idx">
                  [{idx}]
                </div>

                <div className="dp-slot__prefix" title={`s[0:${idx}] = "${prefixStr || "ε"}"`}>
                  &quot;{prefixStr || "ε"}&quot;
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Word Dictionary Panel */}
      <section className="wb-story__dict-card" aria-label="Word dictionary repository">
        <header className="dict-card__header">
          <span className="dict-card__title">
            Dictionary: <code>wordDict</code> ({wordDict.length} words)
          </span>
          <span className="dict-card__subtitle">
            Hover or inspect words to compare against current window
          </span>
        </header>

        <div className="wb-story__dict-pills" role="list">
          {wordDict.map((word, wIdx) => {
            const isTesting = slice === word;
            const isMatchedWord = matchedWord === word;
            const isUsedInSegments = segments && segments.includes(word);

            let pillClass = "dict-pill";
            if (isMatchedWord) pillClass += " is-matched";
            else if (isTesting) pillClass += " is-testing";
            else if (isUsedInSegments) pillClass += " is-used";

            return (
              <div key={wIdx} role="listitem" className={pillClass}>
                <span className="pill-text">&quot;{word}&quot;</span>
                {isMatchedWord && <span className="pill-badge badge-matched">MATCH ✓</span>}
                {isTesting && !isMatchedWord && (
                  <span className="pill-badge badge-testing">LOOKUP</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Done Completion Banner */}
      {phase === "done" && (
        <section
          className={`wb-story__done-card ${result ? "done-success" : "done-failure"}`}
          aria-label="Algorithm result summary"
        >
          <div className="done-card__icon">{result ? "✓" : "✗"}</div>
          <div className="done-card__body">
            <h4 className="done-card__heading">
              {result
                ? `Valid Word Break Found for "${s}"!`
                : `No Valid Word Break for "${s}"`}
            </h4>
            <p className="done-card__summary">
              {result
                ? `The string "${s}" can be completely segmented into valid dictionary words.`
                : `No combination of words in the dictionary can reconstruct the entire string "${s}".`}
            </p>

            {result && segments && segments.length > 0 && (
              <div className="done-card__decomposition">
                <span className="decomp-label">Segmented Decomposition:</span>
                <div className="decomp-pills">
                  {segments.map((segWord, sIdx) => (
                    <span key={sIdx} className="decomp-item">
                      <span className="decomp-word">&quot;{segWord}&quot;</span>
                      {sIdx < segments.length - 1 && <span className="decomp-plus">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </StoryPanel>
  );
}
