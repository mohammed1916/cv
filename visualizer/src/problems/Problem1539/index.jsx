import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
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
    { label: 'Single value', input: '{"arr":[1],"k":1}' },
    { label: 'Dense values', input: '{"arr":[1,2,3,4],"k":2}' },
    { label: 'Largest: 60 values, k 100', input: '{"arr":[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58,61,64,67,70,73,76,79,82,85,88,91,94,97,100,103,106,109,112,115,118,121,124,127,130,133,136,139,142,145,148,151,154,157,160,163,166,169,172,175,178],"k":100}' },
    { label: 'Long run: 30 values', input: '{"arr":[10,30,32,43,55,57,60,61,62,70,80,89,99,106,109,116,117,122,128,129,131,133,138,142,156,173,180,181,190,197],"k":40}' },
  ],
}

export default function KthMissingPositive() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr } = run.input
    const { lo, hi, mid, missing, k } = step.snapshot
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
      <AnswerRangeBar title="Index search range (first index whose missing count reaches k)" min={0} max={arr.length} low={lo} high={hi}
        probe={mid !== null && mid !== undefined ? mid : null} verdict={missing !== null && missing !== undefined && missing >= k} />
      <p>{`Candidate window: indices ${lo} to ${Math.max(lo, hi - 1)}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count before each value:</strong> arr[i] - (i + 1) positives are missing before index i. This count never decreases.</p>
    <p><strong>Search the boundary:</strong> find the first index whose count reaches k. Exactly that many array values lie below the answer, so the answer is lo + k.</p>
  </>} />
}
