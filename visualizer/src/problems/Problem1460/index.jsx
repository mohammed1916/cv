import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: '1460',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with target and arr (JSON)',
  url: 'https://leetcode.com/problems/make-two-arrays-equal-by-reversing-subarrays/',
  complexity: 'O(n) expected time and O(n) space: one tally pass over each array and one check of the balances.',
  examples: [
    { label: 'Reordered', input: '{"target":[1,2,3,4],"arr":[2,4,1,3]}' },
    { label: 'Repeated value', input: '{"target":[5,1,5,2],"arr":[2,5,1,1]}' },
    { label: 'Equal', input: '{"target":[3],"arr":[3]}' },
    { label: 'One element', input: '{"target":[1],"arr":[1]}' },
    { label: 'Already in order', input: '{"target":[2,5],"arr":[2,5]}' },
    { label: 'Largest: 30 values reversed', input: '{"target":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],"arr":[20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]}' },
    { label: 'Long run: 20 values shuffled', input: '{"target":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],"arr":[7,14,17,15,9,2,20,16,6,12,19,13,18,3,10,1,4,5,11,8]}' },
  ],
}

const sign = n => (n > 0 ? `+${n}` : String(n))

export default function ReverseToEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { entries, side, index, mismatch } = step.snapshot
    const { target, arr } = run.input
    const sorted = [...entries].sort((a, b) => a.value - b.value)
    return <>
      <IndexedSequence label="target" length={target.length} valueAt={i => target[i]} active={side === 'target' ? index : -1} />
      <IndexedSequence label="arr" length={arr.length} valueAt={i => arr[i]} active={side === 'arr' ? index : -1} />
      <p>{side === null ? 'Balances after the passes so far.' : `Reading ${side === 'target' ? 'target' : 'arr'}[${index}].`}</p>
      <table aria-label="Balance per value" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>value</th><th>target minus arr so far</th><th>zero?</th></tr></thead>
        <tbody>
          {sorted.length === 0 && <tr><td colSpan={3}>no values yet</td></tr>}
          {sorted.map(({ value, count }) => <tr key={value} style={{
            background: mismatch && mismatch.value === value ? 'var(--surface2)' : 'transparent',
          }}>
            <td style={{ padding: '2px 10px' }}>{value}</td>
            <td style={{ padding: '2px 10px', textAlign: 'right' }}>{sign(count)}</td>
            <td style={{ padding: '2px 10px' }}>{count === 0 ? 'yes' : 'no'}</td>
          </tr>)}
        </tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Why order is free:</strong> reversing a two-element subarray swaps neighbours, and neighbouring swaps can produce any arrangement.</p>
    <p><strong>What must match:</strong> how many times each value appears. A single balance per value captures this, so every balance must end at zero.</p>
  </>} />
}
