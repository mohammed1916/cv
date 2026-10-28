import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the full array and nothing at the front.' },
    { id: 'remove', label: 'Remove pair', description: 'Remove two of the first three elements for the cheapest total.' },
    { id: 'finish', label: 'Finish', description: 'Fewer than three remain, so remove them together.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums, for example {"nums": [6,2,8,4]}',
  url: 'https://leetcode.com/problems/find-minimum-cost-to-remove-array-elements/',
  complexity: 'O(n^2) states with O(1) work each. The visualization caps n at 60.',
  examples: [
    { label: 'Example 1', input: '{"nums":[6,2,8,4]}' },
    { label: 'Example 2', input: '{"nums":[2,1,3,3]}' },
  ],
}

export default function RemoveArrayCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.next < run.input.nums.length ? step.next : -1} roleAt={index => (index < step.next ? 'removed' : '')} />
    <output aria-label="Running cost">{`Cost so far: ${step.cost}, leftover at front: ${step.front >= 0 ? run.input.nums[step.front] : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each move removes two of the first three remaining elements and pays the larger of the two.</p>
    <p>The element not removed stays at the front, so the state is just the front and the next unread position.</p>
  </>} />
}
