import './FlipCounterView.css'

const WIDTH = 30

export default function FlipCounterView({ step }) {
  const bits = Array.from({ length: WIDTH }, (_, i) => WIDTH - 1 - i)
  const probed = step.bit
  const ones = step.ones ?? 0
  const query = probed < 0
    ? (step.phase === 'done' ? 'finished' : 'commonBits(0) counted the zero bits')
    : `commonBits(${step.num}) = ${step.reply}`
  return (
    <div className="fcv">
      <div className="fcv__probe">
        <span className="fcv__label">Query</span>
        <code>{query}</code>
      </div>
      <div className="fcv__meter" aria-label="Count of one bits in the current state">
        <span className="fcv__label">One bits now</span>
        <span className="fcv__track"><span className="fcv__fill" style={{ width: `${(ones / WIDTH) * 100}%` }} /></span>
        <strong>{ones} of {WIDTH}</strong>
      </div>
      <ol className="fcv__strip" aria-label="Bit positions 29 down to 0">
        {bits.map(i => {
          const known = probed >= 0 && i <= probed
          const one = known && (step.answer & (1 << i)) !== 0
          const state = i === probed ? 'current' : known ? (one ? 'one' : 'zero') : 'pending'
          return (
            <li key={i} className={`fcv__bit fcv__bit--${state}`}>
              <span className="fcv__pos">{i}</span>
              <span className="fcv__digit">{known ? (one ? '1' : '0') : '?'}</span>
            </li>
          )
        })}
      </ol>
      <p className="fcv__note" role="status">{step.message}</p>
    </div>
  )
}
