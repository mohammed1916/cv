import IndexedSequence from '../../components/shared/IndexedSequence'

// The encoded values between neighbouring positions and the permutation built so far.
export default function View({ run, step }) {
  const encoded = run.input
  const perm = step.snapshot.perm
  return <div className="xor-perm-view">
    <IndexedSequence label="Permutation so far" length={run.input.length + 1} active={step.index}
      valueAt={i => (i < perm.length ? perm[i] : '…')} roleAt={i => (i > 0 && i - 1 < encoded.length ? `⊕ ${encoded[i - 1]}` : 'start')} />
    <p>Encoded: [{encoded.join(', ')}]</p>
    <p>{step.message}</p>
  </div>
}
