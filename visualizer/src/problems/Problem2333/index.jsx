import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2333',
  phases: [
    { id: 'setup', label: 'Differences', description: 'Take the absolute difference of each pair.' },
    { id: 'search', label: 'Search', description: 'Binary search the largest difference that is left after spending the operations.' },
    { id: 'cap', label: 'Cap', description: 'Lower every larger difference to the threshold.' },
    { id: 'reduce', label: 'Spend', description: 'Spend the leftover operations one at a time below the threshold.' },
    { id: 'done', label: 'Result', description: 'Return the sum of squared differences.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums1": [3, 8, 5], "nums2": [1, 7, 9], "k1": 1, "k2": 2}',
  url: 'https://leetcode.com/problems/minimum-sum-of-squared-difference/',
  complexity: 'O(n log V) time for n differences and value range V, and O(n) space. The search finds the threshold without simulating each operation.',
  examples: [
    { label: 'Example', input: '{"nums1":[3,8,5],"nums2":[1,7,9],"k1":1,"k2":2}' },
    { label: 'Already equal', input: '{"nums1":[2,5,7],"nums2":[2,5,7],"k1":4,"k2":3}' },
  ],
}

export default function SquaredDifferenceVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = step.diffs.length
    const maxD = Math.max(...step.diffs, 1)
    return <>
      <IndexedSequence label="differences" length={n} valueAt={i => (step.capped ? step.capped[i] : step.diffs[i])} active={step.at ?? -1}
        roleAt={i => (step.capped && step.capped[i] !== step.diffs[i] ? 'reduced' : step.phase === 'search' && step.diffs[i] > step.t ? 'above' : '')} />
      {step.lo >= 0 && step.hi >= 0 && <AnswerRangeBar title="Threshold search" min={0} max={maxD} low={step.lo} high={step.hi} probe={step.t >= 0 ? step.t : null} verdict={step.verdict} />}
      <output aria-label="Operations left">{`${step.remaining} operation${step.remaining === 1 ? '' : 's'} left (${run.input.k1 + run.input.k2} in total)`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Only the differences matter. Operations should always go to the largest difference, which means lowering everything above one threshold t.</p>
    <p>Binary search finds the smallest threshold whose cost fits the budget. Leftover operations then lower some differences that sit exactly at the threshold by one more.</p>
  </>} />
}
