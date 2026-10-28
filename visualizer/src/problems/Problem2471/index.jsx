import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero total swaps at the root.' },
    { id: 'level', label: 'Level', description: 'Count the swaps that sort this level.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level order, distinct values) (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-sort-a-binary-tree-by-level/',
  complexity: 'O(n log n) time and O(n) space for n nodes. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[1,4,3,7,6,8,5]}' },
    { label: 'Example 2', input: '{"root":[1,3,2,7,null,5,4]}' },
  ],
}

export default function SortTreeLevels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.ids) roles[id] = 'active'
    return <>
      <BinaryTreeLane title="Tree (values)" root={run.root} roles={roles} />
      <output aria-label="Level swaps">{step.depth >= 0 ? `Level ${step.depth}: [${step.values.join(', ')}], ${step.swaps} swap(s), total ${step.total}` : `Total ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Within one level, the cheapest sort uses one swap per element outside each cycle of the permutation that maps values to their sorted positions.</p>
    <p>Levels are independent, so the answer is the sum of the per-level costs.</p>
  </>} />
}
