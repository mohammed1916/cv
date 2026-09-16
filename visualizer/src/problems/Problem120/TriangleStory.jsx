import StoryPanel from "../../components/shared/StoryPanel";
import "./TriangleStory.css";

export default function TriangleStory({ story, step }) {
  if (!step) {
    return (
      <StoryPanel
        title="Triangle: Minimum Total Path Sum"
        description="Press Play to begin."
      >
        <p>
          Compute the minimum path sum from the top to bottom using bottom-up
          dynamic programming.
        </p>
      </StoryPanel>
    );
  }

  const { triangle } = story;
  const { currentRow, currentCol, comparing, highlightRoute, dp } = step;

  const isRouteNode = (r, c) =>
    highlightRoute && highlightRoute.some((p) => p.row === r && p.col === c);

  const getNodeState = (r, c) => {
    if (isRouteNode(r, c)) return "winning-path";
    if (currentRow === r && currentCol === c) return "active";
    if (comparing) {
      if (
        comparing.chosen === 0 &&
        r === comparing.left.row &&
        c === comparing.left.col
      ) {
        return "chosen-child";
      }
      if (
        comparing.chosen === 1 &&
        r === comparing.right.row &&
        c === comparing.right.col
      ) {
        return "chosen-child";
      }
      if (
        (r === comparing.left.row && c === comparing.left.col) ||
        (r === comparing.right.row && c === comparing.right.col)
      ) {
        return "other-child";
      }
    }
    return "";
  };

  return (
    <StoryPanel
      title={
        step.phase === "done"
          ? `Minimum Path Sum: ${step.dp?.[0] ?? story.minTotal}`
          : step.phase === "init"
            ? "Initialize Base Cases"
            : `Evaluating Row ${currentRow}, Column ${currentCol}`
      }
      description={step.message}
    >
      <p>{step.explanation}</p>

      {triangle && triangle.length > 0 && (
        <div
          className="triangle-story__container"
          role="region"
          aria-label="Triangle graph nodes"
        >
          {triangle.map((row, r) => (
            <div key={r} className="triangle-story__row">
              {row.map((val, c) => {
                const state = getNodeState(r, c);
                return (
                  <div
                    key={c}
                    className="triangle-story__node"
                    data-state={state}
                  >
                    <span>{val}</span>
                    <small>
                      ({r},{c})
                    </small>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {dp && dp.length > 0 && (
        <div className="triangle-story__dp-section">
          <div className="triangle-story__dp-title">
            DP Array (Minimum cost from level {currentRow >= 0 ? currentRow : 0}{" "}
            downwards)
          </div>
          <div className="triangle-story__dp-cells">
            {dp.map((cost, idx) => (
              <div
                key={idx}
                className="triangle-story__dp-cell"
                data-updated={currentCol === idx ? "true" : "false"}
              >
                <strong>{cost}</strong>
                <small>dp[{idx}]</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </StoryPanel>
  );
}
