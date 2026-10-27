import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty forest and the root.' },
    { id: 'visit', label: 'Walk node', description: 'Decide whether this node is deleted and pass that on to its children.' },
    { id: 'root', label: 'New tree', description: 'A kept node whose parent was deleted becomes the root of a new tree.' },
    { id: 'done', label: 'Forest', description: 'Report the roots of the remaining trees.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level-order array of distinct values 1 to 15) and to_delete (up to 6 distinct values) (JSON)',
  url: 'https://leetcode.com/problems/delete-nodes-and-return-forest/',
  complexity: 'O(n) time for n nodes, plus O(d) for the delete set. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[1,2,3,4,5,6,7],"to_delete":[3,5]}' },
    { label: 'Example 2', input: '{"root":[1,2,4,null,3],"to_delete":[3]}' },
  ],
}

export default function DeleteNodesReturnForest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.deleted.forEach(id => { roles[id] = 'pruned' })
    step.roots.forEach(id => { roles[id] = 'match' })
    if (step.active !== null) roles[step.active] = 'active'
    return <>
      <BinaryTreeLane title="Tree (deleted values are pruned)" root={run.display} roles={roles} />
      <output aria-label="Forest so far">{`Tree roots so far: ${step.roots.map(id => `node ${id}`).join(', ') || 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Deleting a node splits the tree: its surviving children each become the root of a separate tree.</p>
    <p>A single top-down walk records which nodes start a new tree, so every surviving node is reported exactly once.</p>
  </>} />
}
