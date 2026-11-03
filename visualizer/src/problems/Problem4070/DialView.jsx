import "./DialView.css";

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 96;

// Digit d sits at angle d * 36 degrees, with zero at the top, so neighbours on the dial are one tick apart.
function point(d, radius) {
  const angle = (d * 36 - 90) * (Math.PI / 180);
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
}

export default function DialView({ run, step }) {
  if (!run || !step) {
    return <section className="dial-view"><p className="dial-empty">Press Play to turn the dial to each digit the short way round.</p></section>;
  }
  const digits = [...run.input].map(Number);
  const from = step.from;
  const to = step.to;
  const [fx, fy] = point(from, RADIUS - 22);
  const hasTurn = to !== null && to !== undefined && step.steps !== null;
  const [tx, ty] = hasTurn ? point(to, RADIUS - 22) : [fx, fy];
  return (
    <section className="dial-view" aria-label="Circular dial">
      <svg className="dial-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Pointer at ${from}${hasTurn ? `, turning to ${to}` : ""}`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 18} className="dial-face" />
        {Array.from({ length: 10 }, (_, d) => {
          const [x, y] = point(d, RADIUS);
          const isFrom = d === from;
          const isTo = hasTurn && d === to;
          return (
            <g key={d}>
              <circle cx={x} cy={y} r={16} className={`dial-digit${isFrom ? " dial-digit--from" : ""}${isTo ? " dial-digit--to" : ""}`} />
              <text x={x} y={y + 5} textAnchor="middle" className="dial-label">{d}</text>
            </g>
          );
        })}
        <line x1={CENTER} y1={CENTER} x2={fx} y2={fy} className="dial-pointer" />
        {hasTurn && <line x1={fx} y1={fy} x2={tx} y2={ty} className="dial-turn" />}
      </svg>
      <ol className="dial-string" aria-label="Digits to dial">
        {digits.map((d, k) => (
          <li key={k} className={`dial-char${step.index === k ? " dial-char--current" : ""}${k < (step.index < 0 ? digits.length : step.index) ? " dial-char--done" : ""}`}>{d}</li>
        ))}
      </ol>
      <p className="dial-caption" role="status">
        {step.message} Running total: <strong>{step.total}</strong>
      </p>
    </section>
  );
}
