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
    { label: 'Deepest value on the right', input: '[9,4,15,2,6,null,20,1,null,null,null,null,null,null,30]' },
    { label: 'Left-heavy sum tree', input: '[12,7,18,3,9,null,25,1,null,null,5]' },
    { label: 'Single root', input: '[7]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Long run: 15 entries', input: '[63,45,null,25,61,null,null,78,null,null,73,null,null,null,75]' },
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
