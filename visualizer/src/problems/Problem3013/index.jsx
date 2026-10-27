import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The first subarray always costs nums[0].' },
    { id: 'scan', label: 'Scan starts', description: 'Try each position as the second start and pick the cheapest window values.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: nums (1-20 each), k and dist',
  url: 'https://leetcode.com/problems/divide-an-array-into-subarrays-with-minimum-cost-ii/',
  complexity: 'O(n * dist * log dist) time for this scan. A sliding window with two heaps is faster. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example', input: '{"nums":[1,3,2,6,4,2],"k":3,"dist":3}' },
    { label: 'Adjacent', input: '{"nums":[5,1,9,1],"k":3,"dist":1}' },
  ],
}

export default function SubarrayMinimumCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.s ?? -1}
      roleAt={i => (step.window.length && i >= step.window[0] && i <= step.window[1] ? 'window' : '')} />
    <output aria-label="Best total">{`Best total so far: ${step.best === null ? '-' : step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The chosen starts must all fall within dist of the second start, so each candidate start owns a window of positions, and the cheapest values in that window are taken.</p>
  </>} />
}
