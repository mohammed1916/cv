import HeapView from '../../components/shared/HeapView'
import IndexedSequence from '../../components/shared/IndexedSequence'

// Buildings with the current position, and the heap of climbs that are covered by ladders.
export default function View({ run, step }) {
  const { heights } = run.input
  const index = step.index ?? 0
  return <div className="furthest-building-view">
    <IndexedSequence label="Building heights" length={heights.length} active={index}
      valueAt={i => heights[i]} roleAt={i => (i < index ? 'passed' : '')} />
    <HeapView title="Climbs held by ladders (smallest on top)" items={step.snapshot.heap} ops={[]} order="min" />
    <dl>
      <dt>Bricks left</dt><dd>{step.snapshot.bricks}</dd>
      <dt>Ladders</dt><dd>{step.snapshot.ladders}</dd>
    </dl>
    <p>{step.message}</p>
  </div>
}
