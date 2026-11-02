import "./HelloCallView.css";

// The returned function takes a box of arguments and always hands back the same string.
export default function HelloCallView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="hw-view" aria-label="Hello World function">
        <p className="hw-empty">Press Play to call the returned function.</p>
      </section>
    );
  }
  const calls = run.input.calls;
  const shown = step.results ?? [];
  return (
    <section className="hw-view" aria-label="Hello World function">
      <div className="hw-factory" aria-label="createHelloWorld returns a function">
        <span className="hw-icon" aria-hidden="true">{"ƒ"}</span>
        <span>createHelloWorld() returns a function that ignores its arguments</span>
      </div>
      <ol className="hw-calls">
        {calls.map((args, i) => {
          const done = i < shown.length;
          const current = step.call === i;
          return (
            <li key={i} className={`hw-call${current ? " hw-call--current" : ""}${done ? "" : " hw-call--pending"}`}>
              <span className="hw-args" aria-label={`${args.length} arguments`}>
                {args.length === 0 ? <em>no arguments</em> : args.map((v, j) => <code key={j}>{JSON.stringify(v)}</code>)}
              </span>
              <span className="hw-arrow" aria-hidden="true">→</span>
              <span className="hw-out">{done ? `"${shown[i]}"` : "waiting"}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
