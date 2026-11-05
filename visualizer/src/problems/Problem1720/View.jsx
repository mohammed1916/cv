import IndexedSequence from '../../components/shared/IndexedSequence'

// The encoded values between neighbouring cells, with the decoded array built left to right.
export default function View({ run, step }) {
  const { encoded } = run.input
  const arr = step.snapshot.arr
  return <div className="xor-view">
    <IndexedSequence label="Decoded array" length={arr.length} active={step.index}
      valueAt={i => arr[i]} roleAt={i => (i > 0 && i <= encoded.length ? `⊕ ${encoded[i - 1]}` : 'first')} />
    <p>Encoded: [{encoded.join(', ')}]</p>
    <p>{step.message}</p>
  </div>
}
