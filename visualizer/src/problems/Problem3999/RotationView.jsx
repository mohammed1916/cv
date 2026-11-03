import "./RotationView.css";

function Rail({ label, text, pointer }) {
  return (
    <div className="rot__rail">
      <span className="rot__label">{label}</span>
      <div className="rot__letters">
        {[...text].map((ch, i) => (
          <span key={i} className={`rot__letter${pointer && (i === pointer.i % Math.max(1, text.length) || i === pointer.j % Math.max(1, text.length)) ? " rot__letter--ptr" : ""}`}>{ch}</span>
        ))}
        {text.length === 0 && <span className="rot__empty">empty</span>}
      </div>
    </div>
  );
}

export default function RotationView({ run, step }) {
  if (!run || !step) return null;
  const words = run.input;
  const groupSeen = new Set(run.frames.filter(f => f.idx !== undefined && f.idx <= (step.idx ?? -1)).map(f => f.key).filter(Boolean));
  return (
    <div className="rot" role="img" aria-label={`Grouping ${words.length} words by rotation class`}>
      <div className="rot__words">
        {words.map((w, idx) => (
          <span key={idx} className={`rot__word${idx === step.idx ? " rot__word--now" : ""}`}>
            {w}{run.groupOf && idx <= (step.idx ?? -1) && <small> g{run.groupOf[idx]}</small>}
          </span>
        ))}
      </div>
      {step.word !== null && step.word !== undefined && (
        <div className="rot__focus">
          <Rail label="even" text={step.even} pointer={step.pointers} />
          <Rail label="odd" text={step.odd} pointer={step.pointers} />
          {step.rotated && <div className="rot__rot">rotated: {step.rotated[0] || "-"} | {step.rotated[1] || "-"}</div>}
          {step.pointers && <div className="rot__ptr">pointers i={step.pointers.i} j={step.pointers.j} k={step.pointers.k}</div>}
        </div>
      )}
      <div className="rot__legend">
        <span>Groups so far <strong>{step.groups}</strong></span>
        {step.key && <span>Key <strong>{step.key.replace("|", " / ")}</strong></span>}
        <span className="rot__seen">classes seen: {groupSeen.size}</span>
      </div>
      <p className="rot__msg">{step.message}</p>
    </div>
  );
}
