import IndexedSequence from '../../components/shared/IndexedSequence'

// Each rectangle's square side in order; the largest side so far is marked.
export default function View({ run, step }) {
  const sides = step.snapshot.sides
  const shownUpTo = step.phase === 'done' ? sides.length - 1 : step.index
  return <div className="square-view">
    <IndexedSequence label="Square side per rectangle" length={sides.length} active={step.index}
      valueAt={i => (i <= shownUpTo ? sides[i] : '…')}
      roleAt={i => (i <= shownUpTo && sides[i] === step.snapshot.maxSide ? 'largest so far' : '')} />
    <p>Largest side {step.snapshot.maxSide}; rectangles with it: {step.snapshot.count}</p>
    <p>{step.message}</p>
  </div>
}
