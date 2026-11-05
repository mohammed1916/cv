import IndexedSequence from '../../components/shared/IndexedSequence'

// The chain walked so far: cells in order, with the current value marked.
export default function View({ run, step }) {
  const out = step.out ?? []
  return <div className="chain-view">
    <IndexedSequence label="Restored chain" length={Math.max(out.length, 1)} active={out.length - 1}
      valueAt={i => out[i] ?? ''} roleAt={i => (i === 0 ? 'start' : '')} />
    <p>Pairs: {run.input.map(([a, b]) => `${a}-${b}`).join(', ')}</p>
    <p>{step.message}</p>
  </div>
}
