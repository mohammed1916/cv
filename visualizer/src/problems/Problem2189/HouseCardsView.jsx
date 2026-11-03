import "./HouseCardsView.css";

// Left: a sketch of one row of t upright triangles joined by t - 1 horizontal cards (3t - 1 cards).
// Right: the ways table for 0..n cards. The total being filled is outlined, and the
// smaller count that the current row reads from is marked with an arrow.
export default function HouseCardsView({ run, step }) {
  const { ways, total, row, cost, target } = step;
  const sketchRow = row > 0 ? row : 0;
  const source = row > 0 ? total - cost : -1;

  return (
    <div className="hcv" aria-label="House of cards ways table">
      <div className="hcv__sketch" aria-label={sketchRow ? `A row of ${sketchRow} triangles, ${cost} cards` : "No row chosen"}>
        {sketchRow === 0 ? (
          <p className="hcv__none">{step.phase === "done" ? `Answer for ${target} cards: ${ways[target]}` : "Choose a row size to see its cards."}</p>
        ) : (
          <svg viewBox={`0 0 ${sketchRow * 46 + 10} 80`} role="img" aria-hidden="true" className="hcv__svg">
            {Array.from({ length: sketchRow }, (_, k) => {
              const x = 6 + k * 46;
              return (
                <g key={k}>
                  <polygon points={`${x},70 ${x + 20},14 ${x + 40},70`} className="hcv__tri" />
                  <line x1={x + 8} y1={50} x2={x + 32} y2={50} className="hcv__cross" />
                </g>
              );
            })}
            {Array.from({ length: sketchRow - 1 }, (_, k) => (
              <line key={`h${k}`} x1={6 + k * 46 + 40} y1={70} x2={6 + (k + 1) * 46} y2={70} className="hcv__horiz" />
            ))}
          </svg>
        )}
        {sketchRow > 0 && (
          <p className="hcv__legend">
            {sketchRow} triangle{sketchRow === 1 ? "" : "s"}: {2 * sketchRow} triangle cards + {sketchRow - 1} horizontal = <strong>{cost}</strong> cards
          </p>
        )}
      </div>

      <ol className="hcv__table" aria-label="Ways for each card count">
        {ways.map((w, k) => {
          const cls = ["hcv__cell", k === total ? "is-filling" : "", k === source ? "is-source" : "", k === target ? "is-target" : ""].join(" ");
          return (
            <li key={k} className={cls}>
              <span className="hcv__k">{k}</span>
              <span className="hcv__w">{w}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
