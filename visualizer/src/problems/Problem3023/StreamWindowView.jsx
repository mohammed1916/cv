import "./StreamWindowView.css";

// Draws the bit tape as the stream yields it, with the last m bits boxed as the window.
export default function StreamWindowView({ run, step }) {
  const pattern = run.input.pattern;
  const m = pattern.length;
  const bits = step.bits ?? "";
  const index = step.index ?? -1;
  const windowFull = index >= m - 1;
  const winStart = windowFull ? index - m + 1 : -1;
  const compareAt = step.j >= 0 && windowFull ? winStart + step.j : -1;
  const verdict = step.verdict;

  return (
    <div className="streamWindow" aria-label="Bit stream and sliding window">
      <div className="swRow">
        <span className="swLabel">pattern</span>
        {pattern.split("").map((bit, i) => (
          <span key={i} className={`swCell swPattern ${step.j === i ? `swActive-${verdict ?? "none"}` : ""}`}>
            <small>{i}</small>
            {bit}
          </span>
        ))}
      </div>
      <div className="swRow swTape">
        <span className="swLabel">stream</span>
        {bits.split("").map((bit, i) => {
          const inWindow = windowFull && i >= winStart && i <= index;
          const isLast = i === index;
          const isCompare = i === compareAt;
          return (
            <span
              key={i}
              className={[
                "swCell",
                inWindow ? "swInWindow" : "",
                isLast ? "swLast" : "",
                isCompare ? `swActive-${verdict ?? "none"}` : "",
              ].join(" ")}
            >
              <small>{i}</small>
              {bit}
            </span>
          );
        })}
      </div>
      <p className="swStatus">
        {`window = ${step.window || "(empty)"}`}
        {step.start >= 0 ? `, candidate start ${step.start}` : ""}
        {step.found >= 0 ? `, found at ${step.found}` : ""}
      </p>
      <p className="swNote">
        Only next() is used. The stream is read once, one bit at a time, and the boxed bits are the last {m}.
      </p>
    </div>
  );
}
