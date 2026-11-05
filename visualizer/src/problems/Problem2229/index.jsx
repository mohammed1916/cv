import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2229',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty set of values seen.' },
    { id: 'scan', label: 'Read', description: 'Read the next value.' },
    { id: 'add', label: 'Record', description: 'Record a new value and update the smallest and largest.' },
    { id: 'duplicate', label: 'Repeat', description: 'A value repeats, so the array cannot be consecutive.' },
    { id: 'span', label: 'Span', description: 'Compare the span with the number of values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 3, 4, 2]}',
  url: 'https://leetcode.com/problems/check-if-an-array-is-consecutive/',
  complexity: 'O(n) time and O(n) space for n values. The visualization caps arrays at 40 values from 0 to 100.',
  examples: [
    { label: 'Consecutive', input: '{"nums":[4,2,5,3]}' },
    { label: 'Gap', input: '{"nums":[7,9]}' },
    { label: 'Repeat', input: '{"nums":[2,2,4]}' },
  ],
}

export default function CheckConsecutive() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    const lo = step.mi ?? nums.reduce((a, b) => Math.min(a, b), Infinity)
    const hi = step.mx ?? nums.reduce((a, b) => Math.max(a, b), -Infinity)
    const cells = hi - lo + 1
    const shown = cells <= 60
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.at}
        roleAt={i => (step.phase === 'duplicate' && i === step.at ? 'duplicate' : i < step.at ? 'seen' : '')} />
      {shown && <section aria-label="Value span">
        <h3>Values from smallest to largest</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: cells }, (_, k) => {
            const v = lo + k
            const present = step.seen.includes(v)
            return <span key={v} style={{ minWidth: 28, textAlign: 'center', padding: '4px 2px', borderRadius: 6, border: '1px solid var(--border, var(--surface2))', background: present ? 'var(--primary)' : 'var(--surface2)', color: present ? 'var(--surface)' : 'var(--text)', opacity: present ? 1 : 0.7 }}>{v}</span>
          })}
        </div>
        <p>Filled cells are values seen so far. A gap inside the span means a missing value.</p>
      </section>}
      <output aria-label="Span check">{`span ${cells} for ${nums.length} values`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>An array is consecutive when its values are all different and they fill an interval with no gap. If the values are distinct, the span from smallest to largest equals the count exactly when there are no gaps.</p>
    <p>A repeated value fails at once, because a repeat cannot fit a list of distinct integers, even when the span happens to match.</p>
  </>} />
}
