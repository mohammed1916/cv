import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '167',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sorted numbers and target (JSON)',
  url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  complexity: 'O(n) time and O(1) extra space: each pointer moves at most n times, since the array is sorted.',
  examples: [
    { label: 'Sample A', input: '{"numbers":[1,3,4,6,9],"target":10}' },
    { label: 'Duplicates', input: '{"numbers":[2,2,5,7],"target":4}' },
    { label: 'No pair', input: '{"numbers":[1,2,4,8],"target":100}' },
  ],
}

export default function TwoSumSorted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { left, right, total, target } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted numbers" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.numbers.map((value, i) => <div key={i} style={{
          minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === left || i === right ? 2 : 1}px solid ${i === left || i === right ? 'var(--text)' : 'var(--border)'}`,
        }}><div>{value}</div><small>{i + 1}{i === left ? ' L' : ''}{i === right ? ' R' : ''}</small></div>)}
      </div>
      <p>Target {target}{total !== null && total !== undefined ? `, current sum ${total}` : ''}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Why two pointers:</strong> if the sum is too small, the left value is the problem, since every value to its right is at least as large. Moving the left pointer is therefore safe.</p>
    <p><strong>Symmetric move:</strong> if the sum is too large, the right pointer moves left, and nothing to its left can be a partner for the discarded value.</p>
  </>} />
}
