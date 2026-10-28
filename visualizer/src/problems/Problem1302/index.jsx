import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin with the root as level 0.' },
    { id: 'level', label: 'Level sum', description: 'Add up the values on this level.' },
    { id: 'done', label: 'Deepest', description: 'Return the sum of the last non-empty level.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree values (JSON level-order array, null for a missing child)',
  url: 'https://leetcode.com/problems/deepest-leaves-sum/',
  complexity: 'O(n) time and O(w) space for the widest level. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,5,null,6,7,null,null,null,null,8]' },
    { label: 'Example 2', input: '[6,7,8,2,7,1,3,9,null,1,4,null,null,null,5]' },
  ],
}

export default function DeepestLeaves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.ids) roles[id] = 'active'
    return <>
      <BinaryTreeLane title="Tree (values)" root={run.root} roles={roles} />
      <output aria-label="Level sum">{`Depth ${step.depth}, level sum ${step.sum}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the last non-empty level counts as the deepest, so each level replaces the previous running total.</p>
    <p>Breadth-first order visits one level at a time, which makes the deepest level the final one reached.</p>
  </>} />
}
