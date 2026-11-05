import IndexedSequence from '../../components/shared/IndexedSequence'

// The clock digits as cells; the hidden digits are filled in as the trace goes.
export default function View({ run, step }) {
  const t = step.snapshot.t
  const cells = t.filter(c => c !== ':')
  return <div className="clock-view">
    <IndexedSequence label="Clock digits (HH:MM)" length={5} active={step.index}
      valueAt={i => (i === 2 ? ':' : t[i])}
      roleAt={i => (i === 2 ? '' : run.input[i] === '?' ? (t[i] !== '?' ? 'filled' : 'hidden') : 'given')} />
    <p>Given: {run.input}</p>
    <p>{step.message}</p>
  </div>
}
