import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1608',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/special-array-with-x-elements-greater-than-or-equal-x/',
  complexity: 'O(n * n) time for a direct count of each candidate, and O(1) extra space.',
  examples: [
    { label: 'Answer 3', input: '[1,9,2,0,5,5]' },
    { label: 'No answer', input: '[0,0,0]' },
    { label: 'Length answer', input: '[7,7,7,7,7,7,7]' },
  ],
}

export default function SpecialValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, x, count } = step.snapshot
    return <>
      <div role="img" aria-label="Array values compared with the candidate" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((value, i) => {
          const counted = x !== null && value >= x
          return <div key={i} style={{
            minWidth: 44, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
            border: `1px solid ${counted ? 'var(--text)' : 'var(--border)'}`,
            background: counted ? '#bbf7d0' : 'transparent', color: '#1c1917',
          }}>{value}</div>
        })}
      </div>
      <p>{x === null ? 'Candidates run from 0 to the array length.' : `Candidate x = ${x}. Green entries are at least x.`}</p>
      <p>{count === null ? 'No count yet.' : `Count of entries at least x: ${count}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Bounded candidates:</strong> the answer cannot exceed the number of entries, so only 0 to n need checking.</p>
    <p><strong>Exact match:</strong> a candidate works only when the count of qualifying entries equals the candidate itself.</p>
  </>} />
}
