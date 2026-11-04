import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1300',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr and target (JSON)',
  url: 'https://leetcode.com/problems/sum-of-mutated-array-closest-to-target/',
  complexity: 'O(n log M) time, where M is the largest element, and O(1) extra space beyond the input.',
  examples: [
    { label: 'Exact hit', input: '{"arr":[1,5,9,2],"target":14}' },
    { label: 'Below the top', input: '{"arr":[2,3,5],"target":10}' },
    { label: 'Tie goes lower', input: '{"arr":[7,7],"target":9}' },
  ],
}

export default function ClosestCap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, target, low, high, mid, midSum, lowSum, belowSum } = step.snapshot
    return <>
      <div role="img" aria-label="Array with cap applied" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, i) => {
          const capped = mid === null ? value : Math.min(value, mid)
          return <div key={i} style={{ minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: '#1c1917', background: mid !== null && value > mid ? '#fde68a' : 'transparent' }}>
            <div>{capped}</div><small>was {value}</small>
          </div>
        })}
      </div>
      <AnswerRangeBar title="Cap search" min={0} max={Math.max(...run.input.arr)} low={low} high={high}
        probe={mid} verdict={mid !== null ? midSum >= target : null} />
      <p>Search range: {low} to {high}{mid !== null ? ` · probe ${mid} gives sum ${midSum}` : ''}</p>
      <p>Target {target}{lowSum !== undefined && lowSum !== null ? ` · cap ${low} sums to ${lowSum}` : ''}{belowSum !== undefined && belowSum !== null ? ` · cap ${low - 1} sums to ${belowSum}` : ''}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Monotone sums:</strong> raising the cap never lowers the sum, so the first cap reaching the target is found by binary search.</p>
    <p><strong>Two candidates:</strong> the answer is that cap or the one directly below it. Ties go to the smaller cap.</p>
    <p>{step.message}</p>
  </>} />
}
