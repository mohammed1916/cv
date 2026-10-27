import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'prefix', label: 'Running sums', description: 'Add up the values from the head to each node.' },
    { id: 'skip', label: 'Cut run', description: 'Two equal running sums bound a run that sums to zero.' },
    { id: 'keep', label: 'Keep node', description: 'This node is not part of a zero-sum run.' },
    { id: 'done', label: 'Complete', description: 'Report the values that remain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a head array of values (JSON)',
  url: 'https://leetcode.com/problems/remove-zero-sum-consecutive-nodes-from-linked-list/',
  complexity: 'O(n) time and O(n) space with a hash map of running sums.',
  examples: [
    { label: 'Example 1', input: '{"head":[1,2,-3,3,1]}' },
    { label: 'Example 2', input: '{"head":[1,2,3,-3,4]}' },
  ],
}

export default function ZeroSumNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nodes = run.input.head.map((value, id) => ({ id, value }))
    const roles = {}
    nodes.forEach(node => { roles[node.id] = step.removed[node.id] ? 'removed' : 'kept' })
    return <LinkedListLane title="Linked list" nodes={nodes} roles={roles} pointers={step.k < nodes.length ? [{ label: 'k', id: step.k }] : []} />
  }} renderReasoning={() => <>
    <p>If two prefix sums are equal, the nodes between them sum to zero and can be removed together.</p>
    <p>Jumping to the last node with the same prefix sum removes the longest such run in one step.</p>
  </>} />
}
