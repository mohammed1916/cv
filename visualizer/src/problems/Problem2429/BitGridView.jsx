import "./BitGridView.css";

const TOP = 10;
const COLUMNS = Array.from({ length: TOP + 1 }, (_, i) => TOP - i);

// The bits of num1, num2, x and x XOR num1, from bit 10 down to bit 0. Decided bits of x are shaded by how they were chosen.
export default function BitGridView({ run, step }) {
  if (!run || !step) {
    return <section className="bit-grid" aria-label="Bit grid"><p className="bit-grid__note">Press Play to build x one bit at a time.</p></section>;
  }
  const { num1, num2 } = run.input;
  const bitOf = (value, bit) => (value >> bit) & 1;
  const xor = step.result ^ num1;
  const how = bit => (step.roles[bit] === "match" ? "match num1" : step.roles[bit] === "fill" ? "filled" : "");
  return (
    <section className="bit-grid" aria-label="Bit grid">
      <div className="bit-grid__scroll">
        <table aria-label="Bits from bit 10 down to bit 0">
          <thead>
            <tr>
              <th scope="col">bit</th>
              {COLUMNS.map(bit => <th key={bit} scope="col" className={bit === step.bit ? "is-current" : ""}>{bit}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">num1</th>{COLUMNS.map(bit => <td key={bit}>{bitOf(num1, bit)}</td>)}</tr>
            <tr><th scope="row">num2</th>{COLUMNS.map(bit => <td key={bit}>{bitOf(num2, bit)}</td>)}</tr>
            <tr><th scope="row">x</th>{COLUMNS.map(bit => <td key={bit} className={`bit-cell--${step.roles[bit] || "open"}`}>{bitOf(step.result, bit)}</td>)}</tr>
            <tr><th scope="row">how</th>{COLUMNS.map(bit => <td key={bit} className="bit-grid__how">{how(bit)}</td>)}</tr>
            <tr><th scope="row">x XOR num1</th>{COLUMNS.map(bit => <td key={bit}>{bitOf(xor, bit)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <dl className="bit-grid__state">
        <div><dt>Bits still needed</dt><dd>{step.need}</dd></div>
        <div><dt>x so far</dt><dd>{step.result}</dd></div>
        <div><dt>x XOR num1</dt><dd>{xor}</dd></div>
      </dl>
      <p className="bit-grid__note">Matched bits follow num1 from the top. Filled bits are the lowest free positions, which change x XOR num1 the least.</p>
    </section>
  );
}
