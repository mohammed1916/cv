import StoryPanel from "../../components/shared/StoryPanel";
import "./MinCutStory.css";

export default function MinCutStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Palindrome Partitioning II"
        description="Press Play to begin center expansion."
      >
        <p className="mincut-story__desc">
          Expand around each center (both odd and even lengths) to find all
          palindromic substrings and compute the minimum cuts array{" "}
          <code>dp[r]</code>.
        </p>
      </StoryPanel>
    );
  }

  const { s, n } = story;
  const {
    phase,
    activeLine,
    mid,
    expansionType,
    l,
    r,
    comparing,
    palindromeSpan,
    dp,
    partitions,
    updatedIndex,
    prevValue,
    improved,
    minCuts,
  } = step;

  const getTitle = () => {
    if (phase === "init") return "Step 1: Initialize Max Cuts DP Array";
    if (phase === "loop" && expansionType === null)
      return `Center Selection: mid = ${mid} ('${s[mid]}')`;
    if (phase === "loop" && expansionType === "odd" && activeLine === 6)
      return `Odd Palindrome: Start at Center s[${mid}] = '${s[mid]}'`;
    if (phase === "loop" && expansionType === "even" && activeLine === 11)
      return `Even Palindrome: Center between s[${mid}] and s[${mid + 1 < n ? mid + 1 : "end"}]`;
    if (phase === "check")
      return comparing?.match
        ? `Palindrome Matched: "${s.slice(l, r + 1)}"`
        : `Mismatch: s[${l}] ('${s[l]}') ≠ s[${r}] ('${s[r]}')`;
    if (phase === "dp")
      return l === 0
        ? `DP Update: Prefix s[0..${r}] is a Palindrome → dp[${r}] = 0`
        : `DP Update: dp[${r}] = min(${prevValue}, dp[${l - 1}] + 1) = ${dp[r]}`;
    if (phase === "loop" && (activeLine === 9 || activeLine === 14))
      return `Expanding Wings: l → ${l}, r → ${r}`;
    if (phase === "done")
      return `Optimal Solution: ${minCuts} Minimum Cut${minCuts === 1 ? "" : "s"}`;
    return "Palindrome Partitioning II";
  };

  const isWindowActive = l !== null && r !== null && l <= r && l >= 0 && r < n;

  return (
    <StoryPanel
      title={getTitle()}
      description={step.message}
      label="Palindrome Partitioning II Visual Story"
      className="mincut-story"
    >
      <p className="mincut-story__explanation">{step.explanation}</p>

      {/* Telemetry Bar */}
      <section className="mincut-story__telemetry" aria-label="Algorithm state summary">
        <div className="telemetry-item">
          <span className="telemetry-label">Center (mid)</span>
          <span className="telemetry-val">
            {mid !== null ? `${mid} ('${s[mid]}')` : "—"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Type</span>
          <span className="telemetry-val">
            {expansionType ? (expansionType === "odd" ? "Odd (2k+1)" : "Even (2k)") : "—"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Window</span>
          <span className="telemetry-val">
            {isWindowActive ? `s[${l}..${r}] ("${s.slice(l, r + 1)}")` : "—"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Best Min Cuts</span>
          <span className="telemetry-val highlight">
            {dp[n - 1] ?? "—"}
          </span>
        </div>
      </section>

      {/* Comparison Hero Card during check */}
      {comparing && (
        <section
          className={`mincut-story__comparison ${
            comparing.match ? "is-match" : "is-mismatch"
          }`}
          aria-label="Character comparison"
        >
          <div className="comparison-card left">
            <span className="comparison-index">s[{comparing.l}]</span>
            <span className="comparison-char">&apos;{comparing.leftChar}&apos;</span>
            <span className="comparison-tag">Left Wing (l)</span>
          </div>

          <div className="comparison-operator">
            <span className="operator-symbol">{comparing.match ? "==" : "≠"}</span>
            <span
              className={`operator-badge ${
                comparing.match ? "badge-match" : "badge-mismatch"
              }`}
            >
              {comparing.match ? "PALINDROME MATCH ✓" : "MISMATCH ✗"}
            </span>
          </div>

          <div className="comparison-card right">
            <span className="comparison-index">s[{comparing.r}]</span>
            <span className="comparison-char">&apos;{comparing.rightChar}&apos;</span>
            <span className="comparison-tag">Right Wing (r)</span>
          </div>
        </section>
      )}

      {/* String & Wings Track */}
      <section className="mincut-story__track-card" aria-label="String characters and wings">
        <header className="track-card__header">
          <span className="track-card__title">String & Expansion Wings</span>
          {expansionType && (
            <span className="track-card__badge">
              {expansionType === "odd"
                ? `Odd length around s[${mid}]`
                : `Even length between s[${mid}] & s[${mid + 1}]`}
            </span>
          )}
        </header>

        <div className="mincut-story__track">
          {s.split("").map((ch, idx) => {
            const isMid = idx === mid;
            const isL = idx === l;
            const isR = idx === r;
            const inSpan =
              palindromeSpan &&
              idx >= palindromeSpan[0] &&
              idx <= palindromeSpan[1];
            const inWindow =
              l !== null && r !== null && idx >= l && idx <= r;

            let cellState = "";
            if (inSpan) cellState = "is-palindrome";
            else if (inWindow && comparing && !comparing.match && (isL || isR))
              cellState = "is-mismatch";
            else if (inWindow) cellState = "is-window";

            return (
              <div key={idx} className="track-slot-wrapper">
                <div
                  className={`track-slot ${cellState} ${isMid ? "is-mid" : ""}`}
                >
                  <div className="track-tags">
                    {isMid && expansionType === "odd" && (
                      <span className="tag tag-mid">mid</span>
                    )}
                    {isL && <span className="tag tag-l">L</span>}
                    {isR && <span className="tag tag-r">R</span>}
                  </div>
                  <div className="track-cell">{ch}</div>
                  <span className="track-index">{idx}</span>
                </div>

                {/* Even center seam indicator between mid and mid+1 */}
                {expansionType === "even" && idx === mid && idx < n - 1 && (
                  <div className="even-seam" title={`Center seam between ${mid} and ${mid + 1}`}>
                    <span className="even-seam-line" />
                    <span className="even-seam-dot" />
                    <span className="even-seam-label">center</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* DP Recurrence Transition Hero (shown when updating or checking DP) */}
      {phase === "dp" && (
        <section
          className={`mincut-story__dp-hero ${improved ? "is-improved" : ""}`}
          aria-label="DP transition details"
        >
          <div className="dp-hero__header">
            <span className="dp-hero__title">
              DP Transition for prefix <code>s[0..{r}]</code> (&quot;{s.slice(0, r + 1)}&quot;)
            </span>
            <span className={`dp-hero__badge ${improved ? "badge-improved" : "badge-retained"}`}>
              {l === 0
                ? "Whole Prefix Palindrome"
                : improved
                ? `Cuts reduced: ${prevValue} → ${dp[r]} ↓`
                : `Cuts retained: ${dp[r]}`}
            </span>
          </div>

          <div className="dp-hero__equation">
            {l === 0 ? (
              <div className="equation-block">
                <span className="equation-math">dp[{r}] = 0</span>
                <span className="equation-note">
                  Subarray <code>s[0..{r}]</code> is a standalone palindrome. No cuts required.
                </span>
              </div>
            ) : (
              <div className="equation-block">
                <div className="equation-math">
                  dp[{r}] = min(dp[{r}], dp[{l - 1}] + 1) = min({prevValue}, {dp[l - 1]} + 1) ={" "}
                  <strong>{dp[r]}</strong>
                </div>
                <div className="equation-segments">
                  <div className="segment-card prefix">
                    <span className="segment-sub">s[0..{l - 1}]</span>
                    <span className="segment-str">&quot;{s.slice(0, l)}&quot;</span>
                    <span className="segment-cuts">{dp[l - 1]} cuts</span>
                  </div>
                  <div className="segment-cut">
                    <span className="cut-icon">✂</span>
                    <span className="cut-label">+1 cut</span>
                  </div>
                  <div className="segment-card suffix">
                    <span className="segment-sub">s[{l}..{r}]</span>
                    <span className="segment-str">&quot;{s.slice(l, r + 1)}&quot;</span>
                    <span className="segment-cuts">palindrome</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* DP Array Table */}
      <section className="mincut-story__dp-section" aria-label="DP minimum cuts table">
        <header className="dp-section__header">
          <span className="dp-section__title">
            DP Array: Minimum cuts for prefix <code>s[0..i]</code>
          </span>
          <span className="dp-section__hint">
            Formula: <code>dp[r] = 0 if l == 0 else min(dp[r], dp[l - 1] + 1)</code>
          </span>
        </header>

        <div className="mincut-story__dp-grid">
          {dp.map((val, idx) => {
            const isUpdated = idx === updatedIndex && phase === "dp";
            const isTarget = idx === r;
            const prefixStr = s.slice(0, idx + 1);
            const prefixParts = partitions[idx] || [prefixStr];

            return (
              <div
                key={idx}
                className={`dp-cell-card ${isUpdated ? "is-updated" : ""} ${
                  isTarget ? "is-target" : ""
                }`}
              >
                <div className="dp-cell-card__top">
                  <span className="dp-cell-idx">dp[{idx}]</span>
                  <span className="dp-cell-prefix" title={prefixStr}>
                    &quot;{prefixStr}&quot;
                  </span>
                </div>

                <div className="dp-cell-card__val">
                  <span className="val-number">{val}</span>
                  <span className="val-unit">
                    {val === 1 ? "cut" : "cuts"}
                  </span>
                </div>

                <div className="dp-cell-card__partition">
                  <span className="partition-label">Partition:</span>
                  <div className="partition-pills">
                    {prefixParts.map((part, pIdx) => (
                      <span key={pIdx} className="part-pill">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Done Banner */}
      {phase === "done" && (
        <section className="mincut-story__done-card" aria-label="Final optimal partition">
          <div className="done-card__icon">✓</div>
          <div className="done-card__body">
            <h4 className="done-card__title">
              Optimal Palindrome Partitioning Found!
            </h4>
            <p className="done-card__cuts">
              Minimum Cuts Required: <strong>{minCuts}</strong>
            </p>
            <div className="done-card__partition-flow">
              {(partitions[n - 1] || []).map((part, idx, arr) => (
                <div key={idx} className="flow-item">
                  <span className="flow-pill">{part}</span>
                  {idx < arr.length - 1 && (
                    <span className="flow-cut" title="Cut position">
                      ✂
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="done-card__note">
              Every substring in the partition above is verified to be a palindrome.
            </p>
          </div>
        </section>
      )}
    </StoryPanel>
  );
}
