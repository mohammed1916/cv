import IndexedSequence from '../../components/shared/IndexedSequence'
import './KthStreamView.css'

// Stream row: each added score is kept or ignored; the row is drawn by the shared IndexedSequence. The kept set is shown below as a stack lane in index.jsx.
export default function KthStreamView({ run, step }) {
  const { k, adds } = run.input
  const shown = step.op === null || step.op === undefined ? -1 : step.op
  const roleAt = (i) => {
    if (i > shown) return 'waiting'
    if (i === shown) return step.kept ? 'kept now' : 'ignored now'
    return run.frames[i + 1]?.kept ? 'kept' : 'ignored'
  }
  return (
    <figure className="kth-view">
      <IndexedSequence label={`Stream (k = ${k})`} length={adds.length} valueAt={(i) => adds[i]} active={shown} roleAt={roleAt} />
      {step.evicted !== null && step.evicted !== undefined && <p className="kth-chip kth-chip--dropped">{step.evicted} out</p>}
      <figcaption>Kept values sit in ascending order. The first one is the kth largest, so a new value only matters if it beats it.</figcaption>
    </figure>
  )
}
