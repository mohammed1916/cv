import PointerRail from '../../components/shared/PointerRail'
import './ExpressionStackView.css'

// The expression as characters: consumed text is shaded and the cursor sits on the next character.
// Open calls appear as nested boxes, outermost first, with the arguments read so far.
export default function ExpressionStackView({ run, step }) {
  if (!run || !step) return <section className="es-view"><p className="es-empty">Press Play to parse the expression left to right.</p></section>
  const text = run.input
  return (
    <section className="es-view" aria-label="Expression parse">
      <PointerRail
        title="Expression characters"
        values={[...text]}
        pointers={step.pos < text.length ? [{ id: 'pos', index: step.pos, label: 'pos', tone: 'primary' }] : []}
        note="Characters before pos are already read; pos is the next character to read."
      />
      <div className="es-stack" aria-label="Open calls">
        {step.stack.length === 0 ? <span className="es-none">no call is open</span> : null}
        {step.stack.map((frame, depth) => (
          <div key={depth} className="es-frame" style={{ marginLeft: depth * 14 }}>
            <span className="es-op">{`${frame.op}(`}</span>
            {frame.args.map((value, index) => <span key={index} className="es-arg">{`arg ${index + 1} = ${value}`}</span>)}
            {frame.args.length < 2 ? <span className="es-pending">{frame.args.length === 0 ? 'reading first argument' : 'reading second argument'}</span> : null}
          </div>
        ))}
      </div>
      <div className="es-readout">
        <span>{step.value === null || step.value === undefined ? `cursor at ${step.pos}` : `value ${step.value}`}</span>
        <span>{step.message}</span>
      </div>
      <p className="es-key">Literals are signed integers. Each call takes two arguments separated by a comma, and division is exact.</p>
    </section>
  )
}
