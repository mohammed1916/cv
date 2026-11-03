import "./PermutationGridView.css";

// Positions are the row of slots; values are the chips underneath. The chip under test shows its gcd with the slot.
export default function PermutationGridView({ run, step }) {
  if (!run || !step) {
    return <section className="pg-view" aria-label="Self-divisible permutation grid"><p className="pg-empty">Press Play to fill positions one at a time.</p></section>;
  }
  const n = run.input;
  const positions = Array.from({ length: n }, (_, i) => i + 1);
  const testing = step.phase === "reject" || step.phase === "assign" || step.phase === "backtrack";
  const verdict = step.ok === true ? "pg-verdict--ok" : step.ok === false ? "pg-verdict--no" : "";

  return (
    <section className="pg-view" aria-label="Self-divisible permutation grid">
      <div className="pg-row-label">Positions (1-based)</div>
      <div className="pg-row">
        {positions.map((pos) => {
          const value = step.perm[pos - 1];
          const current = pos === step.pos;
          return (
            <div key={pos} className={`pg-slot${current ? " pg-slot--current" : ""}${value ? " pg-slot--filled" : ""}`}>
              <span className="pg-index">{pos}</span>
              <span className="pg-value">{value || "-"}</span>
            </div>
          );
        })}
      </div>
      <div className="pg-row-label">Values (a chip turns grey once used)</div>
      <div className="pg-row">
        {positions.map((v) => {
          const used = step.used[v - 1];
          const tested = testing && step.value === v;
          return (
            <div key={v} className={`pg-chip${used ? " pg-chip--used" : ""}${tested ? " pg-chip--tested" : ""}${tested && step.ok === false ? " pg-chip--rejected" : ""}`}>
              {v}
              {tested && step.gcd !== null ? <small>{`gcd=${step.gcd}`}</small> : null}
              {tested && step.ok === false ? <i aria-hidden="true">x</i> : null}
            </div>
          );
        })}
      </div>
      <div className={`pg-verdict ${verdict}`} role="status">
        {step.ok === true ? "gcd is 1: the value fits" : step.ok === false ? "gcd is above 1: the value is rejected" : "Checking gcd(position, value) for each unused value"}
      </div>
      <output aria-label="Permutation count" className="pg-count">{`Qualifying permutations so far: ${step.count}`}</output>
    </section>
  );
}
