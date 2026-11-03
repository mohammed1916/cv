import './BitOracleView.css'

const WIDTH = 30

export default function BitOracleView({ step }) {
  const bits = Array.from({ length: WIDTH }, (_, i) => i)
  const probed = step.bit
  return (
    <div className="bov">
      <div className="bov__probe" aria-label="Oracle query">
        <span className="bov__label">Query</span>
        <code>{step.phase === 'start' || step.phase === 'done' ? 'no query yet' : `commonSetBits(${step.num}) = ${step.reply}`}</code>
      </div>
      <ol className="bov__strip" aria-label="Bit positions of the hidden number">
        {bits.map(i => {
          const known = i <= probed
          const isOne = known && step.answer & (1 << i)
          const state = i === probed ? 'current' : known ? (isOne ? 'one' : 'zero') : 'pending'
          return (
            <li key={i} className={`bov__bit bov__bit--${state}`}>
              <span className="bov__pos">{i}</span>
              <span className="bov__digit">{known ? (isOne ? '1' : '0') : '?'}</span>
            </li>
          )
        })}
      </ol>
      <p className="bov__legend"><span className="bov__swatch bov__swatch--one" />found one <span className="bov__swatch bov__swatch--zero" />found zero <span className="bov__swatch bov__swatch--current" />probing now</p>
      <p className="bov__answer" role="status">answer so far: {step.answer} ({step.answer.toString(2).padStart(WIDTH, '0').slice(-10)} in the low 10 bits)</p>
    </div>
  )
}
