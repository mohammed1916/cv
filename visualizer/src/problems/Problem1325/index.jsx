import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the root and work up from the leaves.' },
    { id: 'visit', label: 'Check node', description: 'Children first, then decide whether this node is a removable leaf.' },
    { id: 'remove', label: 'Remove leaf', description: 'A leaf with the target value is removed, which can expose its parent.' },
    { id: 'done', label: 'Result', description: 'Report the remaining tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level-order array, values 1 to 4, null for missing) and target (1 to 4) (JSON)',
  url: 'https://leetcode.com/problems/delete-leaves-with-a-given-value/',
  complexity: 'O(n) time and O(h) stack space for n nodes. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[1,2,3,2,null,2,4],"target":2}' },
    { label: 'Example 2', input: '{"root":[1,3,3,3,2],"target":3}' },
  ],
}

export default function DeleteLeavesGivenValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.pruned.forEach(id => { roles[id] = 'pruned' })
    if (step.active !== null) roles[step.active] = 'active'
    return <>
      <BinaryTreeLane title="Tree before deletion" root={run.display} roles={roles} />
      <output aria-label="Result so far">{`Remaining in level order: ${JSON.stringify(step.phase === 'done' ? run.result : '(in progress)')}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A node can only be removed after its children have been decided, because removing a leaf may turn its parent into a new leaf.</p>
    <p>The walk goes bottom-up, so one pass removes every chain of target-valued nodes.</p>
  </>} />
}
