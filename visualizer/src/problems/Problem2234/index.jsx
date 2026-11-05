import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2234',
  phases: [
    { id: 'setup', label: 'Sort', description: 'Sort the gardens by flower count.' },
    { id: 'count', label: 'Complete', description: 'Decide how many of the largest gardens to complete.' },
    { id: 'search', label: 'Search', description: 'Binary search the best minimum for the smallest incomplete garden.' },
    { id: 'probe', label: 'Test', description: 'Test a candidate minimum against the remaining flowers.' },
    { id: 'candidate', label: 'Candidate', description: 'Score this choice of complete gardens.' },
    { id: 'all', label: 'All complete', description: 'Every garden reaches the target.' },
    { id: 'done', label: 'Result', description: 'Return the best candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"flowers":[3,1,6],"newFlowers":9,"target":7,"full":4,"partial":2}',
  url: 'https://leetcode.com/problems/maximum-total-beauty-of-the-gardens/',
  complexity: 'O(n log n + n * n * log target) time with the simple inner loop shown here. The visualization caps gardens at 8 and values at 20.',
  examples: [
    { label: 'Mixed', input: '{"flowers":[3,1,6],"newFlowers":9,"target":7,"full":4,"partial":2}' },
    { label: 'Few flowers', input: '{"flowers":[5,5,2],"newFlowers":4,"target":6,"full":3,"partial":1}' },
  ],
}

export default function MaximumTotalBeauty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = step.f.length
    return <>
      <IndexedSequence label="sorted gardens" length={n} valueAt={i => step.f[i]} active={step.at}
        roleAt={i => (i >= n - step.complete ? 'complete' : 'incomplete')} />
      {step.range && <AnswerRangeBar title="Smallest incomplete garden" min={step.f[0]} max={Math.max(step.f[0], run.input.target - 1)}
        low={step.range.lo} high={step.range.hi} probe={step.range.probe} verdict={step.range.verdict} />}
      <output aria-label="Beauty">{step.value === undefined ? `complete gardens ${step.complete}` : `beauty ${step.value}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Completing a garden is cheapest for the ones already closest to the target, so for any number of complete gardens, pick the largest ones.</p>
    <p>The leftover flowers go to the smallest incomplete garden. The best minimum is found by binary search: a candidate works if raising every incomplete garden to it fits in the leftover budget.</p>
  </>} />
}
