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

export default function SubsequenceSumCondition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, left, right, add, total, sum } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted values with pointers" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((value, i) => {
          const active = i === left || i === right
          return <div key={i} data-index={i} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
            background: i >= left && i <= right ? 'var(--surface2)' : 'transparent',
          }}><div>{value}</div><small>{i === left ? 'left' : ''}{i === right ? (i === left ? ' / right' : 'right') : ''}</small></div>
        })}
      </div>
      <p>{sum === null ? 'Window is closed.' : `Sum of the two ends: ${sum}`}</p>
      <p>{add === null ? `Running total: ${total}` : `Added 2^${right - left} = ${add}. Running total: ${total}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Fix the minimum:</strong> after sorting, the smallest chosen value is the left end. If the ends sum to at most the target, every subset of the values in between (with the right end allowed) is valid.</p>
    <p><strong>Why powers of two:</strong> the count between two positions is 2 to the power of their distance, so the sum is built without enumerating subsets.</p>
  </>} />
}
