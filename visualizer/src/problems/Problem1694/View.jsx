import IndexedSequence from '../../components/shared/IndexedSequence'

// The digits as cells, coloured by the block they land in, with the blocks built so far.
export default function View({ run, step }) {
  const { digits, blocks } = run
  const placed = step.snapshot.blocks ?? []
  const blockOf = []
  let pos = 0
  placed.forEach((b, k) => { for (let j = 0; j < b.length; j++) blockOf[pos++] = k + 1 })
  return <div className="phone-view">
    <IndexedSequence label="Digits left after removing spaces and dashes" length={digits.length} active={-1}
      valueAt={i => digits[i]} roleAt={i => (blockOf[i] ? `block ${blockOf[i]}` : 'pending')} />
    <ol aria-label="Blocks so far" className="phone-view__blocks">
      {placed.map((b, k) => <li key={k}>{b}</li>)}
    </ol>
    <p>{step.phase === 'done' ? `Result ${step.result} from ${blocks.length} blocks.` : step.message}</p>
  </div>
}
