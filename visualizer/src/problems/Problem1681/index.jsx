import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'The empty set of elements costs nothing.' },
    { id: 'mask', label: 'Set of elements', description: 'Choose the group that holds the lowest element and reuse the best split of the rest.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total incompatibility.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums and k, where k divides the length)',
  url: 'https://leetcode.com/problems/minimum-incompatibility/',
  complexity: 'O(3^n) submask enumeration over 2^n masks. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[3,4,3,6],"k":4}' },
    { label: 'Own case 2', input: '{"nums":[10,7,12,5,7,5,6,6],"k":8}' },
    { label: 'Single value', input: '{"nums":[5],"k":1}' },
    { label: 'Equal values', input: '{"nums":[2,2,2,2],"k":2}' },
    { label: 'Largest length', input: '{"nums":[16,1,16,1,16,1,16,1],"k":4}' },
    { label: 'Long run: 8 values', input: '{"nums":[4,12,6,3,12,11,6,12],"k":2}' },
  ],
}

export default function Incompatibility() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.nums.length} valueAt={i => run.nums[i]}
      roleAt={i => (step.group & (1 << i) ? 'group' : step.mask & (1 << i) ? 'in set' : '')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each set of elements is a bitmask. The lowest element in a set must sit in some group, so trying every group that contains it covers every split.</p>
    <p>A group is valid only when its values are all different, and its incompatibility is its largest value minus its smallest.</p>
  </>} />
}
