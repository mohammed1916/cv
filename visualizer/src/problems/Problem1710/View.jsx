import IndexedSequence from '../../components/shared/IndexedSequence'

// Box types in the sorted order with the boxes loaded from each, and the room left on the truck.
export default function View({ run, step }) {
  const { truckSize } = run.input
  const sorted = step.sorted ?? []
  const loaded = step.snapshot.loaded
  return <div className="truck-view">
    <IndexedSequence
      label="Box types in sorted order, by units per box"
      length={sorted.length}
      active={step.index >= 0 ? step.index : -1}
      valueAt={i => sorted[i][1]}
      roleAt={i => (loaded[i] ? `took ${loaded[i].take}` : '')}
    />
    <table aria-label="Box types by units per box">
      <thead><tr><th>Boxes</th><th>Units per box</th><th>Loaded</th></tr></thead>
      <tbody>{sorted.map(([count, per], i) => <tr key={i} className={step.index === i ? 'is-current' : ''}>
        <td>{count}</td><td>{per}</td><td>{loaded[i] ? loaded[i].take : ''}</td>
      </tr>)}</tbody>
    </table>
    <div className="truck-view__bar" role="img" aria-label={`Truck room left ${step.snapshot.left} of ${truckSize}`}>
      <div style={{ width: `${((truckSize - step.snapshot.left) / truckSize) * 100}%` }} />
    </div>
    <p>Units so far: {step.snapshot.units}. Room left: {step.snapshot.left} of {truckSize}.</p>
    <p>{step.message}</p>
  </div>
}
