import './XorPrefixView.css'

const bits = (value) => value.toString(2).padStart(4, '0')

// Each prefix XOR is a cell with its binary form. The start prefix is outlined indigo,
// the end prefix violet, and the pair's XOR is shaded when it reaches k.
export default function XorPrefixView({ run, step }) {
  return <div className="xor-prefix" style={{ '--accent': '#4338ca' }}>
    <ol className="xor-prefix__row" aria-label="Prefix XOR values">
      {step.prefix.map((value, index) => {
        let role = ''
        if (index === step.i) role = 'start'
        if (index === step.j) role = 'end'
        if (index === step.j && step.value !== null && step.value !== undefined && step.phase === 'hit') role = 'hit'
        return <li key={index} className="xor-prefix__cell" data-role={role || undefined}>
          <span>prefix[{index}]</span>
          <strong>{value}</strong>
          <code>{bits(value)}</code>
        </li>
      })}
    </ol>
    <p className="xor-prefix__readout">
      {step.value !== null && step.value !== undefined
        ? `XOR = ${step.value} (${bits(step.value)}) against k = ${run.input.k}`
        : `k = ${run.input.k}`} · Count: {step.count}
    </p>
    <p>{step.message}</p>
  </div>
}
