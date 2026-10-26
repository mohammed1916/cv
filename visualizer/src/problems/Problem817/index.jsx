import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Build the value set.' },
    { id: 'open', label: 'Open component', description: 'A set node follows a non-set node.' },
    { id: 'extend', label: 'Extend', description: 'A set node continues the run.' },
    { id: 'close', label: 'Close', description: 'A non-set node ends the run.' },
    { id: 'done', label: 'Complete', description: 'Return the component count.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Object {head, nums} (JSON)',
  url: 'https://leetcode.com/problems/linked-list-components/',
  complexity: 'O(n + m) time and O(m) space for the set.',
  examples: [
    { label: 'Example 1', input: '{"head":[0,1,2,3],"nums":[0,1,3]}' },
    { label: 'Example 2', input: '{"head":[0,1,2,3,4],"nums":[0,3,1,4]}' },
    { label: 'Alternating', input: '{"head":[5,6,7,8,9,10],"nums":[5,7,9]}' },
  ],
}
const roleOf = mark => (mark === 'start' || mark === 'inside' ? 'match' : mark === 'gap' ? 'removed' : '')
export default function LinkedListComponents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nodes = run.input.head.map((value, i) => ({ id: i, value }))
    const roles = {}
    step.marks.forEach((m, i) => { if (roleOf(m)) roles[i] = roleOf(m) })
    if (step.index >= 0) roles[step.index] = 'active'
    return <>
      <LinkedListLane title="List (green = in nums, grey = not in nums)" nodes={nodes} roles={roles} pointers={step.index >= 0 ? [{ id: step.index, label: 'cur' }] : []} />
      <output aria-label="Component count">Components: {step.count}; in a run: {step.inRun ? 'yes' : 'no'}; nums = [{run.input.nums.join(', ')}]</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why count run starts:</strong> every component has exactly one first node, the one in nums whose predecessor is missing or not in nums. One pass with a boolean is enough.</p>
  </>} />
}
