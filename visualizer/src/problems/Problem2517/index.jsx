import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the prices and set the search bounds.' },
    { id: 'probe', label: 'Test gap', description: 'Greedily count candies that are at least the candidate gap apart.' },
    { id: 'done', label: 'Answer', description: 'Report the largest gap that still gives k candies.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with price (array of 2 to 12 integers, 1 to 50) and k (JSON)',
  url: 'https://leetcode.com/problems/maximum-tastiness-of-candy-basket/',
  complexity: 'O(n log n + n log(max price)) time. The visualization caps the input at 12 prices.',
  examples: [
    { label: 'Example 1', input: '{"price":[13,5,1,8,21,2],"k":3}' },
    { label: 'Example 2', input: '{"price":[1,3,1],"k":2}' },
  ],
}

export default function MaximumTastiness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Gap search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Sorted prices" length={run.sorted.length} valueAt={i => run.sorted[i]} roleAt={i => (step.picked || []).includes(i) ? 'picked' : ''} />
  </>} renderReasoning={() => <>
    <p>If k candies can be spaced at least g apart, the greedy choice of always taking the next price that is at least g above the last one finds as many as possible.</p>
    <p>A larger gap never makes the count larger, so the feasible gaps form a prefix and binary search applies.</p>
  </>} />
}
