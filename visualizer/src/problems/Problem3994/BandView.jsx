import "./BandView.css";
import { groupOf } from "./algorithm";

const BAND_NAMES = ["below a", "a to b", "above b"];

export default function BandView({ run, step }) {
  if (!run || !step) return null;
  const { nums, a, b } = run.input;
  return (
    <div className="bands" role="img" aria-label={`Values ${nums.join(", ")} grouped into three bands`}>
      <div className="bands__row">
        {nums.map((x, idx) => {
          const g = groupOf(x, a, b);
          const classes = ["bands__cell", `bands__cell--g${g}`];
          if (idx === step.index) classes.push("bands__cell--now");
          return (
            <div key={idx} className={classes.join(" ")}>
              <span className="bands__index">{idx}</span>
              <span className="bands__value">{x}</span>
              <span className="bands__band">{BAND_NAMES[g]}</span>
            </div>
          );
        })}
      </div>
      <div className="bands__counts" aria-label="Seen counts per band">
        {BAND_NAMES.map((name, g) => (
          <div key={g} className={`bands__count bands__count--g${g}${step.group === g ? " bands__count--active" : ""}`}>
            <span>{name}</span>
            <strong>{step.seen[g]} seen</strong>
          </div>
        ))}
      </div>
      <div className="bands__legend">
        <span>Swaps so far: <strong>{step.swaps}</strong></span>
        {step.crossed !== undefined && <span>Passes needed for this value: <strong>{step.crossed}</strong></span>}
      </div>
    </div>
  );
}
