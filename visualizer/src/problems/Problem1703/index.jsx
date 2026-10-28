import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Positions', description: 'List the index of every one.' },
    { id: 'window', label: 'Window', description: 'Gather one window of k ones around its median.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (0 and 1 values) and k',
  url: 'https://leetcode.com/problems/minimum-adjacent-swaps-for-k-consecutive-ones/',
  complexity: 'O(n log n) time for the sorting-free scan with prefix idea; the visualization is O(n * k) and caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,0,0,1,0,1],"k":2}' },
    { label: 'Example 2', input: '{"nums":[1,0,0,0,0,0,1,1],"k":3}' },
  ],
}

export default function MinimumAdjacentSwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} roleAt={index => (step.marked.includes(index) ? 'window' : '')} />
    <output aria-label="Best cost">{`Best cost so far: ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the relative order of the ones matters, so compare windows of k consecutive ones.</p>
    <p>Gathering k ones costs the sum of distances to a common block, and moving them to the median one is cheapest.</p>
  </>} />
}
