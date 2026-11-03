import "./BitRunView.css";

// Rows are the elements placed so far, in position order. Columns are bits from 14 down to 0.
// A column is struck once its run has ended; the bits still unbroken are shown in the mask line.
export default function BitRunView({ run, step }) {
  if (!run || !step) return <p className="br-empty">Press Play to place the elements one at a time.</p>;
  const bits = Array.from({ length: 15 }, (_, i) => 14 - i);
  const broken = b => step.fixed[b] !== null;
  const mask = bits.map(b => (step.U >> b) & 1 ? "1" : "0").join("");
  return (
    <section className="br-view" aria-label="Bit grid for the placed elements">
      <div className="br-scroll">
        <table className="br-grid" aria-label="Placed elements against bits">
          <thead>
            <tr><th>value</th>{bits.map(b => <th key={b} className={broken(b) ? "br-col--ended" : ""}>{b}</th>)}</tr>
          </thead>
          <tbody>
            {step.order.map((v, row) => (
              <tr key={row} className={step.picked === v && row === step.order.length - 1 ? "br-row--new" : ""}>
                <th>{`${row}: ${v}`}</th>
                {bits.map(b => {
                  const on = ((v >> b) & 1) === 1;
                  return <td key={b} className={on ? "br-on" : "br-off"}>{on ? "1" : "0"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="br-readout">Unbroken mask from bit 14 to 0: {mask}</p>
      <p className="br-readout">Runs found: {bits.map(b => (broken(b) ? `${b}=${step.fixed[b]}` : `${b}=?`)).join(", ")}</p>
    </section>
  );
}
