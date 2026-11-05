import IndexedSequence from '../../components/shared/IndexedSequence'

// The altitude after each point of the trip, with the highest one marked.
export default function View({ run, step }) {
  const altitudes = step.snapshot.altitudes
  const highest = step.snapshot.highest
  return <div className="altitude-view">
    <IndexedSequence label="Altitude at each point" length={altitudes.length} active={step.index}
      valueAt={i => altitudes[i]} roleAt={i => (altitudes[i] === highest ? 'highest' : '')} />
    <p>Gains: [{run.input.join(', ')}]</p>
    <p>{step.message}</p>
  </div>
}
