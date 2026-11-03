import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '1588',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with arr (JSON)',
  url: 'https://leetcode.com/problems/sum-of-all-odd-length-subarrays/',
  complexity: 'O(n) time and O(1) extra space: each value is weighted by its coverage count.',
  examples: [
    { label: 'Sample A', input: '{"arr":[2,1,3]}' },
    { label: 'Mixed signs', input: '{"arr":[-4,5,-1,2]}' },
    { label: 'Single value', input: '{"arr":[7]}' },
  ],
}

export default function OddLengthSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr } = run.input
    const { i, left, right, odd, total } = step.snapshot
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, k) => <div key={k} data-index={k} style={{
          minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${k === i ? 2 : 1}px solid ${k === i ? 'var(--text)' : 'var(--border)'}`,
          background: k < i ? 'var(--surface2)' : 'transparent', color: '#1c1917',
        }}><div>{value}</div><small>{k}</small></div>)}
      </div>
      <p>{i < 0 ? 'No position is active yet.' : `Position ${i}: starts ${left}, ends ${right}, odd-length cover ${odd}.`}</p>
      <p>Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count per position:</strong> a position is covered by left x right subarrays. About half of them, rounded up, have odd length.</p>
    <p><strong>Why it works:</strong> the total is the sum of each value multiplied by its coverage, so one pass is enough.</p>
  </>} />
}
