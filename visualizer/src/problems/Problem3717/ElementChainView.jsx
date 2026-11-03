import './ElementChainView.css'

// Original values sit on top. Each layer shows the cheapest candidate values for the current element;
// the final row shows the chain read back from the chosen end value.
export default function ElementChainView({ run, step }) {
  if (!run || !step) return <section className="ec-view"><p className="ec-empty">Press Play to build the cheapest chain.</p></section>
  const nums = run.input
  const finalChain = step.chosen
  const maxValue = Math.max(step.limit || 1, ...nums)
  const bar = value => ({ height: `${Math.max(6, (value / maxValue) * 100)}%` })
  const layerIndex = step.layer
  return (
    <section className="ec-view" aria-label="Element chain search">
      <div className="ec-row" aria-label="Original values">
        <span className="ec-label">original</span>
        {nums.map((value, index) => (
          <div key={index} className={`ec-cell ${index === layerIndex && !finalChain ? 'ec-cell--current' : ''}`}>
            <div className="ec-bar" style={bar(value)} />
            <span className="ec-value">{value}</span>
            <span className="ec-index">{index}</span>
          </div>
        ))}
      </div>
      {finalChain ? (
        <div className="ec-row" aria-label="Chosen final array">
          <span className="ec-label">chosen</span>
          {finalChain.map((value, index) => (
            <div key={index} className="ec-cell ec-cell--chosen">
              <div className="ec-bar ec-bar--chosen" style={bar(value)} />
              <span className="ec-value">{value}</span>
              <span className="ec-index">{`+${value - nums[index]}`}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="ec-candidates" aria-label="Cheapest candidates for this element">
        <span className="ec-label">{finalChain ? 'end values' : `candidates for element ${layerIndex}`}</span>
        {step.candidates.length === 0 ? <span className="ec-none">none reachable</span> : step.candidates.map(c => (
          <span key={c.value} className="ec-chip">{`${c.value} costs ${c.cost}`}</span>
        ))}
      </div>
      <p className="ec-readout">{step.total !== null && step.total !== undefined ? `Minimum operations: ${step.total}` : `Limit for candidate values: ${step.limit}`}</p>
      <p className="ec-key">Each value must divide into the next: the next chosen value is a multiple of this one. Bars show value height; the plus sign shows operations spent.</p>
    </section>
  )
}
