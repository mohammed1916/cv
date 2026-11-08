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
    { label: 'Five prices, k three', input: '{"price":[10,30,5,40,8],"k":3}' },
    { label: 'Four equal prices', input: '{"price":[7,7,7,7],"k":2}' },
    { label: 'Two candy types', input: '{"price":[1,2],"k":2}' },
    { label: 'Equal prices', input: '{"price":[5,5,5],"k":3}' },
    { label: 'Largest basket, widest range', input: '{"price":[1,50,2,49,3,48,4,47,5,46,6,45],"k":12}' },
    { label: 'Long run: 12 prices', input: '{"price":[10,2,4,39,41,7,32,7,41,24,20,27],"k":4}' },
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
