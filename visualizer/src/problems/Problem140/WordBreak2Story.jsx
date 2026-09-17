import React from "react";
import StoryPanel from "../../components/shared/StoryPanel";
import "./WordBreak2Story.css";

function buildTreeHierarchy(nodes) {
  if (!nodes || nodes.length === 0) return [];
  const map = new Map();
  const roots = [];

  nodes.forEach((n) => {
    map.set(n.id, { ...n, children: [] });
  });

  nodes.forEach((n) => {
    const current = map.get(n.id);
    if (n.parentId && map.has(n.parentId)) {
      map.get(n.parentId).children.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
}

function TreeNode({ node, activeNodeId, s }) {
  const isActive = node.id === activeNodeId;
  const suffix = node.start < s.length ? s.slice(node.start) : "ε (end)";

  const getStatusBadge = () => {
    switch (node.status) {
      case "cached":
        return <span className="tree-node__status tree-node__status--cached">↺ Cache Hit</span>;
      case "success":
        return <span className="tree-node__status tree-node__status--success">✓ Base Case</span>;
      case "complete":
        return (
          <span className="tree-node__status tree-node__status--complete">
            {node.completionsCount} split{node.completionsCount === 1 ? "" : "s"}
          </span>
        );
      case "dead_end":
        return <span className="tree-node__status tree-node__status--dead">0 splits</span>;
      default:
        return <span className="tree-node__status tree-node__status--active">Exploring</span>;
    }
  };

  return (
    <div className={`tree-node-wrapper ${isActive ? "is-active" : ""}`}>
      <div className={`tree-node tree-node--${node.status} ${isActive ? "active-glow" : ""}`}>
        <div className="tree-node__header">
          <span className="tree-node__word">
            {node.leadingWord === "root" ? "▶ root" : `"${node.leadingWord}"`}
          </span>
          {getStatusBadge()}
        </div>
        <div className="tree-node__body">
          <span className="tree-node__call">dfs({node.start})</span>
          <span className="tree-node__suffix" title={`s[${node.start}:] = "${suffix}"`}>
            rem: <code>"{suffix}"</code>
          </span>
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="tree-node__children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} activeNodeId={activeNodeId} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WordBreak2Story({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel
        title="Word Break II"
        description="Press Play to begin exploring word break combinations."
        label="Word Break II visual story"
        className="wb2-story"
      >
        <p className="wb2-story__explanation">
          Word Break II finds all possible sentences where the input string s is segmented into
          space-separated dictionary words. We trace a recursive depth-first search with memoization,
          pruning redundant exploration when multiple branches reach the same suffix.
        </p>
      </StoryPanel>
    );
  }

  const { s, wordDict } = story;
  const {
    phase,
    start,
    end,
    currentWord,
    inDict,
    depth = 0,
    path = [],
    memo = {},
    cacheHitCount = 0,
    sentences = [],
    treeNodes = [],
    activeNodeId,
    message,
    explanation,
  } = step;

  const getStoryTitle = () => {
    switch (phase) {
      case "init":
        return "Initialization & Setup";
      case "check":
        return inDict
          ? `Dictionary Match: "${currentWord}" ✓`
          : `Prefix Scan: "${currentWord}" ✗`;
      case "recursive_search":
        return `Recurse on Suffix s[${end}:] = "${s.slice(end) || "ε"}"`;
      case "cache_hit":
        return `Memo Cache Hit at Index ${start}! ↺`;
      case "solution":
        return start === s.length
          ? `Complete Sentence Formed! (#${sentences.length})`
          : `Sentence Solution Formatted`;
      case "memo":
        return `Memoized Index ${start} (${memo[start]?.length ?? 0} result(s))`;
      case "merge":
        return `Combining Prefix with Suffix Results`;
      case "done":
        return `Search Complete: Found ${sentences.length} Valid Sentence(s)`;
      default:
        return "Word Break II Execution Trace";
    }
  };

  const memoEntries = Object.entries(memo);
  const treeRoots = buildTreeHierarchy(treeNodes);

  return (
    <StoryPanel
      title={getStoryTitle()}
      description={message}
      label="Word Break II visual story"
      className="wb2-story"
    >
      <p className="wb2-story__explanation">{explanation}</p>

      {/* Top Metrics Row */}
      <section className="wb2-metrics" aria-label="Exploration metrics">
        <div className="wb2-metric-chip">
          <span className="wb2-metric-label">String Length</span>
          <span className="wb2-metric-value">|s| = {s.length}</span>
        </div>
        <div className="wb2-metric-chip">
          <span className="wb2-metric-label">Current Start</span>
          <span className="wb2-metric-value">{start !== null ? `index ${start}` : "—"}</span>
        </div>
        <div className="wb2-metric-chip">
          <span className="wb2-metric-label">Recursion Depth</span>
          <span className="wb2-metric-value">Level {depth}</span>
        </div>
        <div className="wb2-metric-chip">
          <span className="wb2-metric-label">Memo States</span>
          <span className="wb2-metric-value">{memoEntries.length}</span>
        </div>
        <div className={`wb2-metric-chip ${cacheHitCount > 0 ? "wb2-metric-chip--highlight" : ""}`}>
          <span className="wb2-metric-label">Cache Hits</span>
          <span className="wb2-metric-value">{cacheHitCount}</span>
        </div>
        <div className="wb2-metric-chip wb2-metric-chip--success">
          <span className="wb2-metric-label">Sentences</span>
          <span className="wb2-metric-value">{sentences.length}</span>
        </div>
        <div className={`wb2-phase-badge wb2-phase-${phase}`} role="status">
          {phase.replace(/_/g, " ").toUpperCase()}
        </div>
      </section>

      {/* String Segmentation & Active Prefix Inspector */}
      <section className="wb2-section" aria-label="String segmentation">
        <header className="wb2-section-header">
          <h4>String Segmentation &amp; Prefix Inspector</h4>
          <span className="wb2-section-hint">
            Active exploration window across string characters
          </span>
        </header>

        <div className="wb2-string-bar" role="img" aria-label={`Characters of string ${s}`}>
          {s.split("").map((char, idx) => {
            const isMatchedPath = start !== null && idx < start;
            const isInCurrentPrefix =
              start !== null && end !== null && idx >= start && idx < end;
            const isRemaining =
              (end !== null && idx >= end) || (end === null && start !== null && idx >= start);

            let statusClass = "char--unvisited";
            if (isMatchedPath) statusClass = "char--path";
            if (isInCurrentPrefix) {
              statusClass = inDict ? "char--prefix-match" : "char--prefix-candidate";
            } else if (isRemaining) {
              statusClass = "char--remaining";
            }

            return (
              <div key={idx} className={`wb2-char-box ${statusClass}`}>
                <span className="wb2-char-letter">{char}</span>
                <span className="wb2-char-index">{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Word Tag & Breadcrumb Inspector */}
        <div className="wb2-inspector-row">
          <div className="wb2-inspector-item">
            <span className="wb2-sub-label">Current Ancestor Path:</span>
            <div className="wb2-path-tags">
              {path.length === 0 ? (
                <span className="wb2-tag wb2-tag--muted">[root]</span>
              ) : (
                path.map((word, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="wb2-arrow">→</span>}
                    <span className="wb2-tag wb2-tag--path">{word}</span>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {currentWord && (
            <div className="wb2-inspector-item">
              <span className="wb2-sub-label">Tested Prefix s[{start}:{end}]:</span>
              <div className="wb2-match-tag-container">
                <span className="wb2-tag wb2-tag--word">"{currentWord}"</span>
                <span
                  className={`wb2-tag ${
                    inDict ? "wb2-tag--in-dict" : "wb2-tag--not-in-dict"
                  }`}
                >
                  {inDict ? "✓ IN DICTIONARY" : "✗ NOT IN DICT"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dictionary Word Badges */}
        <div className="wb2-dict-pills">
          <span className="wb2-sub-label">Dictionary ({wordDict.length}):</span>
          <div className="wb2-dict-chips">
            {wordDict.map((w) => {
              const isCurrent = currentWord === w;
              const isMatch = inDict && isCurrent;
              return (
                <span
                  key={w}
                  className={`wb2-dict-chip ${
                    isMatch
                      ? "wb2-dict-chip--matched"
                      : isCurrent
                      ? "wb2-dict-chip--active"
                      : ""
                  }`}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Two-Column View: DFS Exploration Tree & Memoization Cache */}
      <div className="wb2-dual-grid">
        {/* Left Column: Recursive DFS Tree */}
        <section className="wb2-section wb2-tree-section" aria-label="DFS Exploration Tree">
          <header className="wb2-section-header">
            <h4>Recursive DFS Search Tree</h4>
            <span className="wb2-section-hint">
              Nodes show dfs(start) calls with leading matched words
            </span>
          </header>

          <div className="wb2-tree-container">
            {treeRoots.length > 0 ? (
              treeRoots.map((root) => (
                <TreeNode
                  key={root.id}
                  node={root}
                  activeNodeId={activeNodeId}
                  s={s}
                />
              ))
            ) : (
              <div className="wb2-empty-state">No DFS calls executed yet.</div>
            )}
          </div>
        </section>

        {/* Right Column: Memoization Cache Table */}
        <section className="wb2-section wb2-memo-section" aria-label="Memoization Cache">
          <header className="wb2-section-header">
            <h4>Memoization Cache (memo)</h4>
            <span className="wb2-section-hint">
              Stores computed sentence completions for suffix s[start:]
            </span>
          </header>

          <div className="wb2-memo-container">
            {memoEntries.length === 0 ? (
              <div className="wb2-empty-state">
                Memo cache is empty. Results are stored when backtracking from completed branches.
              </div>
            ) : (
              <div className="wb2-memo-list">
                {memoEntries.map(([key, completions]) => {
                  const numKey = Number(key);
                  const isHighlighted =
                    numKey === start && (phase === "cache_hit" || phase === "memo");
                  const suffix = numKey < s.length ? s.slice(numKey) : "ε";

                  return (
                    <div
                      key={key}
                      className={`wb2-memo-card ${
                        isHighlighted ? "wb2-memo-card--active" : ""
                      }`}
                    >
                      <div className="wb2-memo-card__header">
                        <span className="wb2-memo-key">memo[{key}]</span>
                        <span className="wb2-memo-suffix">s[{key}:] = "{suffix}"</span>
                        <span className="wb2-memo-count">
                          {completions.length} result{completions.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="wb2-memo-card__body">
                        {completions.length === 0 ? (
                          <span className="wb2-memo-empty-val">[ ] (dead end)</span>
                        ) : (
                          completions.map((pathArr, pIdx) => (
                            <div key={pIdx} className="wb2-memo-path">
                              {pathArr.map((tok, tIdx) => (
                                <span key={tIdx} className="wb2-tag wb2-tag--sub">
                                  {tok}
                                </span>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Accumulated Valid Sentences */}
      <section className="wb2-section wb2-sentences-section" aria-label="Valid Sentences">
        <header className="wb2-section-header">
          <h4>Accumulated Valid Sentences ({sentences.length})</h4>
          <span className="wb2-section-hint">
            Complete sentences resulting from space-separated word combinations
          </span>
        </header>

        <div className="wb2-sentences-container">
          {sentences.length === 0 ? (
            <div className="wb2-empty-state">
              {phase === "done"
                ? "No valid word break combinations possible with this dictionary."
                : "Exploring branches... Completed sentences will appear here as base cases are verified."}
            </div>
          ) : (
            <div className="wb2-sentences-grid">
              {sentences.map((sent, idx) => {
                const words = sent.split(" ");
                return (
                  <div key={idx} className="wb2-sentence-card">
                    <div className="wb2-sentence-card__badge">#{idx + 1}</div>
                    <div className="wb2-sentence-card__words">
                      {words.map((w, wIdx) => (
                        <span key={wIdx} className="wb2-word-token">
                          {w}
                        </span>
                      ))}
                    </div>
                    <div className="wb2-sentence-card__raw">"{sent}"</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </StoryPanel>
  );
}
