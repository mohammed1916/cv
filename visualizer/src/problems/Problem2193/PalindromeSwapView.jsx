import IndexedSequence from '../../components/shared/IndexedSequence'

// The letters are drawn with l and r pointers. Letters already settled outside [l, r] are marked.
export default function PalindromeSwapView({ run, step }) {
  const n = run.input.s.length
  const roleAt = index => (index === step.l ? 'l' : index === step.r ? 'r' : index < step.l || index > step.r ? 'settled' : '')
  return (
    <div className="palindrome-swap-view">
      <IndexedSequence label="letters being rearranged" length={n} valueAt={index => step.cs[index]} active={step.l ?? -1} roleAt={roleAt} />
      <p>Moves so far: <strong>{step.ans}</strong>. The middle of the string is at index {Math.floor(n / 2)}.</p>
      {step.moved !== undefined && <p>The match moved {step.moved} step(s) to the right end.</p>}
      {step.cost !== undefined && <p>The odd letter moved {step.cost} step(s) toward the middle.</p>}
    </div>
  )
}
