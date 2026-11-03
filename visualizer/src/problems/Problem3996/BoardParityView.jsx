import "./BoardParityView.css";

const KNIGHT = "♞";

export default function BoardParityView({ run, step }) {
  if (!run || !step) return null;
  const { start, target } = run.input;
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isStart = r === start[0] && c === start[1];
      const isTarget = r === target[0] && c === target[1];
      const dark = (r + c) % 2 === 1;
      const classes = ["board__sq", dark ? "board__sq--dark" : "board__sq--light"];
      if (isStart) classes.push("board__sq--start");
      if (isTarget) classes.push("board__sq--target");
      squares.push(
        <div key={`${r}-${c}`} className={classes.join(" ")} title={`${r},${c}`}>
          {isStart && <span className="board__mark" aria-label="start knight">{KNIGHT}</span>}
          {isTarget && !isStart && <span className="board__mark board__mark--target" aria-label="target">T</span>}
          {isTarget && isStart && <span className="board__mark board__mark--target">T</span>}
        </div>,
      );
    }
  }
  return (
    <div className="board" role="img" aria-label={`8 by 8 board, knight from ${start} to ${target}`}>
      <div className="board__grid">{squares}</div>
      <div className="board__legend">
        <span>Start colour <strong>{step.sc ?? "?"}</strong></span>
        <span>Target colour <strong>{step.tc ?? "?"}</strong></span>
        {step.same !== null && step.same !== undefined && (
          <span className={step.same ? "board__badge board__badge--yes" : "board__badge board__badge--no"}>
            {step.same ? "Same colour: even walk possible" : "Different colour: only odd walks"}
          </span>
        )}
      </div>
    </div>
  );
}
