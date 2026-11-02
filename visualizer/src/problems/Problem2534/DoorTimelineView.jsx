import "./DoorTimelineView.css";

// A timeline of seconds. Each second shows who crossed and in which direction; the current queues are listed beside it.
export default function DoorTimelineView({ run, step }) {
  if (!run || !step) {
    return <section className="door-view" aria-label="Door timeline"><p className="door-empty">Press Play to run the door second by second.</p></section>;
  }
  const { arrival, state } = run.input;
  const shownSeconds = step.timeline.map(e => e.t);
  const last = Math.max(step.t, ...shownSeconds, 0);
  const seconds = Array.from({ length: last + 1 }, (_, s) => s);
  const slotFor = s => step.timeline.find(e => e.t === s);
  return (
    <section className="door-view" aria-label="Door timeline">
      <div className="door-track" role="list">
        {seconds.map(s => {
          const slot = slotFor(s);
          const cls = ["door-slot", s === step.t ? "door-slot--now" : "", slot && !slot.idle ? (slot.dir === 0 ? "door-slot--enter" : "door-slot--exit") : "", slot && slot.idle ? "door-slot--idle" : ""].join(" ");
          return (
            <div role="listitem" key={s} className={cls}>
              <span className="door-second">{s}</span>
              <span className="door-what">{slot ? (slot.idle ? "idle" : `#${slot.person} ${slot.dir === 0 ? "in" : "out"}`) : ""}</span>
            </div>
          );
        })}
      </div>
      <div className="door-queues">
        <div><h4>Entering waiting</h4><p>{step.waiting[0].length ? step.waiting[0].map(i => `#${i} (arr ${arrival[i]})`).join(", ") : "none"}</p></div>
        <div><h4>Exiting waiting</h4><p>{step.waiting[1].length ? step.waiting[1].map(i => `#${i} (arr ${arrival[i]})`).join(", ") : "none"}</p></div>
      </div>
      <p className="door-answer">Answer so far: {step.answer.map((v, i) => `#${i}=${step.timeline.some(e => !e.idle && e.person === i) ? v : "?"}`).join("  ")}</p>
    </section>
  );
}
