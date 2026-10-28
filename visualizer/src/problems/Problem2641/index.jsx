import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'The root has no cousins, so its value becomes zero.' },
    { id: 'level', label: 'Level total', description: 'Add up every value on this level.' },
    { id: 'node', label: 'Node', description: 'Subtract this node’s sibling group from the level total.' },
    { id: 'done', label: 'Complete', description: 'Return the replaced values in array layout.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root as a level-order array (JSON)',
  url: 'https://leetcode.com/problems/cousins-in-binary-tree-ii/',
  complexity: 'O(n) time and O(n) space for n nodes. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[5,4,9,1,10,null,7]}' },
    { label: 'Example 2', input: '{"root":[3,1,2]}' },
  ],
}

export default function CousinsSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    for (const id of step.ids) roles[id] = 'active'
    for (const [id, value] of Object.entries(step.updated)) tags[id] = `→ ${value}`
    return <>
      <BinaryTreeLane title="Tree (original values)" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Level total">{step.total === null ? 'Waiting for the next level' : `Level total ${step.total}${step.group !== null ? `, sibling group ${step.group}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Cousins are nodes at the same depth with a different parent, so the new value is the level total minus the node’s own sibling group.</p>
    <p>The root has no cousins, which makes its replacement zero.</p>
  </>} />
}
