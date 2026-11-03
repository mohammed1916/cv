import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1539', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr and k (JSON)',
  url: 'https://leetcode.com/problems/kth-missing-positive-number/',
  complexity: 'O(log n) time and O(1) space: binary search on the non-decreasing count of missing positives.',
  examples: [
    { label: 'Gap early', input: '{"arr":[2,3,4,7,11],"k":5}' },
    { label: 'Before first', input: '{"arr":[5,6,7],"k":2}' },
    { label: 'After last', input: '{"arr":[1,2,3],"k":3}' },
  ],
}

export default function KthMissingPositive() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr } = run.input
    const { lo, hi, mid } = step.snapshot
    return <>
      <div role="img" aria-label="Array values with missing counts" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, i) => {
          const inWindow = i >= lo && i < hi
          return <div key={i} data-index={i} style={{
            minWidth: 70, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${i === mid ? 2 : 1}px solid ${i === mid ? 'var(--text)' : 'var(--border)'}`,
            background: i === mid ? 'var(--surface2)' : 'transparent', color: 'var(--text)', opacity: inWindow ? 1 : 0.45,
          }}><div>{value}</div><small>missing {value - (i + 1)}</small><small>index {i}</small></div>
        })}
      </div>
      <p>{`Candidate window: indices ${lo} to ${Math.max(lo, hi - 1)}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count before each value:</strong> arr[i] - (i + 1) positives are missing before index i. This count never decreases.</p>
    <p><strong>Search the boundary:</strong> find the first index whose count reaches k. Exactly that many array values lie below the answer, so the answer is lo + k.</p>
  </>} />
}
