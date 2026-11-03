import "./RobotLineView.css";

const PALETTE = ["#0f766e", "#b45309", "#6d28d9", "#be123c", "#1d4ed8", "#4d7c0f", "#a16207", "#0e7490"];

// Robots are drawn on a number line at the event time. Each robot takes the colour of the group
// it belongs to; a group is the run of robots up to its rightmost member.
export default function RobotLineView({ run, step }) {
  if (!run || !step) return <p className="rl-empty">Press Play to advance time from merge to merge.</p>;
  const { positions, speeds, distance } = run.input;
  const t = step.time === null || step.time === undefined ? null : Number(step.time);
  const groupOf = i => step.groups.find(g => g >= i);
  const coord = i => (t === null ? positions[i] : positions[i] + speeds[i] * t);
  const xs = positions.map((_, i) => coord(i));
  const min = Math.min(...positions) - 1;
  const max = Math.max(...xs) + 2;
  const scale = v => 24 + ((v - min) / (max - min)) * 560;
  return (
    <section className="rl-view" aria-label="Robots on a line">
      <svg viewBox="0 0 610 110" role="img" aria-label={`${step.groups.length} groups at time ${step.time ?? "start"}`}>
        <line x1="24" x2="584" y1="70" y2="70" className="rl-axis" />
        {positions.map((_, i) => {
          const g = groupOf(i);
          const color = PALETTE[step.groups.indexOf(g) % PALETTE.length];
          const x = scale(xs[i]);
          return (
            <g key={i}>
              <circle cx={x} cy="70" r="11" fill={color} className={i === step.left ? "rl-dot rl-dot--left" : "rl-dot"} />
              <text x={x} y="74" textAnchor="middle" className="rl-id">{i}</text>
              <text x={x} y="40" textAnchor="middle" className="rl-speed">{`v${speeds[i]}`}</text>
            </g>
          );
        })}
      </svg>
      <p className="rl-caption">Time {step.time ?? 0}; distance {distance}. Robots show their index and speed; colour marks the group.</p>
      <p className="rl-readout">{step.groups.length} group{step.groups.length === 1 ? "" : "s"} now</p>
    </section>
  );
}
