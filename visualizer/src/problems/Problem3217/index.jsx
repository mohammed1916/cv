import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'set', label: 'Build set', description: 'Collect the forbidden values into a set.' },
    { id: 'skip', label: 'Delete', description: 'The node value is forbidden, so the node is removed.' },
    { id: 'keep', label: 'Keep', description: 'The node value is allowed, so it stays.' },
    { id: 'done', label: 'Complete', description: 'Report the remaining list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and head arrays (JSON)',
  url: 'https://leetcode.com/problems/delete-nodes-from-linked-list-present-in-array/',
  complexity: 'O(m + n) time and O(m) space for m values in nums and n list nodes.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"head":[1,2,3,4,5]}' },
    { label: 'Example 2', input: '{"nums":[1],"head":[1,2,1,2,1,2]}' },
  ],
}

export default function DeleteNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nodes = run.input.head.map((value, id) => ({ id, value }))
    const roles = {}
    nodes.forEach(node => { roles[node.id] = step.removed[node.id] ? 'removed' : 'kept' })
    if (step.i >= 0 && step.i < nodes.length) roles[step.i] = 'active'
    return <>
      <LinkedListLane title="Linked list" nodes={nodes} roles={roles} />
      <output aria-label="Remaining">{`Remaining values: ${step.kept.join(', ') || 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Checking membership in a set takes constant time, so one pass over the list is enough.</p>
    <p>Only the removed nodes change the list, so the kept values keep their original order.</p>
  </>} />
}
