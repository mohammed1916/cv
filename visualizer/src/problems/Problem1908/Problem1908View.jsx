import "./NimBitsView.css";

const BITS = 4;

// Each heap as four binary digits. The running XOR row shows the bits that survive; zero means the second player wins.
export default function Problem1908View({ run, step }) {
  const heaps = run.input;
  const bits = (n) => Array.from({ length: BITS }, (_, b) => (n >> (BITS - 1 - b)) & 1);
  const total = bits(step.total);
  return (
    <section className="nim-view" aria-label="Nim heaps in binary with running XOR">
      <table className="nim-table">
        <thead>
          <tr><th>heap</th><th>size</th><th>bits (8 4 2 1)</th></tr>
        </thead>
        <tbody>
          {heaps.map((h, i) => (
            <tr key={i} className={step.index === i ? "nim-row--active" : ""}>
              <td>{`#${i + 1}`}</td>
              <td>{h}</td>
              <td>{bits(h).map((bit, b) => <span key={b} className={`nim-bit ${bit ? "nim-bit--on" : ""}`}>{bit}</span>)}</td>
            </tr>
          ))}
          <tr className="nim-total">
            <td>XOR</td>
            <td>{step.total}</td>
            <td>{total.map((bit, b) => <span key={b} className={`nim-bit ${bit ? "nim-bit--on" : ""}`}>{bit}</span>)}</td>
          </tr>
        </tbody>
      </table>
      {step.phase === "answer" && (
        <p className={`nim-verdict ${step.wins ? "nim-verdict--win" : "nim-verdict--lose"}`}>{step.wins ? "First player wins" : "Second player wins"}</p>
      )}
      <p className="nim-message">{step.message}</p>
    </section>
  );
}
