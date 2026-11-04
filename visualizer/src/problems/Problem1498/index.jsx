import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1498',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (JSON)',
  url: 'https://leetcode.com/problems/number-of-subsequences-that-satisfy-the-given-sum-condition/',
  complexity: 'O(n log n) time for the sort, then O(n) two-pointer time, with O(n) space for powers of two.',
  examples: [
    { label: 'Sample A', input: '{"nums":[2,6,4,1,9],"target":8}' },
    { label: 'Equal values', input: '{"nums":[1,1,1],"target":2}' },
    { label: 'Wide spread', input: '{"nums":[5,10,20,40],"target":30}' },
  ],
}

const ACCEPTED = 'color-mix(in srgb, var(--success) 35%, var(--surface2))'
const REJECTED = 'color-mix(in srgb, var(--warning) 35%, var(--surface2))'

export default function SubsequenceSumCondition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, left, right, add, total, sum } = step.snapshot
    const closed = left > right
    return <>
      <section aria-label="Sorted values with pointers">
        <h3>Sorted values: l and r move toward each other</h3>
        <div role="img" aria-label="Sorted values with pointers" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sorted.map((value, i) => {
            const inWindow = !closed && i >= left && i <= right
            return <div key={i} data-index={i} style={{
              minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
              border: `${i === left || i === right ? 2 : 1}px solid ${i === left || i === right ? 'var(--text)' : 'var(--border)'}`,
              background: sum === null ? 'transparent' : inWindow ? (add === null ? REJECTED : ACCEPTED) : 'var(--surface)',
              opacity: inWindow || sum === null ? 1 : 0.55,
            }}>
              <div>{value}</div>
              <small style={{ display: 'block', height: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                {!closed && i === left ? 'l' : ''}{!closed && i === right ? 'r' : ''}
              </small>
            </div>
          })}
        </div>
      </section>
      <p>{sum === null ? 'Pointers are set at the two ends.' : closed ? 'The pointers have crossed, so every left index has been considered.' : `l + r ends sum to ${sum}, compared with target.`}</p>
      <p>{add === null ? `Running total: ${total}` : `Counted 2^${right - left} = ${add} subsequences that include l and r. Running total: ${total}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Fix the minimum:</strong> after sorting, the smallest chosen value is the left end. If the ends sum to at most the target, every subset of the values in between (with the right end allowed) is valid.</p>
    <p><strong>Why powers of two:</strong> the count between two positions is 2 to the power of their distance, so the sum is built without enumerating subsets.</p>
  </>} />
}
