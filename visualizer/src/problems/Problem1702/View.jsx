import IndexedSequence from '../../components/shared/IndexedSequence'

// The input bits with the first zero and the lone zero's target marked; the output is shown as it is built.
export default function View({ run, step }) {
  const bits = run.input
  const { first, p } = step.snapshot
  const target = p ?? -1
  const out = step.phase === 'done' ? run.result : ''
  return <div className="binary-view">
    <IndexedSequence label="Input bits" length={bits.length} active={step.index >= 0 ? step.index : -1}
      valueAt={i => bits[i]} roleAt={i => (i === first ? 'first 0' : '')} />
    {step.phase === 'place' || step.phase === 'done' ? <IndexedSequence label="Output bits" length={bits.length} active={target}
      valueAt={i => (out ? out[i] : (i === target ? '0' : '1'))} roleAt={i => (i === target ? 'lone 0' : '')} /> : null}
    <p>{step.message}</p>
  </div>
}
